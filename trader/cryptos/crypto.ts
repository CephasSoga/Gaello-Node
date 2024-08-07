import BuildComponents from "../setup/builder";
import resources from "../setup/ressources";
import apikey from "../setup/config";
import { Message } from "../../rmq/producer";
import { now } from "../../utils/time";


export interface CryptoInterface {
    quote: any,
    daily: any,
}

export class CryptoItem extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async quote(): Promise<any> {
        const result =  await this.fetch(resources.quotes, {symbol: this.symbol},  {apikey: apikey});
        if (!result) {
            return {}
        }
        return result;
    }

    async daily(): Promise<any> {
        const result = await this.fetch(resources.priceHistorical, {symbol: this.symbol},  {apikey: apikey});
        if (!result) {
            return {};
        }
        return result;
    }

    async build(): Promise<{ cryptoResult: CryptoInterface, message: Message }> {
        const [quote, daily] = await Promise.all([this.quote(), this.daily()]);

        let dailySlice = daily;

        if (Array.isArray(daily)){  
            dailySlice = daily.slice(0, 100);
        }

        const result: CryptoInterface = {
            quote: quote,
            daily: dailySlice,
        };

        const message: Message = {
            id: this.symbol + now(),
            type: "ticker",
            value: JSON.stringify(result),
        };

        return {
            cryptoResult: result,
            message: message,
        };
    }
}

export default CryptoItem;