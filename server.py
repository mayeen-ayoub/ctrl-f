from flask import Flask, send_from_directory, request
from pypdf import PdfReader
import re
# import fitz

app = Flask(__name__, static_folder='public')

# Route to serve the index.html file
@app.route('/')
def serve_index():
	return app.send_static_file('index.html')

# Serve static files (CSS, JS, etc.) directly from the 'public' directory
@app.route('/<path:filename>')
def serve_static_files(filename):
	return send_from_directory(app.static_folder, filename)

@app.route('/extract-text', methods=['POST'])  # Allow POST requests
def extract_text():
		# Open the PDF
		file = request.files['file']
		pdf_reader = PdfReader(file.stream)

		# Initialize a list to store extracted text
		extracted_text = ""

		for page in pdf_reader.pages:
			text = page.extract_text()
			extracted_text += text
		cleaned = clean_text(extracted_text)
		print(cleaned)
		return ""


def clean_text(text):
	cleaned = re.sub(r'\s+', ' ', text).strip()
    # Remove unwanted characters (like hyphens at line breaks)
	cleaned = re.sub(r'-\s+', '', cleaned)
	return cleaned

if __name__ == "__main__":
	app.run(debug=True)
	
	# doc = fitz.open('sample.pdf')
	# text = ""
	# for page in doc:
	# 	text += page.get_text()
	# print(text)
