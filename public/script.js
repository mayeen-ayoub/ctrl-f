// Open the document preview popup and show the actual document
function openPopup(sourceUrl) {
    const previewContainer = document.getElementById('document-preview');
    previewContainer.innerHTML = '';

    const pdfViewer = document.createElement('embed');
    pdfViewer.src = sourceUrl;
    pdfViewer.type = 'application/pdf';
    pdfViewer.style.width = '100%';
    pdfViewer.style.height = '500px';
    previewContainer.appendChild(pdfViewer);

    document.getElementById('popup').style.display = 'flex';
    document.querySelector('.container').classList.add('blur');
}

// Close the document preview popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.querySelector('.container').classList.remove('blur');
}

function triggerUpload() {
    document.getElementById('fileInput').click();
}

// Handle the file upload and preview
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);
    
        fetch("/extract-text", {
            method: "post",
            body: formData,
        }).then(response => {
            return response.blob();
        }).then(blob => {
            renderFile(blob, file);
        });
    }
}

// Function to handle sending the message
function sendMessage(event) {
    event.preventDefault();

    const input = document.getElementById('chat-input');
    const messageText = input.value.trim();

    if (messageText === '') return;

    const messageContainer = document.getElementById('messages');
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user');
    userMessage.innerText = messageText;
    messageContainer.appendChild(userMessage);

    input.value = '';

    messageContainer.scrollTop = messageContainer.scrollHeight;

    fetch('/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: messageText })
    })
    .then(response => response.json())
    .then(data => {
        // setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.classList.add('message', 'bot');
            botMessage.innerText = data.message;
            messageContainer.appendChild(botMessage);
    
            messageContainer.scrollTop = messageContainer.scrollHeight;
        // }, 1000);
    }).catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('chat-form').addEventListener('submit', sendMessage);

window.onload = fetchStoredFiles;

function fetchStoredFiles() {
    fetch('/files') 
        .then(response => {
            return response.json();
        }).then(files => {
            const docList = document.querySelector('.doc-list');
            files.forEach(file => {
                const listItem = document.createElement('li');
                listItem.classList.add('doc-item');
    
                // Create the image preview by fetching the thumbnail
                fetch(`/files/${file}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error retrieving response');
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        renderFile(blob, file);
                    });
            });
        });
}

function renderFile(blob, file) {
    const url = URL.createObjectURL(blob);  // Create a URL for the blob

    const docList = document.querySelector('.doc-list');
    const listItem = document.createElement('li');
    listItem.classList.add('doc-item');

    const pdfPreview = document.createElement('embed');
    pdfPreview.src = url;
    pdfPreview.type = 'application/pdf';
    pdfPreview.classList.add('curved-embed');
    listItem.appendChild(pdfPreview);

    docList.appendChild(listItem);
    listItem.addEventListener('click', function() {
        openPopup(url);
    });
}
