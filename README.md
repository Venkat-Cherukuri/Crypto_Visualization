
# Global Cryptocurrency Trends and Insights

## Course
CIS-568: Data Visualization  
Name: Venkat Cherukuri  
Student ID: 02146190  

---

## Project Overview

This project presents a comprehensive and interactive suite of visualizations that explore global cryptocurrency activity. By combining spatial, temporal, and comparative data views, it offers insights into both country-level and coin-level engagement with cryptocurrencies.

### Built Visualizations:

1. Crypto Globe  
   - A 3D rotating globe that allows users to click on any country to explore its crypto adoption rank, wallet usage, regulations, ATMs, and more.
   - Includes integrated volume bar charts for each country, and a search function to find countries instantly.

2. Radar Chart  
   - A comparative tool that displays seven normalized national crypto metrics, including CBDC development, mining share, and NFT adoption.
   - Interactive with animated tooltips, country flag rendering, and dynamic scaling.

3. Line Chart Dashboard  
   - Users can select from 20+ coins and visualize Close Price, Volume, or Market Cap over time.
   - Features zooming, brushing, tooltips, and a dropdown filter.

---

## Folder Structure

```
project-folder/
├── Crypto_dataset/
│   ├── Global_data.csv
│   ├── coin_Bitcoin.csv
│   ├── coin_Ethereum.csv
│   └── ... (20+ coin files)
├── globe.html
├── globe.css
├── globe.js
├── radar.html
├── index.html
├── script.js
├── style.css
└── DV_Project.pptx
```

---

## How to Run the Visualizations

1. Download and unzip the project folder.
2. Open the following HTML files directly in a browser:
   - `globe.html` to launch the Crypto Globe
   - `radar.html` to launch the Radar Chart
   - `index.html` to launch the Line Chart Dashboard
3. No server or backend setup is required.

---

## How to Read Each Visualization

### Crypto Globe
- Hover to see adoption scores.
- Click a country to view detailed metrics and a trading volume bar chart.
- Search to instantly highlight countries.
- Rotate or auto-spin to explore globally.

### Radar Chart
- Select a country to compare normalized metrics.
- Visualizes 7 crypto attributes: adoption, wallet usage, mining share, education, ATMs, NFT adoption, CBDC.

### Line Chart Dashboard
- Choose a coin and metric to view time-series data.
- Interactive with zoom, tooltip, and brush controls for close analysis.

---

## Tools and Libraries Used

- D3.js v7 – Data visualization and chart rendering
- Chart.js – Radar chart visualization
- TopoJSON – Globe rendering with country borders
- HTML, CSS, JavaScript
- Google Fonts (Poppins) – Clean modern typography

---

## Visual Snapshots

- Line chart with dropdown for coin and metric
- Rotating globe with search and data panel
- Radar chart with tooltips and flag indicators

---

## Features

- Auto-rotating 3D globe
- Country-based crypto data
- Real-time interactions
- Cross-country comparison
- Volume chart linked to selected country
- Search, hover, and zoom capabilities

---

## Conclusion

This project provides a robust, interactive analysis of global cryptocurrency dynamics through three coordinated visualizations. It enables users to examine country-level policy, adoption, and trading activity, while also exploring long-term coin trends. This platform offers value to analysts, researchers, and educators by making complex datasets intuitive, engaging, and insightful.

---

## Future Improvements

- Integrate real-time API data from CoinGecko or CoinMarketCap
- Add sentiment metrics from news or Twitter
- Support raw vs normalized views in radar charts
- Country comparison view in radar mode


---

## Screenshots in DV_Project.pptx

The PowerPoint presentation includes:
- Interface walkthroughs
- Visual examples of interaction
- Feature explanations

---

