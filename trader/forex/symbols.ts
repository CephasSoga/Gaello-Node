import get from "../../utils/requests";
import log from "../../utils/logging";
import apikey from "../setup/config";

export interface ForexCurrencyPair {
    symbol: string,
    name: string,
    price: string,
    exchange: string,
    exchangeShortName: string,
}

export async function collectForexCurrencyPairs(): Promise<ForexCurrencyPair[]> {
    try{
        const target: string = "https://financialmodelingprep.com/api/v3/symbol/available-forex-currency-pairs";
        const response = await get(target, {}, {apikey: apikey});
        if (!response) {
            log("warn", "Trader > Forex:: Unable to collect commodity symbols <= {invalid/missing/expired API key.}");
            return [];
        }
        const symbols: ForexCurrencyPair[] = await response.data;
        
        if (!symbols) {
            log("warn", "Trader > Forex:: Unable to collect commodity symbols <= {void response}");
            return [];
        }
        return symbols;
    } catch(error) {
        log("error", "Error collection forex symbols", error);
        return [];
    }
}

