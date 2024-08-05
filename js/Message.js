class Message {
    constructor(content, role) {
        this.content = content;
        this.role = role === 'ai' ? 'assistant' : role;
        this.isInCodeBlock = false;
        this.codeLanguage = '';
        this.currentCodeBlock = null;
    }

    toHTML() {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('flex', 'items-start', 'space-x-2', 'p-2', 'rounded-lg', 'mb-2');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('flex-grow', 'max-w-[80%]');
        
        if (this.role === 'user') {
            messageDiv.classList.add('justify-end');
            contentDiv.classList.add('bg-blue-500', 'text-white', 'rounded-lg', 'p-3', 'ml-auto');
        } else if (this.role === 'assistant') {
            messageDiv.classList.add('justify-start');
            contentDiv.classList.add('bg-gray-700', 'text-white', 'rounded-lg', 'p-3');
        } else {
            return null; // Skip rendering system messages
        }
        
        this.renderContent(contentDiv);
        messageDiv.appendChild(contentDiv);
        return messageDiv;
    }

    renderContent(container) {
        const lines = this.content.split('\n');
        let textBuffer = '';

        lines.forEach((line, index) => {
            if (line.startsWith('```')) {
                // Flush text buffer
                if (textBuffer) {
                    this.appendTextNode(container, textBuffer);
                    textBuffer = '';
                }

                if (this.isInCodeBlock) {
                    // End of code block
                    this.isInCodeBlock = false;
                    this.codeLanguage = '';
                    Prism.highlightElement(this.currentCodeBlock.querySelector('code'));
                    this.currentCodeBlock = null;
                } else {
                    // Start of code block
                    this.isInCodeBlock = true;
                    this.codeLanguage = line.slice(3).trim() || 'javascript';
                    this.currentCodeBlock = this.createCodeBlock(this.codeLanguage);
                    container.appendChild(this.currentCodeBlock);
                }
            } else if (this.isInCodeBlock) {
                // Add line to current code block
                const codeElement = this.currentCodeBlock.querySelector('code');
                codeElement.textContent += line + '\n';
                Prism.highlightElement(codeElement);
            } else {
                // Regular text
                textBuffer += line + '\n';
            }
        });

        // Flush any remaining text
        if (textBuffer) {
            this.appendTextNode(container, textBuffer);
        }
    }

    appendTextNode(container, text) {
        const textNode = document.createElement('div');
        textNode.innerHTML = this.formatText(text);
        container.appendChild(textNode);
    }

    createCodeBlock(language) {
        const codeBlock = document.createElement('div');
        codeBlock.classList.add('relative', 'my-2');
        
        const pre = document.createElement('pre');
        pre.classList.add(`language-${language}`, 'p-2', 'bg-gray-900', 'rounded', 'overflow-x-auto');
        
        const code = document.createElement('code');
        code.classList.add(`language-${language}`);
        
        const copyButton = document.createElement('button');
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.classList.add('absolute', 'top-2', 'right-2', 'bg-gray-700', 'text-white', 'p-1', 'rounded', 'opacity-50', 'hover:opacity-100', 'transition', 'duration-200');
        copyButton.addEventListener('click', () => this.copyCodeToClipboard(code));
        
        pre.appendChild(code);
        codeBlock.appendChild(pre);
        codeBlock.appendChild(copyButton);
        return codeBlock;
    }

    copyCodeToClipboard(codeElement) {
        const text = codeElement.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Show a temporary "Copied!" message
            const copiedMessage = document.createElement('span');
            copiedMessage.textContent = 'Copied!';
            copiedMessage.classList.add('absolute', 'top-2', 'right-10', 'bg-green-500', 'text-white', 'p-1', 'rounded', 'text-xs');
            codeElement.parentElement.appendChild(copiedMessage);
            setTimeout(() => copiedMessage.remove(), 2000);
        });
    }

    formatText(text) {
        // Convert line breaks to <br> tags
        return text.replace(/\n/g, '<br>');
    }
}