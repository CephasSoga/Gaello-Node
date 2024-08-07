/**
 * constant object named resources containing various API endpoints. 
 * The purpose of this object is to provide a centralized reference for accessing different financial data and market information.
 */

const resources = {
    outlook: "v4/company-outlook",
    stockPeers: "v3/peers",
    financials: "v3/financial-statement-full-as-reported",
    analystEstimates: "v3/analyst-estimates",
    analystRecommendations: "v3/analyst-stock-recommendations",
    priceTarget: "v4/price-target",
    priceTargetSummary: "v4/price-target-summary",
    keyMetricsTTM: "v3/key-metrics-ttm",
    ratiosTTM: "v3/ratios-ttm",
    cashflowGrowth: "v3/cashflow-growth",
    incomeGrowth: "v3/income-growth",
    balanceSheetGrowth: "v3/balance-sheet-statement-growth",
    financialGrowth: "v3/financial-growth", 
    financialScore: "v4/score",
    ownerEarnings: "v4/owner_earnings",
    enterpriseValues: "v3/enterprise-values",
    discountedCashFlow: "v3/discounted-cash-flow", 
    advancedDCF: "v4/advanced_discounted_cash_flow", 
    leveredDCF: "v4/advanced_levered_discounted_cash_flow",  //Get the DCF valuation for a company, taking into account its debt levels.
    companyRating: "v3/ratings",
    ratingHistorical: "v3/historical-rating",
    priceHistorical: "v3/historical-price-full",
    dailyChartEOD: "v3/historical-price-full",
    marketCapHistorical: "v3/historical-market-capitalization",
    dividendsHistorical: "v3/historical-price-full/stock_dividend",
    spiltsHistorical: "v3/historical-price-full/stock_split",
    upgradeOrDowngrade: "v4/upgrades-downgrades",
    upgradeOrDowngradeConsensus: "v4/upgrades-downgrades-consensus",
    socialSentimentHistorical: "v4/historical/social-sentiment",
    socialSentimentTrending: "v4/social-sentiments/trending",
    socialSentimentChanges: "v4/social-sentiments/change",
    techincal: "v3/technical_indicator",
    revenueByProduct: "v4/revenue-product-segmentation",
    revenueByLocation: "v4/revenue-geographic-segmentation",
    marketIndex: "v3/quotes/index",
    sectorPEration: "v4/sector_price_earning_ratio",
    industryPEration: "v4/industry_price_earning_ratio",
    sectorPerformance: "v3/sectors-performance",
    industryPerformance: "v3/stock/real-time-price",
    sectorHistoricalPerformance: "v3/historical-sectors-performance",
    marketBiggestGainers: "v3/gainers",
    marketBiggestLosers: "v3/losers",
    marketMostActives: "v3/actives",
    quotes: "v3/quote",
    intraday: "v3/historical-chart",
    trendingSentiment: "v4/social-sentiments/trending",
    sentimentChange: "v4/social-sentiments/change",
    forexHistorical: "v3/historical-price-full",
    forexFullQuote: "/v3/quote",
    commodityHistorical: "v3/historical-price-full",
}

export default resources