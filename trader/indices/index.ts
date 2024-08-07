import axios from 'axios';
import env from '../../env';
import log from '../../utils/logging';
import {now} from '../../utils/time';
import {Message} from '../../rmq/producer';

interface Quote {
    date: Date,
    open: number,
    high: number,
    low: number,
    close: number,
    adjClose: number,
    volume: number,
}

export interface HistoricalQuote {
    quotes: Quote[]
}

class IndexItem {
    private apikey = env.EOD_API_KEY
    constructor(public symbol: string, public length: number = 360) {}

    async fetch(): Promise<any[]> {
        try{
        const today = new Date();
            const daysBackward = new Date(today.getTime() - this.length * 24 * 60 * 60 * 1000);

            const params = {
                api_token: this.apikey,
                from: daysBackward,
                to: today,
                fmt: 'json'
            };

            // Construct the URL
            const url = `https://eodhistoricaldata.com/api/eod/${this.symbol}`;

            // Make the API request
            const response = await axios.get(url, {
                params: params
            });

            const data: any[] = response.data
            return data 
        } catch (error: any) {
            log("error", 'Trader:: Index > Error fetching data', error);
            return []
        }
    }

    async historical(): Promise<HistoricalQuote> {

        let quotes: Quote[] = []

        const data: any[] = await this.fetch();
        if (!data || data.length === 0) {
            return {quotes: quotes}
        }

        quotes = data.map((item: any) => ({
            date: new Date(item.date),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            adjClose: item.adjusted_close,
            volume: item.volume,
        }));

        const quotesSlice: Quote[] = quotes.slice(-100);

        const historical: HistoricalQuote = {
            quotes: quotesSlice,
        };

        return historical;
        
    }

    async run(): Promise<{historical: HistoricalQuote, message: Message}> {

        const id = this.symbol + now();
        const type = "index";

        const historical = await this.historical();

        const message: Message = {
            id: id,
            type: type,
            value: JSON.stringify(historical),
        };

        return {
            historical: historical,
            message: message
        }
    }
}

export default IndexItem;

