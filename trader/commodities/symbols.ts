import get from "../../utils/requests";
import log from "../../utils/logging";
import apikey from "../setup/config";

export interface Commodity {
    symbol: string,
    name: string,
    price: string,
    exchange: string,
    exchangeShortName: string,
}

export async function collectCommoditySymbols(): Promise<Commodity[]> {
    try{
        const target: string = "https://financialmodelingprep.com/api/v3/symbol/available-commodities";
        const response = await get(target, {}, {apikey: apikey});
        if (!response) {
            log("warn", "Trader > Commodities:: Unable to collect commodity symbols <= {invalid/missing/expired API key.}");
            return [];
        }
        const symbols: Commodity[] = await response.data;
        
        if (!symbols) {
            log("warn", "Trader > Commodities:: Unable to collect commodity symbols <= {void response}");
            return [];
        }
        return symbols;
    } catch(error) {
        log("error", "Error collection commodity symbols", error);
        return [];
    }
}