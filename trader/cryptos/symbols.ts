import get from "../../utils/requests";
import log from "../../utils/logging";
import apikey from "../setup/config";

export interface Crypto {
    symbol: string,
    name: string,
    price: string,
    exchange: string,
    exchangeShortName: string,
}
    
export async function collectCryptos(): Promise<Crypto[]> {
    try{
        const target: string = "https://financialmodelingprep.com/api/v3/symbol/available-cryptocurrencies";
        const response = await get(target, {}, {apikey: apikey});
        if (!response) {
            log("warn", "Trader > Cryptos:: Unable to collect commodity symbols <= {invalid/missing/expired API key.}");
            return [];
        }
        const symbols: Crypto[] = await response.data;
        
        if (!symbols) {
            log("warn", "Trader > Cryptos:: Unable to collect commodity symbols <= {void response}");
            return [];
        }
        return symbols;
    } catch(error) {
        log("error", "Error collection crypto symbols", error);
        return [];
    }
}