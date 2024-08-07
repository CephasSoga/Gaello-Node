import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";


class Statistics extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async sma(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'sma', apikey: apikey});
    }

    async ema(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'ema', apikey: apikey});
    }
    
    async dema(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'dema', apikey: apikey});
    }

    async tema(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'tema', apikey: apikey});
    }

    async wema(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'wema', apikey: apikey});
    }

    async rsi(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'rsi', apikey: apikey});
    }

    async adx(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'adx', apikey: apikey});
    }

    async std(): Promise<any> {
        return await this.fetch(resources.techincal, {timeframe: '4hour', symbol: this.symbol}, {period:10, type: 'standarddeviation', apikey: apikey});
    }

    public async run(): Promise<any> {
        const [sma, ema, dema, tema, wema, rsi, adx, std] = await Promise.all([
            this.sma(),
            this.ema(),
            this.dema(),
            this.tema(),
            this.wema(),
            this.rsi(),
            this.adx(),
            this.std(),
        ]);


        return {
            simpleMovingAverage: sma,
            exponentialMovingAverage: ema, 
            doubleEMA: dema,
            tripeEMA: tema,
            williams: wema,
            relativeStrengthIndex: rsi,
            averageDirectionalIndex: adx,
            standardDeviation: std,
        }
    }
}

export default Statistics;