import Coin from '../assets/js/interfaces/coin.js';
import { getCoins, coinsContainerClicked, addCoinToLiveReports, removeCoinFromLiveReports, addedCoins } from '../assets/js/main.js';
import { CryptoChart } from '../assets/js/chart.js';
import reduceCoins from '../assets/js/reducers/coins.js';



const cryptoChart = new CryptoChart();

export function setupEventListeners(selectedCoins: Set<string>) {
    const coinsContainer = document.getElementById('coins-container');
    const liveReportsContainer = document.getElementById('live-reports');
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const searchButton = document.getElementById('search-button');
    const resetSearchButton = document.getElementById('reset-search-button');

    resetSearchButton?.addEventListener('click', resetSearch);

    async function resetSearch() {
        searchInput.value = '';

        addedCoins.clear();

        const coins = await getCoins();
        displayCoins(coins.slice(0, 100));

        selectedCoins.forEach((coinId) => {
            const checkbox = document.getElementById(`toggle-${coinId}`) as HTMLInputElement;
            if (checkbox) {
                checkbox.checked = true;
                addCoinToLiveReports(coinId);
            }
        });
    }

    coinsContainer?.addEventListener('click', coinsContainerClicked);
    liveReportsContainer?.addEventListener('click', liveReportsContainerClicked);

    searchButton?.addEventListener('click', searchCoins);

    async function searchCoins() {
        const coins = await getCoins();
        const userInput = searchInput.value.trim().toLowerCase();

        if (userInput.length < 3) {
            alert('Please enter at least 3 characters for the search.');
            return;
        }

        const filteredCoins = coins.filter((coin: Coin) =>
            coin.symbol.toLowerCase().includes(userInput)
        );

        if (filteredCoins.length === 0) {
            alert('No matching coins found.');
        } else {
            const searchedCoins = filteredCoins.slice(0, 100);
            displayCoins(searchedCoins);
        }
    }

    function displayCoins(coinsToDisplay: Coin[]) {
        const html = reduceCoins(coinsToDisplay);
        if (coinsContainer) {
            coinsContainer.innerHTML = html;
        }

        coinsToDisplay.forEach((coin) => {
            const coinId = coin.id;
            const checkbox = document.getElementById(`toggle-${coinId}`) as HTMLInputElement;

            if (checkbox) {
                checkbox.checked = selectedCoins.has(coinId);

                if (checkbox.checked) {
                    addedCoins.add(coinId);
                } else {
                    addedCoins.delete(coinId);
                }
            }
        });
    }
}

function liveReportsContainerClicked(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
        const element = e.target as HTMLElement;

        if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'checkbox') {
            handleLiveReportsCheckboxToggle(element as HTMLInputElement);
        }
    }
}

function handleLiveReportsCheckboxToggle(checkbox: HTMLInputElement) {
    const coinId = checkbox.id.substring('toggle-'.length);

    if (!checkbox.checked) {
        removeCoinFromLiveReports(coinId);
        console.log(`Removed coin ${coinId} from live reports.`);
    } else {
        cryptoChart.resumeChartForCoin(coinId);
    }
}
