import knex from 'knex'
import { messagesConfig } from './config.js';

const db = knex(messagesConfig);

class MessageRepository {
    tableName;

    constructor() {
        this.tableName = 'messages';
    }

    async createTable(){
        await db.schema.dropTableIfExists(this.tableName);
        await db.schema.createTable(this.tableName, function (table) {
            table.increments();
            table.string('email');
            table.string('message');
            table.dateTime('datetime');
          })
    }

    async save({
        email,
        message,
        datetime,
    }) {
        try {
            await db(this.tableName).insert({ email, message, datetime })
        } catch (error) {
            throw new Error('Error inserting message: ' + error.message);
        }
    }

    async getAll() {
        try{
            return await db.from(this.tableName).select("*");
        } catch(err){
            throw new Error('Error getting all messages: ' + err.message);
        };
    }
};

export const messageRepository = new MessageRepository()