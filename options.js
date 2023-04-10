document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey }, () => {
        alert('API-ключ сохранен');
    });
});

chrome.storage.sync.get('apiKey', (data) => {
    document.getElementById('apiKey').value = data.apiKey || '';
});
