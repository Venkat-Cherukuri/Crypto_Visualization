const width = window.innerWidth;
const height = window.innerHeight;

const projection = d3.geoOrthographic()
  .scale(height / 2.5)
  .translate([width / 2, height / 2])
  .clipAngle(90);

const path = d3.geoPath().projection(projection);
const svg = d3.select("#globe")
  .attr("width", width)
  .attr("height", height)
  .call(d3.drag()
    .on("start", dragStarted)
    .on("drag", dragged));

svg.append("circle")
  .attr("fill", "url(#ocean-gradient)")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", projection.scale());

const defs = svg.append("defs");
defs.append("radialGradient")
  .attr("id", "ocean-gradient")
  .selectAll("stop")
  .data([
    { offset: "0%", color: "#a0cbe8" },
    { offset: "100%", color: "#005fa3" }
  ])
  .enter()
  .append("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", d => d.color);

const tooltip = d3.select("#tooltip");
const volumeSvg = d3.select("#volume-chart");

let lastRotation = projection.rotate();
let lastPos = [0, 0];

function dragStarted(event) {
  lastPos = [event.x, event.y];
  lastRotation = projection.rotate();
}

function dragged(event) {
  const dx = event.x - lastPos[0];
  const dy = event.y - lastPos[1];
  const rotation = [lastRotation[0] + dx * 0.5, lastRotation[1] - dy * 0.5];
  projection.rotate(rotation);
  svg.selectAll("path").attr("d", path);
}

function pastelColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash >> 0) & 0x7F;
  const g = (hash >> 8) & 0x7F;
  const b = (hash >> 16) & 0x7F;
  return `rgb(${r + 128}, ${g + 128}, ${b + 128})`;
}

const availableCoins = [
  "coin_Bitcoin.csv", "coin_Ethereum.csv", "coin_ChainLink.csv",
  "coin_Cosmos.csv", "coin_CryptocomCoin.csv", "coin_Dogecoin.csv",
  "coin_EOS.csv", "coin_Cardano.csv", "coin_Iota.csv", "coin_Litecoin.csv",
  "coin_Monero.csv", "coin_NEM.csv", "coin_Polkadot.csv", "coin_Solana.csv",
  "coin_Stellar.csv", "coin_Tether.csv", "coin_Tron.csv", "coin_Uniswap.csv",
  "coin_USDCoin.csv", "coin_WrappedBitcoin.csv", "coin_Aave.csv",
  "coin_BinanceCoin.csv"
];

function assignCoinByHash(countryName) {
  let hash = 0;
  for (let i = 0; i < countryName.length; i++) {
    hash = countryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % availableCoins.length;
  return availableCoins[index];
}

Promise.all([
  d3.json("https://unpkg.com/world-atlas@2/countries-110m.json"),
  d3.csv("Crypto_dataset/Global_data.csv")
]).then(([world, data]) => {
  const countries = topojson.feature(world, world.objects.countries).features;
  const dataMap = new Map(data.map(d => [d.Country, d]));

  svg.selectAll("path")
    .data(countries)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => pastelColor(d.properties.name))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.3)
    .on("mouseover", function (event, d) {
      const info = dataMap.get(d.properties.name);
      if (!info) return;

      tooltip.html(`
        <strong>${d.properties.name}</strong><br>
        Rank: ${info.Adoption_Rank}<br>
        Score: ${info.Adoption_Score}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`)
        .style("opacity", 1);
    })
    .on("mouseout", () => tooltip.style("opacity", 0))
    .on("click", function (event, d) {
      const name = d.properties.name;
      const info = dataMap.get(name);
      const coin = assignCoinByHash(name);

      if (!info) {
        d3.select("#popup-content").html(`<h3>${name}</h3><p>No data available</p>`);
        d3.select("#popup-extended-info").html("");
        volumeSvg.selectAll("*").remove();
        return;
      }

      d3.select("#popup-content").html(`
        <h3>${name}</h3>
        <p><strong>Rank:</strong> ${info.Adoption_Rank}</p>
        <p><strong>Score:</strong> ${info.Adoption_Score}</p>
        <p><strong>Regulation:</strong> ${info.Regulation_Status}</p>
        <p><strong>Wallets:</strong> ${info.Wallet_Usage_Rate}</p>
        <p><strong>ATMs:</strong> ${info.Crypto_ATMs}</p>
      `);

      d3.select("#popup-extended-info").html(`
        <p><strong>Mining Share:</strong> ${info.Mining_Share}</p>
        <p><strong>Top Coins:</strong> ${info.Top_Coins}</p>
        <p><strong>Exchange:</strong> ${info.Major_Exchange}</p>
        <p><strong>Patents:</strong> ${info.Blockchain_Patents}</p>
        <p><strong>Hack Event:</strong> ${info.Major_Hack_Event}</p>
        <p><strong>Trend:</strong> ${info.Adoption_Trend}</p>
        <p><strong>Transaction Fee:</strong> $${info.Average_Transaction_Fee_USD}</p>
        <p><strong>Digital Law:</strong> ${info.Digital_Law_Clarity}</p>
        <p><strong>Education:</strong> ${info.Education_Initiatives}</p>
        <p><strong>Energy Source:</strong> ${info.Energy_Source}</p>
        <p><strong>NFTs:</strong> ${info.NFT_Adoption}</p>
        <p><strong>CBDC:</strong> ${info.CBDC_Development}</p>
      `);

      d3.csv(`Crypto_dataset/${coin}`).then(chartData => {
        const parsed = chartData.map(d => ({
          date: new Date(d.Date),
          volume: +d.Volume
        })).filter(d => !isNaN(d.volume));

        const margin = { top: 20, right: 10, bottom: 40, left: 60 },
              w = 350 - margin.left - margin.right,
              h = 300 - margin.top - margin.bottom;

        volumeSvg.selectAll("*").remove();

        const x = d3.scaleTime()
          .domain(d3.extent(parsed, d => d.date))
          .range([margin.left, w + margin.left]);

        const y = d3.scaleLinear()
          .domain([0, d3.max(parsed, d => d.volume)]).nice()
          .range([h + margin.top, margin.top]);

        volumeSvg.append("g")
          .attr("transform", `translate(0,${h + margin.top})`)
          .call(d3.axisBottom(x).ticks(5))
          .append("text")
          .attr("x", (w + margin.left) / 2)
          .attr("y", 35)
          .attr("fill", "#000")
          .attr("text-anchor", "middle")
          .text("Date");

        volumeSvg.append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -h / 2)
          .attr("y", -45)
          .attr("fill", "#000")
          .attr("text-anchor", "middle")
          .text("Volume");

        volumeSvg.selectAll("rect")
          .data(parsed)
          .enter()
          .append("rect")
          .attr("x", d => x(d.date))
          .attr("y", d => y(d.volume))
          .attr("width", 1.5)
          .attr("height", d => h + margin.top - y(d.volume))
          .attr("fill", "#0077cc");
      });
    });

  // Auto-spin logic
  let spinning = true;
  svg.on("mouseover", () => spinning = false)
     .on("mouseout", () => spinning = true);

  d3.timer(() => {
    if (spinning) {
      const rotate = projection.rotate();
      projection.rotate([rotate[0] + 0.1, rotate[1], rotate[2]]);
      svg.selectAll("path").attr("d", path);
    }
  });

  d3.select("#loading-spinner").style("display", "none");
});
