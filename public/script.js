// Open the document preview popup
function openPopup() {
    document.getElementById('popup').style.display = 'flex';
    document.querySelector('.container').classList.add('blur');
}

// Close the document preview popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.querySelector('.container').classList.remove('blur');
}

// Open user information popup
function openUserPopup() {
    document.getElementById('userPopup').style.display = 'flex';
    document.querySelector('.container').classList.add('blur');
}

// Close the user popup
function closeUserPopup() {
    document.getElementById('userPopup').style.display = 'none';
    document.querySelector('.container').classList.remove('blur');
}


// Trigger file upload dialog
function triggerUpload() {
    document.getElementById('fileInput').click();
}

// Handle the file upload and preview
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const docList = document.querySelector('.doc-list');
        const listItem = document.createElement('li');
        listItem.classList.add('doc-item');

        if (file.type.startsWith('image/')) {
            // If the file is an image, show a preview
            const imagePreview = document.createElement('img');
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.alt = file.name;
            imagePreview.style.maxWidth = '100px'; // Set preview image size
            listItem.appendChild(imagePreview);
        } else if (file.type === 'application/pdf') {
            // If the file is a PDF, use <embed> to show the first page
            const pdfPreview = document.createElement('embed');
            pdfPreview.src = URL.createObjectURL(file);
            pdfPreview.type = 'application/pdf';
            pdfPreview.width = '100%';
            pdfPreview.height = '200px'; // Adjust height as needed
            listItem.appendChild(pdfPreview);
        } else {
            // For other file types, display a message (or handle accordingly)
            listItem.textContent = "Preview not available for this file type.";
        }

        // Add the file to the document list
        docList.appendChild(listItem);
    }
}


// Simulate opening popup when clicking a document item
document.querySelectorAll('.doc-item').forEach(item => {
    item.addEventListener('click', openPopup);
});

// Function to handle sending the message
function sendMessage(event) {
    event.preventDefault(); // Prevent the form from reloading the page

    // Get the message text from the input field
    const input = document.getElementById('chat-input');
    const messageText = input.value.trim(); // Trim spaces

    if (messageText === '') return; // Prevent empty messages

    // Display user's message
    const messageContainer = document.getElementById('messages');
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user');
    userMessage.innerText = messageText;
    messageContainer.appendChild(userMessage);

    // Clear the input field
    input.value = '';

    // Scroll to the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Prevent multiple bot replies by using setTimeout only once
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.classList.add('message', 'bot');
        botMessage.innerText = "This is a bot reply."; // Replace with actual bot logic
        messageContainer.appendChild(botMessage);

        // Scroll to the latest message
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 1000); // Simulate delay for bot response
}

// Attach the chat functionality to the form
document.getElementById('chat-form').addEventListener('submit', sendMessage);
