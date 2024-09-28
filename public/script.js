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

// Handle the file upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        console.log("File selected:", file.name);
        // Here you can add logic to send the file to the server
        alert(`Uploading ${file.name}...`);
    }
}

// Simulate opening popup when clicking a document item
document.querySelectorAll('.doc-item').forEach(item => {
    item.addEventListener('click', openPopup);
});
