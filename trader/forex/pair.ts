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

export type FullQuote = any;

export interface HistoricalQuote {
    quotes: Quote[],
}

export interface ForexPrice {
    quote: FullQuote,
    historical: HistoricalQuote
}

class ForexItem extends BuildComponents{
    constructor(public symbol: string) {
        super();
    }

    async fullQuote(): Promise<FullQuote> {
        const data: FullQuote = await this.fetch(resources.forexFullQuote, {symbol: this.symbol}, {apikey: apikey});
        return data
    }

    async historical(): Promise<HistoricalQuote> {
        
        let quotes: Quote[] = []

        const data: any[] = await this.fetch(resources.forexHistorical, {symbol: this.symbol}, {apikey: apikey});
        if (!data || !Array.isArray(data) || data.length === 0) {
            return {quotes: quotes}
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

        const historical: HistoricalQuote = {
            quotes: quotesSlice,
        };

        return historical;
    }

    async run(): Promise<{price: ForexPrice, message: Message}> {
        const id = this.symbol + now();
        const type = "forex-price";

        const [currentQuote, historicalQuote] = await Promise.all([this.fullQuote(), this.historical()]);

        const result: ForexPrice = {
            quote: currentQuote,
            historical: historicalQuote
        };

        const message = {
            id: id,
            type: type,
            value: JSON.stringify(result)
        };

        return {
            price: result,
            message: message
        }
    }
}

export default ForexItem;