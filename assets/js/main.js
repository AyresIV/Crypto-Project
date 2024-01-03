var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import reduceCoins from './reducers/coins.js';
import Cache from './Cache.js';
import { setupEventListeners } from './event-Listener/eventListener.js';
import { CryptoChart } from './chart.js';
const cache = Cache.getInstance();
const selectedCoins = new Set();
const cryptoChart = new CryptoChart();
const addedCoins = new Set();
export function getCoins() {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheResponse = yield cache.getData('https://api.coingecko.com/api/v3/coins/list');
        return cacheResponse;
    });
}
function getCoinData(coinId) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheResponse = yield cache.getData(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        return cacheResponse;
    });
}
export function coinsContainerClicked(e) {
    if (!(e.target instanceof HTMLElement))
        return;
    const element = e.target;
    if (element.tagName === 'INPUT' && element.type === 'checkbox') {
        console.log('Toggle clicked:', element);
        handleCheckboxToggle(element);
    }
    else if (element.id.startsWith('more-info-')) {
        const coinId = element.id.substring('more-info-'.length);
        displayCoinData(coinId);
    }
}
function handleCheckboxToggle(checkbox) {
    const coinId = checkbox.id.substring('toggle-'.length);
    if (checkbox.checked && selectedCoins.size >= 5) {
        handleSwitchCoins(coinId);
    }
    else {
        updateSelectedCoins(coinId, checkbox.checked);
    }
}
function updateSelectedCoins(coinId, isChecked) {
    if (isChecked) {
        selectedCoins.add(coinId);
        addCoinToLiveReports(coinId);
    }
    else {
        selectedCoins.delete(coinId);
        removeCoinFromLiveReports(coinId);
    }
    console.log(`Selected coins: ${Array.from(selectedCoins).join(', ')}`);
    cryptoChart.updateSelectedCoins(selectedCoins);
    localStorage.setItem('selectedCoins', JSON.stringify(Array.from(selectedCoins)));
}
function displayCoinData(coinId) {
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
function addCoinToLiveReports(coinId) {
    if (!addedCoins.has(coinId)) {
        const coinCard = document.getElementById(`coin-card-${coinId}`);
        if (coinCard) {
            const clone = coinCard.cloneNode(true);
            clone.id = `live-report-${coinId}`;
            document.getElementById('live-reports').appendChild(clone);
        }
        addedCoins.add(coinId);
    }
}
function removeCoinFromLiveReports(coinId) {
    const liveReport = document.getElementById(`live-report-${coinId}`);
    if (liveReport) {
        liveReport.remove();
        const homeTabCheckbox = document.getElementById(`toggle-${coinId}`);
        if (homeTabCheckbox) {
            homeTabCheckbox.checked = false;
        }
        cryptoChart.stopChartForCoin(coinId);
        selectedCoins.delete(coinId);
        console.log(`The "${coinId}" Coin was removed from The live reports, and the chart updates will be stopped.`);
    }
}
function handleSwitchCoins(newCoinId) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentSelectedCoins = Array.from(selectedCoins);
        const coinToRemove = yield promptForCoinToRemove(currentSelectedCoins);
        if (coinToRemove) {
            selectedCoins.delete(coinToRemove);
            console.log(`The "${coinToRemove}" Coin was removed from The live reports, and the chart updates will be stopped.`);
            selectedCoins.add(newCoinId);
            console.log(`The Coin "${coinToRemove}" has been replaced with "${newCoinId}"`);
            updateUIAndCharts(coinToRemove, newCoinId);
        }
    });
}
function updateUIAndCharts(removedCoinId, addedCoinId) {
    removeCoinFromLiveReports(removedCoinId);
    addCoinToLiveReports(addedCoinId);
    cryptoChart.updateChart();
    alert(`The Coin "${removedCoinId}" has been replaced with "${addedCoinId}"`);
}
function promptForCoinToRemove(coinsArray) {
    let userChoice = null;
    while (userChoice === null) {
        const userInput = prompt(`You can only select up to 5 Coins. Choose a Coin to remove or be replaced:\n${coinsArray.join(', ')}`);
        if (userInput === null) {
            break;
        }
        const normalizedInput = userInput.trim().toLowerCase();
        if (coinsArray.includes(normalizedInput)) {
            userChoice = normalizedInput;
        }
        else {
            alert(`Choose Coins from the list only.`);
        }
    }
    return userChoice;
}
function displayCoins(coinsToDisplay) {
    const html = reduceCoins(coinsToDisplay);
    document.getElementById('coins-container').innerHTML = html;
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    setupEventListeners(selectedCoins);
    const coins = yield getCoins();
    displayCoins(coins.slice(0, 100));
}))();
export { addCoinToLiveReports, removeCoinFromLiveReports, displayCoins, addedCoins };
