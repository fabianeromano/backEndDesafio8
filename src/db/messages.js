import fs from 'fs';
import path from 'path';

class MessageRepository {
    filename;

    constructor() {
        this.filename = 'messages.txt';
    }

    async initFile() {
        const data = [];
        fs.writeFileSync(path.join("./", this.filename), JSON.stringify(data, null, 2));
    }

    async save({
        author,
        text,
        datetime,
    }) {
        try {
            const messages = await fs.readFileSync(path.join("./", this.filename), 'utf8');
            const parsedMessages = JSON.parse(messages);
            const updatedMessages = [...parsedMessages, { id: parsedMessages.length + 1, author, text, datetime }];
            await fs.writeFileSync(path.join("./", this.filename), JSON.stringify(updatedMessages, null, 2));
        } catch (error) {
            throw new Error('Error inserting message: ' + error.message);
        }
    }

    async getAll() {
        try {
            const messages = await fs.readFileSync(path.join("./", this.filename), 'utf8');
            if (messages){
                return JSON.parse(messages);
            }
            else
                return [];
        } catch (err) {
            throw new Error('Error getting all messages: ' + err.message);
        };
    }
};

export const messageRepository = new MessageRepository()