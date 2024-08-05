class API {
    static async* sendMessageStream(messages, model) {
        try {
            console.log('Sending request to Ollama:', { model, messages });
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages.filter(m => m && m.role).map(m => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    })),
                    stream: true
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    const parsed = JSON.parse(line);
                    if (parsed.message && parsed.message.content) {
                        yield parsed.message.content;
                    }
                }
            }
        } catch (error) {
            console.error('Error in sendMessageStream:', error);
            throw error;
        }
    }

    static async getAvailableModels() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            console.log('Models response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Available models:', data);
            if (!Array.isArray(data.models)) {
                throw new Error('Unexpected response format from Ollama');
            }
            return data.models;
        } catch (error) {
            console.error('Error in getAvailableModels:', error);
            throw error;
        }
    }
}