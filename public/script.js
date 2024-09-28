// Open the document preview popup and show the actual document
function openPopup(file) {
    const previewContainer = document.getElementById('document-preview');
    previewContainer.innerHTML = '';

    if (file.type.startsWith('image/')) {
    
        const image = document.createElement('iframe');
        image.src = URL.createObjectURL(file);
        image.style.width = '100%';
        previewContainer.appendChild(image);
    } else if (file.type === 'application/pdf') {
        const pdfViewer = document.createElement('embed');
        pdfViewer.src = URL.createObjectURL(file);
        pdfViewer.type = 'application/pdf';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '500px';
        previewContainer.appendChild(pdfViewer);
    } else {
        const unsupportedMessage = document.createElement('p');
        unsupportedMessage.textContent = "Cannot preview this file type.";
        previewContainer.appendChild(unsupportedMessage);
    }

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
            const url = URL.createObjectURL(blob);  // Create a URL for the blob

            const docList = document.querySelector('.doc-list');
            const listItem = document.createElement('li');
            listItem.classList.add('doc-item');

            const imagePreview = document.createElement('embed');
            imagePreview.src = url;
            imagePreview.alt = file.name;
            imagePreview.style.maxWidth = '100px'; 
            listItem.appendChild(imagePreview);

            docList.appendChild(listItem);
            listItem.addEventListener('click', function() {
                openPopup(file);
            });
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

    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.classList.add('message', 'bot');
        botMessage.innerText = "This is a bot reply.";
        messageContainer.appendChild(botMessage);

        messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 1000);
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
                        const url = URL.createObjectURL(blob);
                        const imagePreview = document.createElement('iframe');
                        imagePreview.src = url;  // Set the Object URL as the image source
                        imagePreview.alt = file;  // Use the file name for the alt text
                        imagePreview.style.maxWidth = '100px'; // Set preview image size
                        listItem.appendChild(imagePreview);
    
                        // Append the list item to the doc list
                        docList.appendChild(listItem);
                    });
            });
        });
}
