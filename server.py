from flask import Flask, send_from_directory, request, jsonify, send_file
from pypdf import PdfReader
from io import BytesIO
import re
import os
from dotenv import load_dotenv
import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain.agents import AgentType
from langchain_core.documents import Document
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_openai.chat_models import ChatOpenAI
from langchain.agents.agent_toolkits import create_conversational_retrieval_agent

# Load environment variables
load_dotenv()

# Set up flask app
app = Flask(__name__, static_folder='public')
UPLOAD_FOLDER = "documents"

# Set up FAISS and document vector store
index = faiss.IndexFlatL2(len(OpenAIEmbeddings().embed_query("hello world")))
vector_store = FAISS(
    embedding_function=OpenAIEmbeddings(),
    index=index,
    docstore= InMemoryDocstore(),
    index_to_docstore_id={}
)
retriever = vector_store.as_retriever()
retriever_tool = create_retriever_tool(
  retriever= retriever,
  name="ctrlf_document_retriever",
  description="Searches and returns documents uploaded by the user."
)
added_documents = set()

# Initialize the OpenAI chat agent
chat_model = ChatOpenAI()
agent = create_conversational_retrieval_agent(
    tools=[retriever_tool],
    llm=chat_model,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

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
		parsed_text = grab_text(file)
		print(parsed_text)
		# Add file to vector store if filename is unique
		if file.filename not in added_documents:
			add_document(parsed_text)
			added_documents.add(file.filename)
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

@app.route('/query', methods=['POST'])
def get_response():
	user_message = request.json.get('text')
	print(user_message)

	return_message = "This is the return message"
	
	return jsonify({"status": "success", "message": return_message})
	

def clean_text(text):
	cleaned = re.sub(r'\s+', ' ', text).strip()
	cleaned = re.sub(r'-\s+', '', cleaned)
	return cleaned

# Adds a new document to the vector store
def add_document(new_document_text):
  # Create a Document instance
  new_document = Document(page_content=new_document_text)

  # Split the document if necessary (for larger texts)
  text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
  split_documents = text_splitter.split_documents([new_document])
  
  # Add to the vector store
  vector_store.add_documents(split_documents)
  
  # Update the retriever
  global retriever
  retriever = vector_store.as_retriever()
  
  # Update the retriever tool
  global retriever_tool
  retriever_tool = create_retriever_tool(
    retriever= retriever,
    name="ctrlf_document_retriever",
    description="Searches and returns documents uploaded by the user."
  )

if __name__ == "__main__":
	app.run(debug=True)
