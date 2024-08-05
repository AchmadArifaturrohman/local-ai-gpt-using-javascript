class ModelSelector {
    constructor(container, onModelChange) {
        this.container = container;
        this.onModelChange = onModelChange;
        this.currentModel = null;
    }

    async init() {
        const models = await API.getAvailableModels();
        this.createSelector(models);
    }

    createSelector(models) {
        const select = document.createElement('select');
        select.classList.add('bg-gray-700', 'text-white', 'p-2', 'rounded', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.onModelChange(this.currentModel);
        });

        this.container.appendChild(select);
        this.currentModel = models[0].name;
        this.onModelChange(this.currentModel);
    }

    getCurrentModel() {
        return this.currentModel;
    }
}