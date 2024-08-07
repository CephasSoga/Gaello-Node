import apikey from "../setup/config";
import resources from "../setup/ressources";
import BuildComponents from "../setup/builder";

class RevenueBySegments extends BuildComponents{
    constructor(public symbol: string){
        super();
    }

    async products(): Promise<any> {
        return await this.fetch(resources.revenueByProduct, {}, {symbol: this.symbol, apikey: apikey });
    }

    async geo(): Promise<any> {
        return await this.fetch(resources.revenueByLocation, {}, {symbol: this.symbol, apikey: apikey});
    }

    public async run(): Promise<any> {
        const [products, geo] = await Promise.all([this.products(), this.geo()])
       
        return {
           revenueProductSegementation: products,
           revenueGeoSegementation: geo, 
        }
    }
}

export default RevenueBySegments