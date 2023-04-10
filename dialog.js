document.getElementById('submit').addEventListener('click', () => {
    const selectedText = document.getElementById('selectedText').innerText;
    const instruction = document.getElementById('instruction').value;
    const resultElement = document.getElementById('result');

    if (!instruction) {
        // alert('Инструкция не введена. Операция отменена.');
        // return;
    }

    resultElement.textContent = 'Отправка данных...';

    chrome.runtime.sendMessage({ action: 'actionSubmit', selectedText, instruction }, (response) => {
        if (response.error) {
            resultElement.textContent = `Ошибка: ${response.error}`;
        } else {
            resultElement.textContent = `Результат редактирования:\n\n${response.editedText}`;
        }
    });
});

chrome.runtime.sendMessage({ action: 'getSelectedText' }, (response) => {
    document.getElementById('selectedText').innerText = response.selectedText;
});
