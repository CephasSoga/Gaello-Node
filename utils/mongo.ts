import { MongoClient } from 'mongodb';
import log from './logging';

type Document = any;

/**
 * Creates a new MongoClient instance.
 *
 * @param uri - The MongoDB connection URI.
 * @returns A new MongoClient instance.
 * @throws Will throw an error if the provided URI is invalid.
 */
export function createClient(uri: string): MongoClient {
    return new MongoClient(uri)
}

/**
 * Inserts a single document into a specified MongoDB collection.
 *
 * @param item - The document to be inserted.
 * @param client - An instance of MongoClient.
 * @param database - The name of the database where the collection resides.
 * @param collectionName - The name of the collection where the document will be inserted.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the document insertion is not acknowledged.
 *
 * @returns A promise that resolves to void when the document insertion is successful.
 */
export async function insertSingle(item: Document, client: MongoClient, database: string, collectionName: string): Promise<void>  {
    try {
        await client.connect();
        const db = client.db(database);
        const collection = db.collection<Document>(collectionName);
        
        const result = await collection.insertOne(item);
        if (!(result.acknowledged)) {
            throw new Error('No document inserted.')
        }
    } catch (error: any) {
        throw new Error(error.message)
    } finally {
        await client.close();
    }
}

/**
 * Inserts multiple documents into a specified MongoDB collection.
 *
 * @param items - An array of documents to be inserted.
 * @param client - An instance of MongoClient.
 * @param database - The name of the database where the collection resides.
 * @param collectionName - The name of the collection where the documents will be inserted.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the document insertion is not acknowledged.
 *
 * @returns A promise that resolves to the result of the insertMany operation when successful.
 * The result object contains the following properties:
 * - acknowledged: Indicates whether the write operation was acknowledged by the server.
 * - insertedCount: The number of documents inserted.
 * - insertedIds: An array of ObjectIds assigned to the inserted documents.
 */
export async function insertAll(items: Document[], client: MongoClient, database: string, collectionName: string): Promise<any> {
    try {
        await client.connect();
        const db = client.db(database);
        const collection = db.collection<Document>(collectionName);

        const result = await collection.insertMany(items);
        if (!(result.insertedCount > 0)) {
            throw new Error('No documents inserted.')
        }
    } catch (error: any){
        throw new Error(error.message)
    } finally {
        await client.close();
    }
}

/**
 * Performs a bulk insertion of multiple documents into a specified MongoDB collection.
 *
 * @param items - An array of documents to be inserted.
 * @param uri - The MongoDB connection URI.
 * @param database - The name of the database where the collection resides.
 * @param collection - The name of the collection where the documents will be inserted.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the document insertion is not acknowledged.
 *
 * @returns A promise that resolves to void when the document insertion is successful.
 * It logs an 'info' message indicating the number of items inserted.
 */
export async function mongoMultipleInsertion(items: Document[], uri: string, database: string, collection: string): Promise<void> {
    try{
        const client = createClient(uri);
        await insertAll(items, client, database, collection);
        log("info", `Sucessfully inserted ${items.length} items.`)
    } catch (err) {
        log('error', 'Error in mongoMultipleInsertion.', err);
    }
}


/**
 * Performs a single insertion of a document into a specified MongoDB collection.
 *
 * @param items - The document to be inserted.
 * @param uri - The MongoDB connection URI.
 * @param database - The name of the database where the collection resides.
 * @param collection - The name of the collection where the document will be inserted.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the document insertion is not acknowledged.
 *
 * @returns A promise that resolves to void when the document insertion is successful.
 * It logs an 'info' message indicating the successful insertion.
 */
export async function mongoSingleInsertion(items: Document, uri: string, database: string, collection: string): Promise<void> {
    try {
        const client = createClient(uri);
        await insertSingle(items, client, database, collection);
        log("info", "Successfully inserted single item.")
    } catch (err) {
        log('error', 'Error in mongoSingleInsertion.', err);
    }
}
