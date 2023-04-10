async function sendRequestToOpenAI(text, instruction) {
    //const url = 'https://api.openai.com/v1/edits';
    const url = 'http://kotlinlang.ru:3000/v1/edits'; // use proxy because of CORS

    const apiKeyData = await new Promise((resolve) => {
        chrome.storage.sync.get('apiKey', resolve);
    });

    const apiKey = apiKeyData.apiKey;

    if (!apiKey) {
        throw new Error('API-ключ не задан. Пожалуйста, задайте его на странице настроек расширения.');
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'text-davinci-edit-001',
            input: text,
            instruction: instruction,
            n: 1,
            temperature: 0.7,
        })
    });

    if (response.ok) {
        const data = await response.json();
        return data.choices[0].text.trim();
    } else {
        const errorData = await response.json();
        const errorMessage = errorData.error ? errorData.error.message : response.statusText;
        throw new Error("Ошибка запроса: "+ errorMessage);
    }
}

async function actionSubmit(selectedText, instruction) {
    if (!instruction) {
        throw Error('Инструкция не введена. Операция отменена.');
    }

    try {
        const result = await sendRequestToOpenAI(selectedText, instruction);
        return result
    } catch (error) {
        console.error(error);
        throw Error(`Произошла ошибка при отправке запроса на OpenAI API:\n${error.message}`);
    }
}

// Добавьте эту функцию вместо sendToOpenAI
function openEditDialog(info, tab) {
    const selectedText = info.selectionText;
    const dialogUrl = chrome.runtime.getURL('dialog.html');
    chrome.storage.local.set({ 'selectedText': selectedText });

    const width = 550;
    const height = 450;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);

    window.open(dialogUrl, 'openai_dialog', `width=${width},height=${height},left=${left},top=${top}`);
}


// Добавьте обработчик сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'actionSubmit':
            const { selectedText, instruction } = request;
            actionSubmit(selectedText, instruction)
                .then((editedText) => {
                    sendResponse({ editedText });
                })
                .catch((error) => {
                    sendResponse({ error: error.message });
                });
            return true; // Добавлено для обработки асинхронного ответа
        case 'getSelectedText':
            chrome.storage.local.get('selectedText', (data) => {
                sendResponse({ selectedText: data.selectedText });
            });
            return true; // Это уже было, для обработки асинхронного ответа
    }
});

chrome.contextMenus.create({
    title: "Отправить на OpenAI API",
    contexts: ["selection"],
    onclick: openEditDialog
});
