import { Message } from '../../rmq/producer';
import { now } from '../../utils/time';
import BuildComponents from '../setup/builder';
import resources from '../setup/ressources';
import apikey from "../setup/config";

interface Quote {
    date: Date,
    open: number,
    high: number,
    low: number,
    close: number,
    adjClose: number,
    volume: number,
}

export interface HistoricalData {
    quotes: Quote[],
}

class CommodityItem extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async historical(): Promise<{historical: HistoricalData, message: Message}> {

        const id = this.symbol + now();
        const type = "commodity-historical";
        let quotes: Quote[] = []

        const data: any[] = await this.fetch(resources.commodityHistorical, {symbol: this.symbol}, {apikey: apikey});
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { 
                historical: {quotes: quotes}, 
                message: {
                id: id,
                type: type,
                value: ''} 
            };
        }
        quotes = data.map((item: any) => ({
            date: new Date(item.date),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            adjClose: item.adjClose,
            volume: item.volume,
        }));

        const quotesSlice: Quote[] = quotes.slice(-20);

        const historical: HistoricalData = {
            quotes: quotesSlice,
        };

        const message: Message = {
            id: id,
            type: type,
            value: JSON.stringify(historical),
        };

        return {
            historical: historical,
            message: message,
        }
    }
}

export default CommodityItem;