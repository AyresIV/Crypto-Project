import CoinData from './interfaces/coin-data.js';

declare var CanvasJS: any;

class CryptoChart {
  public chart: any; 
  public selectedCoins: Set<string>;
  public ignoredCoins: Set<string> = new Set();


  public stopChartForCoin(coinId: string) {
    const coinSeries = this.chart.data.find(series => series.name === coinId);
    if (coinSeries) {
        coinSeries.visible = false;
        this.chart.render();
        this.ignoredCoins.add(coinId);
    }
  }
    public resumeChartForCoin(coinId: string) {
      const coinSeries = this.chart.data.find(series => series.name === coinId);
      if (coinSeries) {
          coinSeries.visible = true;
          this.chart.render();
          this.ignoredCoins.delete(coinId);
      }
}
  constructor() {
    this.selectedCoins = new Set();

    this.chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      title: {
        text: "Cryptocurrency Prices"
      },
      axisY: {
        title: "Price (in USD)",
        prefix: "$"
      },
      legend: {
        cursor: "pointer",
        fontSize: 16,
        itemclick: this.toggleDataSeries.bind(this)
      },
      toolTip: {
        shared: true
      },
      data: []
    });

    this.chart.render();

    setInterval(() => this.updateChart(), 2000); // every 20 sec
  }

  public updateSelectedCoins(coins: Set<string>) {
    this.selectedCoins = coins;
    this.updateChart();
  }

  public updateChart() {
    console.log('Fetching data...');

    if (this.selectedCoins.size === 0) {
        console.warn('No selected coins, skipping chart update.');
        this.chart.options.data = [];
        this.chart.render();
        console.log('Data fetch complete.');
        return;
    }

    const coinIds = Array.from(this.selectedCoins).join(",");
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);

            const seriesArray = [];

            for (const coinData of data) {
                const coin: CoinData = coinData;

                const price = coinData.current_price;

                if (price !== undefined) {
                    const dataPoints = [];
                    for (let i = 0; i < 10; i++) {
                        dataPoints.push({ x: i, y: price });
                    }

                    const color = this.getRandomColor();

                    const newSeries = {
                        type: "line",
                        showInLegend: true,
                        name: coin.name, 
                        color: color,
                        dataPoints: dataPoints
                    };
                    seriesArray.push(newSeries);
                } else {
                    console.warn(`USD data not available for coin ${coin.symbol}. Skipping.`, coinData);
                }
            }

            if (seriesArray.length === 0) {
                console.warn('No valid data for selected coins. Clearing the chart.');
                this.chart.options.data = [];
            } else {
                this.chart.options.data = seriesArray;
            }

            this.chart.render();
            console.log('Data fetch complete.');
        })
        .catch(error => console.error('Error fetching data:', error));
}

  public toggleDataSeries(e: { dataSeries: { visible: boolean; }; }): void {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
  }

  public getRandomColor(): string {
    const randomHexDigit = () => Math.floor(Math.random() * 16).toString(16);

    const color = `#${randomHexDigit()}${randomHexDigit()}${randomHexDigit()}${randomHexDigit()}${randomHexDigit()}${randomHexDigit()}`;

    return color;
}

}

export { CryptoChart };
