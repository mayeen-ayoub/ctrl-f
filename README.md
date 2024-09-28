# Setup:
- Create python virtual env: `python3 -m venv env`
- Enable python virtual env: `source env/bin/activate`
- Install required packages: `python3 -m pip install -r requirements.txt`
- Create a `.env` file and include the following environment variables:
  - `OPENAI_API_KEY`: API key from OpenAI used for text embedding and text generation
- Run flask server: `python3 server.py`