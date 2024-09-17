import * as amqp from 'amqplib';

import env from '../env';
import log from '../utils/logging';

/**
 * Defines how a message should be configures if it is to be received by the Borker.
 */
export interface Message {
    id: string;
    type: string
    value: string;
}

/**
 * A class to manage messages pushing to RabbitMQ queues.
 */
class Producer {

    /**
     * Constructs Producer instance.
     * @param protocol: The protocol in use (ampq or ampqs).
     * @param host: The Host URL of RabbitMQ queue.
     * @param port:The port that serves the data.
     * @param queue: The Queue name.
     */
    constructor(
        public protocol: string,
        public host:string, 
        public port: string, 
        public queue:string
    ) {
        this.protocol = protocol;
        this.host = host;
        this.port = port;
        this.queue = queue;
    }

    /**
     * Asynchronously pushes data as  messages to RabbitMQ queue. The data can then be fecthed and processed.
     * @param message: Message to send to RabbitMQ queue.
     * @returns a promise that resolves when the queue is flushed.
     */
    async connect(): Promise<amqp.Connection> {
        let connection: amqp.Connection | null = null;
        try {
            const target = `${this.protocol}://${this.host}:${this.port}`;
            log("debug", "No need to specify port explicitly, Docker will handle it automatically.");
            try {
                connection = await amqp.connect(target);
                if (!connection) {
                    throw new Error('No connection to RabbitMQ.');
                }
                log("info", "Connected to RabbitMQ.");
                return connection;
            } catch (error: any) {
                log("error", "RabbitMQ Connection Error: Unale to esablish connection.", error);
                throw error;
            }
        } catch(error: any) {
            log("error", "RabbitMQ Connection Error", error);
            throw error;
        }        
    }

    /**
     * Asynchronously sends a message to a RabbitMQ queue.
     *
     * @param {amqp.Connection} connection - The active connection to RabbitMQ.
     * @param {Message} message - The message to be sent.
     * @return {Promise<void>} A promise that resolves when the message is sent successfully.
     * @throws {Error} If there is no active connection to RabbitMQ.
     * @throws {Error} If there is an error sending the message to RabbitMQ.
     */
    async throw(connection: amqp.Connection, message: Message): Promise<void> {
        try {
            if (!connection) {
                throw new Error('No active connection to RabbitMQ.');
            }
            const channel = await connection.createChannel();
            await channel.assertQueue(this.queue, { durable: false });
            channel.sendToQueue(this.queue, Buffer.from(message.value));
            log("info", `[x]Sent: message with id: ${message.id}`);
        } catch (error: any) {
            log("error", "RabbitMQ Error.", error);
        }
    }

    /**
     * Closes the connection to RabbitMQ.
     *
     * @param {amqp.Connection} connection - The active connection to RabbitMQ.
     * @return {Promise<void>} A promise that resolves when the connection is closed.
     */
    async close(connection: amqp.Connection): Promise<void> {
        if (connection) {
            await connection.close();
            log("info", "Connection to RabbitMQ closed.");
        }
    }

    /**
     * Asynchronously produces a list of messages to a RabbitMQ queue.
     *
     * @param {Message[]} messages - The list of messages to be produced.
     * @return {Promise<void>} A promise that resolves when all messages have been produced.
     * @throws {Error} If there is an error connecting to RabbitMQ.
     * @throws {Error} If there is an error producing a message to RabbitMQ.
     */
    async produce_(messages: Message[]): Promise<void> {
        const connection = await this.connect();
        try {
            for (const message of messages) {
                await this.throw(connection!, message);
            }
        } catch(error){
            log("error", "", error)
        } finally {
            await this.close(connection!);
        }
    }

    async produce(messages: Message[]): Promise<void> {
        log("info", "Producer > Produce: Skipping message production as it is no more required.");
    }
}

//Create a new producer and export it.
const protocol = env.RMQ_PROTOCOL || 'amqp'; //Defaults to 'amqp'
const host = env.RMQ_HOST;
const port = env.RMQ_PORT || (protocol === 'amqps' ? '5671' : '5672');
const queue = env.RMQ_QUEUE;

/**
 * A single instance of the Producer class to use everywhere.
 */
const producer = new Producer(protocol, host, port, queue);

export default producer;