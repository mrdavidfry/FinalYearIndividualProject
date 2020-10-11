Please note that the API keys are missing from inside the "APITokens" folder. The database and MessageBird keys are also missing from app.py. This was for security reasons.

User login has been configured for the DEMO and does not use the MessageBird API in this version for user login.

The GoogleNews-vectors-negative300.bin word2vec model is also missing from the "models" folder due to its large size and the fact that it is a third-party model. Here is a link to the model:
https://code.google.com/archive/p/word2vec/

Steps to run the server:
1. Activate the virtual environment by navigating to this folder and entering the command "source venv/bin/activate"
2. Enter the command "python app.py"
