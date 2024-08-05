class Chat {
    constructor(id) {
        this.id = id;
        this.messages = [];
        this.firstMessageContent = '';
    }

    addMessage(message) {
        if (this.messages.length === 0 && message.role === 'user') {
            this.firstMessageContent = message.content;
        }
        this.messages.push(message);
    }

    getMessages() {
        return this.messages;
    }

    getPreview() {
        return this.firstMessageContent || 'New Chat';
    }
}