type Article = FmpArticle | GeneralNewsArticle | StockNewsArticle | ForexNewsArticle | CryptoNewsArticle;

interface FmpArticle {
    author?: string,
    date?: Date,
    title?: string,
    image?: string,
    description?: string,
    content?: string,
    tickers?: string,
    link?: string,
    site?: string,
}

interface GeneralNewsArticle {
    publishedDate?: Date,
    title?: string,
    image?: string,
    site?: string,
    text?: string,
    url?: string,
}

interface StockNewsArticle {
    symbol?: string;
    publishedDate?: Date,
    title?: string,
    image?: string,
    site?: string,
    text?: string,
    url?: string,
}

interface ForexNewsArticle {
    publishedDate?: string,
    title?: string,
    image?: string,
    site?: string,
    text?: string,
    tickers?: Array<string>,
    updatedAt?: Date,
    createdAt?: Date,
    type?: string,

}

interface CryptoNewsArticle {
    publishedDate?: Date,
    title?: string,
    image?: string,
    site?: string,
    text?: string,
    url: string,
    tickers?: Array<string>,
    updatedAt?: Date,
    createdAt?: Date,
    type?: string,
}

export type RSSFeed = {
    symbol: string,
    publishedDate: Date,
    title: string,
    image: string,
    site: string,
    text:string,
    url: string,
    sentiment: string,
    sentimentScore: number
}

export default Article;