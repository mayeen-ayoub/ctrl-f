from flask import Flask, send_from_directory, request, jsonify, send_file
from pypdf import PdfReader
from io import BytesIO
import re
import os
from pdf2image import convert_from_path

# import fitz

app = Flask(__name__, static_folder='public')

UPLOAD_FOLDER = "documents"

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
		file = request.files['file']
		file_path = os.path.join(UPLOAD_FOLDER, file.filename)
		file.save(file_path)

		print(grab_text(file))
		
		return send_from_directory(UPLOAD_FOLDER, file.filename, as_attachment=True)

def grab_text(file):
	pdf_reader = PdfReader(file.stream)
	extracted_text = ""
	for page in pdf_reader.pages:
			text = page.extract_text()
			extracted_text += text
	return clean_text(extracted_text)

@app.route('/files', methods=['GET'])
def get_files():
    files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.pdf')]
    return jsonify(files)

@app.route('/files/<filename>', methods=['GET'])
def serve_file(filename):
    # Send the requested PDF file
    return send_from_directory(UPLOAD_FOLDER, filename)

# @app.route('/thumbnail/<filename>', methods=['GET'])
# def get_thumbnail(filename):
# 	images = convert_from_path(os.path.join(UPLOAD_FOLDER, filename), first_page=1, last_page=1)
	
# 	img_byte_arr = BytesIO()
# 	images[0].save(img_byte_arr, format='PNG')
# 	img_byte_arr.seek(0)
	
# 	return send_file(img_byte_arr, mimetype='image/png')
	

def clean_text(text):
	cleaned = re.sub(r'\s+', ' ', text).strip()
	cleaned = re.sub(r'-\s+', '', cleaned)
	return cleaned

if __name__ == "__main__":
	app.run(debug=True)
