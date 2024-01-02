import CoinData from './interfaces/coin-data.js';
import Coin from './interfaces/coin.js';
import reduceCoins from './reducers/coins.js';
import Cache from './Cache.js';
import { setupEventListeners } from './event-Listener/eventListener.js';
import { CryptoChart } from './chart.js';

const cache = Cache.getInstance();
const selectedCoins = new Set<string>();
const cryptoChart = new CryptoChart();
const addedCoins = new Set<string>();

export async function getCoins(): Promise<Coin[]> {
    const cacheResponse = await cache.getData('https://api.coingecko.com/api/v3/coins/list');
    return cacheResponse as Coin[];
}

async function getCoinData(coinId: string): Promise<CoinData> {
    const cacheResponse = await cache.getData(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    return cacheResponse as CoinData;
}

export function coinsContainerClicked(e: MouseEvent) {
    if (!(e.target instanceof HTMLElement)) return;

    const element = e.target as HTMLElement;

    if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'checkbox') {
        console.log('Toggle clicked:', element);
        handleCheckboxToggle(element as HTMLInputElement);
    } else if (element.id.startsWith('more-info-')) {
        const coinId = element.id.substring('more-info-'.length);
        displayCoinData(coinId);
    }
}

function handleCheckboxToggle(checkbox: HTMLInputElement) {
    const coinId = checkbox.id.substring('toggle-'.length);

    if (checkbox.checked && selectedCoins.size >= 5) {
        handleSwitchCoins(coinId);
    } else {
        updateSelectedCoins(coinId, checkbox.checked);
    }
}

function updateSelectedCoins(coinId: string, isChecked: boolean) {
    if (isChecked) {
        selectedCoins.add(coinId);
        addCoinToLiveReports(coinId);
    } else {
        selectedCoins.delete(coinId);
        removeCoinFromLiveReports(coinId);
    }

    console.log(`Selected coins: ${Array.from(selectedCoins).join(', ')}`);
    cryptoChart.updateSelectedCoins(selectedCoins);
    localStorage.setItem('selectedCoins', JSON.stringify(Array.from(selectedCoins)));
}

function displayCoinData(coinId: string) {
    getCoinData(coinId).then(coinData => {
        console.log(coinData);
        const dataContainer = document.getElementById(`data-container-${coinId}`);
        if (dataContainer) {
            dataContainer.innerHTML = `
                <img src="${coinData.image.thumb}"/> <br>
                USD: ${coinData.market_data.current_price.usd}$ <br>
                EUR: ${coinData.market_data.current_price.eur}€ <br>
                ILS: ${coinData.market_data.current_price.ils}₪
            `;
        }
    });
}

function addCoinToLiveReports(coinId: string) {
    if (!addedCoins.has(coinId)) {
        const coinCard = document.getElementById(`coin-card-${coinId}`);
        if (coinCard) {
            const clone = coinCard.cloneNode(true) as HTMLElement;
            clone.id = `live-report-${coinId}`;
            document.getElementById('live-reports').appendChild(clone);
        }
        addedCoins.add(coinId);
    }
}

function removeCoinFromLiveReports(coinId: string) {
    const liveReport = document.getElementById(`live-report-${coinId}`);
    if (liveReport) {
        liveReport.remove();
        const homeTabCheckbox = document.getElementById(`toggle-${coinId}`) as HTMLInputElement;
        if (homeTabCheckbox) {
            homeTabCheckbox.checked = false;
        }
        cryptoChart.stopChartForCoin(coinId);
        selectedCoins.delete(coinId);
        console.log(`The Coin "${coinId}" has been removed from The live reports, and chart updates have been stopped.`);
    }
}

async function handleSwitchCoins(newCoinId: string) {
    const currentSelectedCoins = Array.from(selectedCoins);
    const coinToRemove = await promptForCoinToRemove(currentSelectedCoins);

    if (coinToRemove) {
        selectedCoins.delete(coinToRemove);
        console.log(`The Coin "${coinToRemove}" has been removed from The live reports, and chart updates have been stopped.`);

        selectedCoins.add(newCoinId);
        console.log(`The Coin "${coinToRemove}" has been replaced with "${newCoinId}"`);

        updateUIAndCharts(coinToRemove, newCoinId);
    }
}

function updateUIAndCharts(removedCoinId: string, addedCoinId: string) {
    removeCoinFromLiveReports(removedCoinId);
    addCoinToLiveReports(addedCoinId);
    cryptoChart.updateChart();
    alert(`The Coin "${removedCoinId}" has been replaced with "${addedCoinId}"`);
}

function promptForCoinToRemove(coinsArray: string[]): string | null {
    let userChoice: string | null = null;

    while (userChoice === null) {
        const userInput = prompt(
            `You can only select up to 5 Coins. Choose a Coin to remove or be replaced:\n${coinsArray.join(', ')}`
        );

        if (userInput === null) {
            break;
        }

        const normalizedInput = userInput.trim().toLowerCase();

        if (coinsArray.includes(normalizedInput)) {
            userChoice = normalizedInput;
        } else {
            alert(`Choose Coins from the list only.`);
        }
    }

    return userChoice;
}

function displayCoins(coinsToDisplay: Coin[]) {
    const html = reduceCoins(coinsToDisplay);
    document.getElementById('coins-container').innerHTML = html;
}

(async () => {
    setupEventListeners(selectedCoins);
    const coins = await getCoins();
    displayCoins(coins.slice(0, 100));
})();

export {
    addCoinToLiveReports,
    removeCoinFromLiveReports,
    displayCoins,
    addedCoins
};
