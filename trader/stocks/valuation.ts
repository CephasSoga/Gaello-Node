import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";

class Valuation extends BuildComponents {
    constructor(public symbol: string) {
        super();
    }

    async dcf(): Promise<any> {
        return await this.fetch(resources.discountedCashFlow, {symbol: this.symbol}, {apikey: apikey});
    }

    async advancedDcf(): Promise<any> {
        return await this.fetch(resources.advancedDCF, {symbol: this.symbol}, {apikey: apikey});
    }

    async leveredDcf(): Promise<any> {
        return await this.fetch(resources.leveredDCF, {symbol: this.symbol}, {apikey: apikey});
    }

    async rating(): Promise<any>{
        return await this.fetch(resources.companyRating, {symbol: this.symbol}, {apikey: apikey});
    }

    public async run(): Promise<any> {
        const [dcf, advancedDcf, leveredDcf, rating] = await Promise.all([
            this.dcf(),
            this.advancedDcf(),
            this.leveredDcf(),
            this.rating(),
        ]);

        return {
            discountedCashflow: dcf,
            advancedDcf: advancedDcf,
            leveredDcf: leveredDcf,
            companyRating: rating,
        }
    }
}

export default Valuation