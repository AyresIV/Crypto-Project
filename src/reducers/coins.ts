import Coin from "../interfaces/coin.js";

export default function reduceCoins(coins: Coin[]): string {
    return coins.map(coin => `
        <div class="col-sm-6 col-md-3" id="coin-card-${coin.id}">
            <div class="card">
                <div class="card-body">
                    <!-- Add a checkbox for each coin -->
                    <input type="checkbox" id="toggle-${coin.id}" class="form-check-input" />
                    <h5 class="card-title">${coin.name}</h5>
                    <p class="card-text">${coin.symbol}</p>
                    <a href="#" id="more-info-${coin.id}" class="btn btn-primary" data-bs-toggle="collapse"
                        data-bs-target="#collapse-${coin.id}">More Info</a>
                    <div class="collapse" id="collapse-${coin.id}"><!-- Unique ID for collapse -->
                        <div class="card card-body" id="data-container-${coin.id}">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).reduce((acc, curr) => acc + curr, '');
}