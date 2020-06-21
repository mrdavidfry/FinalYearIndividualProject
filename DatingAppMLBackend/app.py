import sentiment_model

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin

from functools import wraps
import re

app = Flask(__name__)
CORS(app)

# Decorator to authenticate
def passcode_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print('Entered authenticator')
        token = None;
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            print('[WARN: user_authentication]: Token not sent with request.')
            return make_response('Internal server error', 503)

        if token == 'hdhSGAshwy1123093iIedhgcdDE123{/}':
            return f(*args)
        else:
            print('[WARN: user_authentication] Failed to authenticate user in function decorated.')
            return make_response('Internal server error', 503)

    return decorated


@app.route('/sentiment_model', methods=['POST'])
@passcode_required
@cross_origin()
def get_sentiment():

    #if request.host_url != 'http://dating-app-backend.herokuapp.com/':
    #    return make_response('Internal server error', 503)

    data = request.get_json()
    sentences = str(data['sentences'])

    sentence_list = re.split('[?!.]', sentences)
    sentence_list_filtered = []
    for s in sentence_list:
        if s == '' or s == None:
            continue
        sentence_list_filtered.append(s)

    positive_score, negative_score = sentiment_model.get_sentiment(sentence_list_filtered)
    print(str(positive_score))
    print(str(negative_score))

    return jsonify({'positive_score': positive_score,
                    'negative_score': negative_score}), 200


if __name__ == '__main__':
    app.run(debug=True, port=4000)
