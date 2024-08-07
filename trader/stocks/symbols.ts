import get from "../../utils/requests";
import log from "../../utils/logging";
import apikey from "../setup/config";

export interface Stock {
    symbol: string,
    name: string,
    price: string,
    exchange: string,
    exchangeShortName: string,
    type: string,
}
    
export async function collectSymbols(): Promise<Stock[]> {
    try{
        const target: string = "https://financialmodelingprep.com/api/v3/stock/list";
        const response = await get(target, {}, {apikey: apikey});
        if (!response) {
            log("warn", "Trader > Stocks:: Unable to collect commodity symbols <= {invalid/missing/expired API key.}");
            return [];
        }
        const symbols: Stock[] = await response.data;
        if (!symbols) {
            log("warn", "Trader > Stocks:: Unable to collect commodity symbols <= {void response}");
            return [];
        }
        return symbols;
    } catch(error) {
        log("error", "Error collection stock symbols", error);
        return [];
    }
}
