import { MongoClient } from 'mongodb';
import log from './logging';
import env from '../env';

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


/** updates happen here **/

/**
 * Updates a single document in a specified MongoDB collection.
 * If the document does not exist, it will be created.
 *
 * @param filter - The filter to identify the document to update.
 * @param update - The update operations to apply to the document.
 * @param client - An instance of MongoClient.
 * @param database - The name of the database where the collection resides.
 * @param collectionName - The name of the collection where the document will be updated.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the update operation fails.
 *
 * @returns A promise that resolves to void when the document update is successful.
 */
export async function updateSingle(filter: Document, update: Document, client: MongoClient, database: string, collectionName: string): Promise<void> {
    try {
        await client.connect();
        const db = client.db(database);
        const collection = db.collection<Document>(collectionName);

        const result = await collection.updateOne(filter, update, { upsert: true });
        if (!result.acknowledged) {
            throw new Error('No document updated or inserted.');
        }
    } catch (error: any) {
        throw new Error(error.message);
    } finally {
        await client.close();
    }
}

/**
 * Updates multiple documents in a specified MongoDB collection.
 * If any document does not exist, it will be created.
 *
 * @param filter - The filter to identify the documents to update.
 * @param update - The update operations to apply to the documents.
 * @param client - An instance of MongoClient.
 * @param database - The name of the database where the collection resides.
 * @param collectionName - The name of the collection where the documents will be updated.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the update operation fails.
 *
 * @returns A promise that resolves to the result of the updateMany operation when successful.
 */
export async function updateAll(filter: Document, update: Document, client: MongoClient, database: string, collectionName: string): Promise<void> {
    try {
        await client.connect();
        const db = client.db(database);
        const collection = db.collection<Document>(collectionName);

        const result = await collection.updateMany(filter, update, { upsert: true });
        if (!result.acknowledged) {
            throw new Error('No documents updated or inserted.');
        }
    } catch (error: any) {
        throw new Error(error.message);
    } finally {
        await client.close();
    }
}

/**
 * Performs a bulk update of multiple documents into a specified MongoDB collection.
 * If any document does not exist, it will be created.
 *
 * @param filter - The filter to identify the documents to update.
 * @param update - The update operations to apply to the documents.
 * @param uri - The MongoDB connection URI.
 * @param database - The name of the database where the collection resides.
 * @param collection - The name of the collection where the documents will be updated.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the update operation fails.
 *
 * @returns A promise that resolves to void when the document update is successful.
 */
export async function mongoMultipleUpdate(filter: Document, update: Document, uri: string, database: string, collection: string): Promise<void> {
    try {
        const client = createClient(uri);
        await updateAll(filter, update, client, database, collection);
        log("info", `Successfully updated documents.`);
    } catch (err) {
        log('error', 'Error in mongoMultipleUpdate.', err);
    }
}

/**
 * Performs a single update of a document in a specified MongoDB collection.
 * If the document does not exist, it will be created.
 *
 * @param filter - The filter to identify the document to update.
 * @param update - The update operations to apply to the document.
 * @param uri - The MongoDB connection URI.
 * @param database - The name of the database where the collection resides.
 * @param collection - The name of the collection where the document will be updated.
 *
 * @throws Will throw an error if the provided MongoClient instance is not connected,
 * or if the update operation fails.
 *
 * @returns A promise that resolves to void when the document update is successful.
 */
export async function mongoSingleUpdate(filter: Document, update: Document, uri: string, database: string, collection: string): Promise<void> {
    try {
        const client = createClient(uri);
        await updateSingle(filter, update, client, database, collection);
        log("info", "Successfully updated single item.");
    } catch (err) {
        log('error', 'Error in mongoSingleUpdate.', err);
    }
}


/**
 * Update multiple commodity documents in MongoDB with upsert (prefer updates).
 *
 * @param documents - Array of commodityDocument instances to update.
 * @param uri - The MongoDB connection URI.
 * @param database - The name of the database where the collection resides.
 * @param collectionName - The name of the collection where the documents will be updated.
 */
export async function mongoMultipleUpsert(documents: Document[], uri: string, database: string, collectionName: string): Promise<void> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(database);
        const collection = db.collection(collectionName);

        const bulkOps = documents.map(doc => ({
            updateOne: {
                filter: { symbol: doc.symbol },  // Match based on the symbol
                update: { $set: doc },           // Update the document
                upsert: true                     // Insert if not exists
            }
        }));

        const result = await collection.bulkWrite(bulkOps);
        log("info", `Upserted ${result.upsertedCount} documents and modified ${result.modifiedCount} documents.`);
    } catch (error) {
        log('error', 'Error in mongoMultipleUpsert.', error);
    } finally {
        await client.close();
    }
}

/**
* Deletes documents older than 30 days from a specified MongoDB collection.
*
* @param uri - The MongoDB connection URI.
* @param database - The name of the database where the collection resides.
* @param collectionName - The name of the collection where the documents will be deleted.
* @param dateField - The field in the document that contains the date information.
* @param limit - The number of days before the date to delete documents.
*/
export async function deleteOldDocuments(uri: string, database: string, collectionName: string, dateField: string = 'date', limit: number = 30): Promise<void> {
   const client = new MongoClient(uri);
   try {
       await client.connect();
       const db = client.db(database);
       const collection = db.collection(collectionName);

       // Calculate the date <limit> days ago
       const thirtyDaysAgo = new Date();
       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - limit);

       // Delete documents where the dateField is older than <limit> days
       const result = await collection.deleteMany({
           [dateField]: { $lt: thirtyDaysAgo }
       });

       log("info", `Deleted ${result.deletedCount} documents older than ${limit} days.`);
   } catch (error) {
       log('error', 'Error in deleteOldDocuments.', error);
   } finally {
       await client.close();
   }
} 