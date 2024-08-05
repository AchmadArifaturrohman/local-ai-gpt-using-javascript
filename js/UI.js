class UI {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.newChatButton = document.getElementById('new-chat');
        this.chatHistory = document.getElementById('chat-history');
        this.toggleChatsButton = document.getElementById('toggle-chats');
        this.themeToggleButton = document.getElementById('theme-toggle');
        this.typingIndicator = document.getElementById('typing-indicator');
        
        this.setupEventListeners();
        this.initTheme();
    }

    setupEventListeners() {
        this.toggleChatsButton.addEventListener('click', this.toggleChatHistory.bind(this));
        this.themeToggleButton.addEventListener('click', this.toggleTheme.bind(this));
        this.userInput.addEventListener('input', this.autoResizeTextarea.bind(this));
    }

    toggleChatHistory() {
        this.chatHistory.classList.toggle('hidden');
        this.toggleChatsButton.querySelector('i').classList.toggle('fa-chevron-down');
        this.toggleChatsButton.querySelector('i').classList.toggle('fa-chevron-up');
    }

    toggleTheme() {
        const isDarkMode = document.body.classList.toggle('light-theme');
        this.themeToggleButton.querySelector('i').classList.toggle('fa-moon', isDarkMode);
        this.themeToggleButton.querySelector('i').classList.toggle('fa-sun', !isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

        // Update specific elements
        const elementsToUpdate = [
            { selector: 'body', darkClass: 'bg-gray-900', lightClass: 'bg-gray-100' },
            { selector: '#sidebar', darkClass: 'bg-gray-800', lightClass: 'bg-gray-200' },
            { selector: '#chat-container', darkClass: 'bg-gray-900', lightClass: 'bg-white' },
            { selector: '#chat-input', darkClass: 'bg-gray-800', lightClass: 'bg-gray-200' },
            { selector: '#user-input', darkClass: 'bg-gray-700', lightClass: 'bg-white' },
            { selector: '#send-button', darkClass: 'bg-blue-600', lightClass: 'bg-blue-500' },
            { selector: '.message', darkClass: 'bg-gray-700', lightClass: 'bg-gray-200' },
            { selector: '.chat-item', darkClass: 'hover:bg-gray-700', lightClass: 'hover:bg-gray-300' }
        ];

        elementsToUpdate.forEach(({ selector, darkClass, lightClass }) => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.toggle(darkClass, isDarkMode);
                el.classList.toggle(lightClass, !isDarkMode);
            });
        });

        // Update text colors
        document.querySelectorAll('.text-white, .text-gray-900').forEach(el => {
            el.classList.toggle('text-white', isDarkMode);
            el.classList.toggle('text-gray-900', !isDarkMode);
        });

        document.querySelectorAll('.text-gray-400').forEach(el => {
            el.classList.toggle('text-gray-400', isDarkMode);
            el.classList.toggle('text-gray-600', !isDarkMode);
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            this.toggleTheme();
        }
    }

    autoResizeTextarea() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = (this.userInput.scrollHeight) + 'px';
    }

    displayMessage(message) {
        const messageElement = message.toHTML();
        if (messageElement) {
            this.chatContainer.appendChild(messageElement);
            this.scrollToBottom();
        }
        return messageElement;
    }

    updateMessageContent(messageElement, content) {
        const contentDiv = messageElement.querySelector('.flex-grow');
        if (contentDiv) {
            const tempMessage = new Message(content, 'assistant');
            contentDiv.innerHTML = '';
            tempMessage.renderContent(contentDiv);
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.autoResizeTextarea();
    }

    getUserInput() {
        return this.userInput.value.trim();
    }

    addChatToHistory(chat) {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item', 'p-2', 'hover:bg-gray-700', 'cursor-pointer', 'rounded', 'flex', 'items-center', 'space-x-2', 'mb-2', 'transition', 'duration-200');
        
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-message', 'text-gray-400');
        
        const text = document.createElement('span');
        text.classList.add('truncate', 'flex-grow');
        text.textContent = chat.getPreview();
        
        chatItem.appendChild(icon);
        chatItem.appendChild(text);
        
        chatItem.addEventListener('click', () => this.loadChat(chat));
        this.chatHistory.insertBefore(chatItem, this.chatHistory.firstChild);
    }

    loadChat(chat) {
        this.chatContainer.innerHTML = '';
        chat.getMessages().forEach(message => this.displayMessage(message));
    }

    clearChatContainer() {
        this.chatContainer.innerHTML = '';
    }

    setLoading(isLoading) {
        this.typingIndicator.classList.toggle('hidden', !isLoading);
        this.sendButton.disabled = isLoading;
        this.sendButton.classList.toggle('opacity-50', isLoading);
    }

    displayErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('bg-red-500', 'text-white', 'p-3', 'rounded-lg', 'mb-4');
        errorDiv.textContent = message;
        this.chatContainer.appendChild(errorDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}