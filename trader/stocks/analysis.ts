import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";

class FinancialAnalysis extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async metrics(): Promise<any> {
        return await this.fetch(resources.keyMetricsTTM, {symbol: this.symbol}, {apikey: apikey});
    }

    async ratios(): Promise<any> {
        return await this.fetch(resources.ratiosTTM, {symbol: this.symbol}, {apikey: apikey});
    }

    async cashflowGrowth(): Promise<any> {
        return await this.fetch(resources.cashflowGrowth, {symbol: this.symbol}, {apikey: apikey});
    }

    async income(): Promise<any> {
        return await this.fetch(resources.incomeGrowth, {symbol: this.symbol}, {apikey: apikey});
    }

    async balanceSheet(): Promise<any> {
        return await this.fetch(resources.balanceSheetGrowth, {symbol: this.symbol}, {apikey: apikey});
    }

    async financial(): Promise<any> {
        return await this.fetch(resources.financialGrowth, {symbol: this.symbol}, {apikey: apikey});
    }

    async financialScore(): Promise<any> {
        return await this.fetch(resources.financialScore, {symbol: this.symbol}, {apikey: apikey});
    }

    async earnings(): Promise<any> {
        return await this.fetch(resources.ownerEarnings, {symbol: this.symbol}, {apikey: apikey});
    }

    async values(): Promise<any> {
        return await this.fetch(resources.enterpriseValues, {symbol: this.symbol}, {apikey: apikey});
    }

    public async run(): Promise<any> {
        const [metrics, ratios, cashflowGrowth, income, balanceSheet, financial, financialScore, earnings, values] = await Promise.all([
            this.metrics(), 
            this.ratios(), 
            this.cashflowGrowth(), 
            this.income(), 
            this.balanceSheet(), 
            this.financial(), 
            this.financialScore(), 
            this.earnings(), 
            this.values()]);
        
        return {
            keyMetricsTTM: metrics,
            ratios: ratios,
            cashflowGrowth: cashflowGrowth,
            incomeGrowth: income,
            balanceSheetGrowth: balanceSheet,
            financialGrowth: financial,
            financialScore: financialScore,
            ownerEarnings: earnings,
            enterpriseValues: values,
        };
    }
}

export default FinancialAnalysis;