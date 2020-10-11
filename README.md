DatingAppFrontend contains all the frontend web application code.

DatingAppMLBackend is a Python Flask app that runs the fine-tuned ALBERT sentiment analysis model and receives calls from DatingAppPythonBackend to determine the sentiment of a particular text.

DatingAppPythonBackend is also a Python Flask app. It carries out the main backend functions including: allowing users to register/login, modify their data, like other users, and provides user recommendations based on a ranking system discussed in my final report.
