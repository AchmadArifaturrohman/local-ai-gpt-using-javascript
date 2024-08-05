const ui = new UI();
let currentChat = null;
let chats = [];

const modelSelector = new ModelSelector(
    document.getElementById('model-selector'),
    (model) => console.log(`Model changed to ${model}`)
);

modelSelector.init();

ui.sendButton.addEventListener('click', async () => {
    const userInput = ui.getUserInput();
    if (userInput) {
        const userMessage = new Message(userInput, 'user');
        currentChat.addMessage(userMessage);
        ui.displayMessage(userMessage);
        ui.clearInput();

        // If this is the first message, update the chat history
        if (currentChat.messages.length === 1) {
            ui.addChatToHistory(currentChat);
        }

        try {
            ui.setLoading(true);
            console.log('Sending message to Ollama...');
            
            const aiMessage = new Message('', 'assistant');
            currentChat.addMessage(aiMessage);
            const aiMessageElement = ui.displayMessage(aiMessage);

            const messages = currentChat.getMessages().filter(m => m.content.trim() !== '');
            for await (const chunk of API.sendMessageStream(messages, modelSelector.getCurrentModel())) {
                aiMessage.content += chunk;
                ui.updateMessageContent(aiMessageElement, aiMessage.content);
                ui.scrollToBottom();
            }

            console.log('Received full response from Ollama:', aiMessage.content);
        } catch (error) {
            console.error('Error:', error);
            ui.displayErrorMessage(`An error occurred: ${error.message}. Please check the console for more details.`);
        } finally {
            ui.setLoading(false);
        }
    }
});

ui.userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        ui.sendButton.click();
    }
});

ui.newChatButton.addEventListener('click', () => {
    currentChat = new Chat(Date.now());
    chats.push(currentChat);
    ui.clearChatContainer();
});

// Initialize with a new chat
ui.newChatButton.click();

// Fetch available models
console.log('Fetching available models...');
API.getAvailableModels()
    .then(models => {
        console.log('Available models:', models);
        if (models.length === 0) {
            ui.displayErrorMessage('No models available. Please check your Ollama installation.');
        }
    })
    .catch(error => {
        console.error('Error fetching models:', error);
        ui.displayErrorMessage(`Failed to fetch models: ${error.message}. Is Ollama running?`);
    });