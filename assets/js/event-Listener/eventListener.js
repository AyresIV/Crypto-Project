var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import reduceCoins from '../reducers/coins.js';
import { getCoins, coinsContainerClicked } from '../main.js';
import { removeCoinFromLiveReports } from '../main.js';
import { CryptoChart } from '../chart.js';
import { addCoinToLiveReports } from '../main.js';
import { addedCoins } from '../main.js';
const cryptoChart = new CryptoChart();
export function setupEventListeners(selectedCoins) {
    const coinsContainer = document.getElementById('coins-container');
    const liveReportsContainer = document.getElementById('live-reports');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resetSearchButton = document.getElementById('reset-search-button');
    resetSearchButton === null || resetSearchButton === void 0 ? void 0 : resetSearchButton.addEventListener('click', resetSearch);
    function resetSearch() {
        return __awaiter(this, void 0, void 0, function* () {
            searchInput.value = '';
            addedCoins.clear();
            const coins = yield getCoins();
            displayCoins(coins.slice(0, 100));
            selectedCoins.forEach((coinId) => {
                const checkbox = document.getElementById(`toggle-${coinId}`);
                if (checkbox) {
                    checkbox.checked = true;
                    addCoinToLiveReports(coinId);
                }
            });
        });
    }
    coinsContainer.addEventListener('click', coinsContainerClicked);
    liveReportsContainer.addEventListener('click', liveReportsContainerClicked);
    searchButton === null || searchButton === void 0 ? void 0 : searchButton.addEventListener('click', searchCoins);
    function searchCoins() {
        return __awaiter(this, void 0, void 0, function* () {
            const coins = yield getCoins();
            const userInput = searchInput.value.trim().toLowerCase();
            if (userInput.length < 3) {
                alert('Please enter at least 3 characters for the search.');
                return;
            }
            const filteredCoins = coins.filter(coin => coin.symbol.toLowerCase().includes(userInput));
            if (filteredCoins.length === 0) {
                alert('No matching coins found.');
            }
            else {
                const searchedCoins = filteredCoins.slice(0, 100);
                displayCoins(searchedCoins);
            }
        });
    }
    function displayCoins(coinsToDisplay) {
        const html = reduceCoins(coinsToDisplay);
        coinsContainer.innerHTML = html;
        coinsToDisplay.forEach((coin) => {
            const coinId = coin.id;
            const checkbox = document.getElementById(`toggle-${coinId}`);
            if (checkbox) {
                checkbox.checked = selectedCoins.has(coinId);
                if (checkbox.checked) {
                    addedCoins.add(coinId);
                }
                else {
                    addedCoins.delete(coinId);
                }
            }
        });
    }
}
function liveReportsContainerClicked(e) {
    if (e.target instanceof HTMLElement) {
        const element = e.target;
        if (element.tagName === 'INPUT' && element.type === 'checkbox') {
            handleLiveReportsCheckboxToggle(element);
        }
    }
}
function handleLiveReportsCheckboxToggle(checkbox) {
    const coinId = checkbox.id.substring('toggle-'.length);
    if (!checkbox.checked) {
        removeCoinFromLiveReports(coinId);
        console.log(`Removed coin ${coinId} from live reports.`);
    }
    else {
        cryptoChart.resumeChartForCoin(coinId);
    }
}
