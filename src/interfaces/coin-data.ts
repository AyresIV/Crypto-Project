export default interface CoinData {
    id: string;
    name: string;
    symbol: string;
    image: {
        thumb: string;
    };
    market_data: {
        current_price: {
            usd: number;
            eur: number;
            ils: number;
        };
    };
}