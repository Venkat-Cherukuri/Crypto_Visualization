const files = [
    { name: "XRP", path: "Crypto_dataset/coin_XRP.csv" },
    { name: "Wrapped Bitcoin", path: "Crypto_dataset/coin_WrappedBitcoin.csv" },
    { name: "Uniswap", path: "Crypto_dataset/coin_Uniswap.csv" },
    { name: "USD Coin", path: "Crypto_dataset/coin_USDCoin.csv" },
    { name: "Tron", path: "Crypto_dataset/coin_Tron.csv" },
    { name: "Tether", path: "Crypto_dataset/coin_Tether.csv" },
    { name: "Stellar", path: "Crypto_dataset/coin_Stellar.csv" },
    { name: "Solana", path: "Crypto_dataset/coin_Solana.csv" },
    { name: "Polkadot", path: "Crypto_dataset/coin_Polkadot.csv" },
    { name: "NEM", path: "Crypto_dataset/coin_NEM.csv" },
    { name: "Monero", path: "Crypto_dataset/coin_Monero.csv" },
    { name: "Litecoin", path: "Crypto_dataset/coin_Litecoin.csv" },
    { name: "IOTA", path: "Crypto_dataset/coin_Iota.csv" },
    { name: "Ethereum", path: "Crypto_dataset/coin_Ethereum.csv" },
    { name: "EOS", path: "Crypto_dataset/coin_EOS.csv" },
    { name: "Dogecoin", path: "Crypto_dataset/coin_Dogecoin.csv" },
    { name: "Crypto.com Coin", path: "Crypto_dataset/coin_CryptocomCoin.csv" },
    { name: "Cosmos", path: "Crypto_dataset/coin_Cosmos.csv" },
    { name: "ChainLink", path: "Crypto_dataset/coin_ChainLink.csv" },
    { name: "Cardano", path: "Crypto_dataset/coin_Cardano.csv" },
    { name: "Bitcoin", path: "Crypto_dataset/coin_Bitcoin.csv" },
    { name: "Binance Coin", path: "Crypto_dataset/coin_BinanceCoin.csv" },
    { name: "Aave", path: "Crypto_dataset/coin_Aave.csv" }
];

const datasets = {};

Promise.all(
    files.map(file =>
        d3.csv(file.path).then(data => {
            data.forEach(d => {
                d.Date = new Date(d.Date);
                d.Close = +d.Close;
                d.Open = +d.Open;
                d.High = +d.High;
                d.Low = +d.Low;
                d.Volume = +d.Volume;
                d.Marketcap = +d.Marketcap;
            });
            datasets[file.name] = data;
        })
    )
).then(() => {
    initializeDropdown();
});

function initializeDropdown() {
    const dropdown = d3.select("#coinSelector");
    files.forEach(file => {
        dropdown.append("option")
            .attr("value", file.name)
            .text(file.name);
    });

    const metricDropdown = d3.select("#metricSelector");

    dropdown.on("change", function () {
        const selectedCoin = dropdown.node().value;
        const selectedMetric = metricDropdown.node().value;
        drawLineChart(datasets[selectedCoin], selectedMetric);
    });

    metricDropdown.on("change", function () {
        const selectedCoin = dropdown.node().value;
        const selectedMetric = metricDropdown.node().value;
        drawLineChart(datasets[selectedCoin], selectedMetric);
    });

    drawLineChart(datasets[files[0].name], "Close");
}

function drawLineChart(data, selectedMetric) {
    const cleanData = data.filter(d => d[selectedMetric] && !isNaN(d[selectedMetric]) && d.Date);

    d3.select("#lineChart").selectAll("*").remove();

    const colorMap = {
        "Close": "steelblue",
        "Volume": "seagreen",
        "Marketcap": "darkorange"
    };

    const selectedColor = colorMap[selectedMetric] || "steelblue";

    const margin = { top: 40, right: 30, bottom: 110, left: 80 },
        margin2 = { top: 330, right: 30, bottom: 30, left: 80 },
        width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        height2 = 400 - margin2.top - margin2.bottom;

    const svg = d3.select("#lineChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime().domain(d3.extent(cleanData, d => d.Date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(cleanData, d => d[selectedMetric])]).nice().range([height, 0]);
    const x2 = d3.scaleTime().domain(x.domain()).range([0, width]);
    const y2 = d3.scaleLinear().domain(y.domain()).range([height2, 0]);

    const xAxis = d3.axisBottom(x).ticks(10);
    const xAxis2 = d3.axisBottom(x2).ticks(10);
    const yAxis = d3.axisLeft(y)
        .tickFormat(d => {
            if (d >= 1e9) return (d / 1e9).toFixed(1) + "B";
            if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
            if (d >= 1e3) return (d / 1e3).toFixed(1) + "K";
            return d;
        });

    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d[selectedMetric]));

    const area = d3.area()
        .x(d => x(d.Date))
        .y0(y(0))
        .y1(d => y(d[selectedMetric]));

    const line2 = d3.line()
        .x(d => x2(d.Date))
        .y(d => y2(d[selectedMetric]));

    const clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    const lineChart = svg.append("g")
        .attr("clip-path", "url(#clip)");

    const areaPath = lineChart.append("path")
        .datum(cleanData)
        .attr("fill", selectedColor)
        .attr("fill-opacity", 0.3)
        .attr("d", area);

    const mainLine = lineChart.append("path")
        .datum(cleanData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", selectedColor)
        .attr("stroke-width", 2)
        .attr("d", line);

    const tooltip = d3.select("#tooltip");

    const focus = svg.append("g")
        .attr("class", "focus");

    focus.selectAll("dot")
        .data(cleanData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d[selectedMetric]))
        .attr("r", 4)
        .attr("fill", selectedColor)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
                `<strong>Date:</strong> ${d.Date.toLocaleDateString()}<br/>
                <strong>${selectedMetric}:</strong> ${d[selectedMetric].toLocaleString()}`
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis")
        .call(xAxis)
        .call(g => g.selectAll(".tick line").attr("y2", -height).attr("stroke-opacity", 0.2))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 20) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .call(g => g.selectAll(".tick line").attr("x2", width).attr("stroke-opacity", 0.2));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(selectedMetric);

    const context = svg.append("g")
        .attr("transform", "translate(0," + (height + 40) + ")");

    context.append("path")
        .datum(cleanData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", selectedColor)
        .attr("stroke-width", 1)
        .attr("d", line2);

    context.append("g")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    const brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    const zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(0,0)')
        .on("wheel", (event) => event.preventDefault())
        .call(zoom);

    function brushed(event) {
        if (event.selection) {
            const s = event.selection || x2.range();
            x.domain(s.map(x2.invert, x2));
            updateChart();
        }
    }

    function zoomed(event) {
        if (event.transform) {
            const t = event.transform;
            x.domain(t.rescaleX(x2).domain());
            updateChart();
        }
    }

    function updateChart() {
        areaPath.transition().duration(1000).attr("d", area);
        mainLine.transition().duration(1000).attr("d", line);
        focus.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", d => x(d.Date))
            .attr("cy", d => y(d[selectedMetric]));
        svg.select(".x.axis").call(xAxis)
            .call(g => g.selectAll(".tick line").attr("y2", -height).attr("stroke-opacity", 0.2))
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");
    }
}
