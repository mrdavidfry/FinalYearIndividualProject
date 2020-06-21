import datetime
import sys
from functools import wraps
import requests
import os, hashlib
import jwt as jwt
import sqlalchemy
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from sqlalchemy import DateTime, func, ForeignKey
from sqlalchemy.orm import backref, relationship, session
import messagebird
import aws_service
import base64
import re
import json
import google_cloud_vision_service
from flask_socketio import SocketIO, send, emit
import recommender_service

# Local imports:

app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = ''
app.config['CORS_HEADERS'] = 'Content-Type'
app.config[
    'SQLALCHEMY_DATABASE_URI'] = ''

db = SQLAlchemy(app)
CORS(app)

app.config['APP_NAME'] = 'Bridge'
MESSAGE_BIRD_ACCESS_KEY = ''
MESSAGE_BIRD_MESSAGE_TEMPLATE = 'Your ' + app.config['APP_NAME'] + ' verification code is: %token'

IMGUR_CLIENT_ID = ''
IMGUR_CLIENT_SECRET = ''

socketio = SocketIO(app, cors_allowed_origins="*")

# Start-up checks:

try:
    MESSAGE_BIRD_ACCESS_KEY
except NameError:
    print('[ERROR: setup] You need to set a MESSAGE_BIRD_ACCESS_KEY constant in this file')
    sys.exit(1)

try:
    message_bird_client = messagebird.Client(MESSAGE_BIRD_ACCESS_KEY)
except:
    print('[ERROR: setup] Failed to setup message_bird client')
    sys.exit(1)


# Database models:

# Parent User model:
class UserAuthentication(db.Model):
    __tablename__ = 'user_authentication'
    user_id = db.Column(db.Integer, primary_key=True, server_default=sqlalchemy.text(
        'user_authentication_user_id_seq()'))
    public_id = db.Column(db.String(64), unique=True, server_default=str(sqlalchemy.text(
        'user_authentication_public_id_seq()')))
    phone_number = db.Column(db.String(15), unique=True)
    socketio_sid = db.Column(db.String(32))
    user_profile = relationship('UserProfile', back_populates=__tablename__, uselist=False)  # One-to-One
    user_stat = relationship('UserStat', back_populates=__tablename__, uselist=False)  # One-to-One
    s = relationship('UserImage')  # One-to-Many

# A Child of UserAuthentication model:
class UserProfile(db.Model):
    __tablename__ = 'user_profile'
    user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), primary_key=True, unique=True)
    first_name = db.Column(db.String(12))
    last_name = db.Column(db.String(15))
    gender = db.Column(db.Integer)
    date_of_birth = db.Column(DateTime)
    phone_number = db.Column(db.String(15))
    country_calling_code = db.Column(db.String(3))
    email = db.Column(db.String(40))
    description = db.Column(db.String(500))
    user_authentication = relationship('UserAuthentication', back_populates=__tablename__)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    is_demo_account = db.Column(db.Boolean, unique=False, default=False)


# A Child of UserAuthentication model:
class UserStat(db.Model):
    __tablename__ = 'user_stat'
    user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), primary_key=True, unique=True)
    creation_date = db.Column(DateTime, default=func.now())
    last_logged_in_date = db.Column(DateTime)
    last_swiped_date = db.Column(DateTime)
    last_matched_date = db.Column(DateTime)
    user_authentication = relationship('UserAuthentication', back_populates=__tablename__)


# A Child of UserAuthentication model:
class UserImage(db.Model):
    __tablename__ = 'user_image'
    image_id = db.Column(db.Integer, primary_key=True, server_default=sqlalchemy.text(
        'user_image_image_id_seq()'))
    user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    image_url = db.Column(db.String(128))
    image_seq_num = db.Column(db.Integer, nullable=False)
    user_image_data = relationship('UserImageData', back_populates=__tablename__, uselist=False)


class UserImageData(db.Model):
    __tablename__ = 'user_image_data'
    image_id = db.Column(db.Integer, db.ForeignKey('user_image.image_id'), primary_key=True, unique=True, nullable=False)
    adult_score = db.Column(db.Integer, unique=False, nullable=False)
    spoof_score = db.Column(db.Integer, unique=False, nullable=False)
    violence_score = db.Column(db.Integer, unique=False, nullable=False)
    racy_score = db.Column(db.Integer, unique=False, nullable=False)
    num_faces = db.Column(db.Integer, unique=False, nullable=False)
    happiness_score = db.Column(db.Integer, unique=False, nullable=True)
    anger_score = db.Column(db.Integer, unique=False, nullable=True)
    sad_score = db.Column(db.Integer, unique=False, nullable=True)
    surprise_score = db.Column(db.Integer, unique=False, nullable=True)
    label_annotation1 = db.Column(db.String(30))
    label_annotation2 = db.Column(db.String(30))
    label_annotation3 = db.Column(db.String(30))
    user_image = relationship('UserImage', back_populates=__tablename__)


# Stores interactions between profiles, such as likes and dislikes
class ProfileInteraction(db.Model):
    __tablename__ = 'profile_interaction'
    interaction_id = db.Column(db.Integer, primary_key=True, server_default=sqlalchemy.text(
        'profile_interaction_interaction_id_seq()'))
    initiated_by_user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    received_by_user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    interaction_level = db.Column(db.Integer)
    interaction_date = db.Column(DateTime)
    is_active = db.Column(db.Boolean)


# Stores match information:
class Match(db.Model):
    __tablename__ = 'match_table'
    match_id = db.Column(db.Integer, primary_key=True, server_default=sqlalchemy.text(
        'match_match_id_seq()'))
    user_1_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    user_2_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    match_date = db.Column(DateTime)
    match_level = db.Column(db.Integer)


class ChatMessage(db.Model):
    __tablename__ = 'chat_message'
    message_id = db.Column(db.Integer, primary_key=True, server_default=sqlalchemy.text(
        'chat_message_message_id_seq()'))
    match_id = db.Column(db.Integer, db.ForeignKey('match_table.match_id'), unique=True, nullable=False)
    message = db.Column(db.String(500))
    sent_by_user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    sent_to_user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    sent_date = db.Column(DateTime)


class UserReport(db.Model):
    __tablename__ = 'user_report'
    report_id = db.Column(db.Integer, primary_key=True, server_default=sqlalchemy.text(
        'user_report_report_id_seq()'))
    reported_by_user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    reported_user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), unique=False, nullable=False)
    reported_date = db.Column(DateTime)
    comment = db.Column(db.String(500))
    report_type = db.Column(db.String(30))


# Represents labels that we ignore from the Google Cloud Vision API
class IgnoredImageLabel(db.Model):
    __tablename__ = 'image_label_ignore_list'
    label = db.Column(db.String(40), primary_key=True)


class UserProfileAnalysis(db.Model):
    __tablename__ = 'user_profile_analysis'
    user_id = db.Column(db.Integer, db.ForeignKey('user_authentication.user_id'), primary_key=True, unique=True)
    description_positive_score = db.Column(db.Float, nullable=False)
    description_negative_score = db.Column(db.Float, nullable=False)

# Decorator functions:

# Decorator to check if JWT is passed in and is valid
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print('Entered checker')
        token = None;
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            print('[WARN: user_authentication]: Token not sent with request.')
            return make_response('Internal server error', 503)

        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'])
            cur_user_auth = UserAuthentication.query.filter_by(user_id=data['public_id']).first()
        except:
            print('[WARN: user_authentication] Failed to authenticate user in function decorated.')
            return make_response('Internal server error', 503)

        return f(cur_user_auth, *args, *kwargs)

    return decorated


# API functions:

@socketio.on('connect')
@token_required
def connect(cur_user_auth):
    cur_user_auth.socketio_sid = request.sid
    print('Length of session id:')
    print(len(request.sid))
    db.session.add(cur_user_auth)
    db.session.commit()
    print('Client connected!')

@socketio.on('disconnect')
@token_required
def disconnect(cur_user_auth):
    #cur_user_auth.socketio_sid = None
    #db.session.add(cur_user_auth)
    #db.session.commit()
    print('Client disconnected!')



# Registers a new user. Sends them an sms code to the verify their account.
@app.route('/user/register', methods=['POST', 'PUT'])
@cross_origin()
def create_user():
    # get data from request body:

    data = request.get_json()

    first_name = str(data['first_name'])
    last_name = str(data['last_name'])
    gender = int(data['gender'])
    date_of_birth = data['date_of_birth']
    country_calling_code = str(data['country_calling_code'])
    phone_number = country_calling_code + str(data['phone_number'])
    email = str(data['email'])

    if first_name is None:
        return make_response('first_name not provided in request body.', 422)

    if last_name is None:
        return make_response('last_name not provided in request body.', 422)

    if gender is None:
        return make_response('gender not provided in request body.', 422)

    if date_of_birth is None:
        return make_response('date_of_birth not provided in request body.', 422)

    if country_calling_code is None:
        return make_response('country_calling_code not provided in request body', 422)

    if phone_number is None:
        return make_response('phone_number not provided in request body', 422)
    # Check user with phone number doesn't already exist:

    user_count = UserAuthentication.query.filter_by(phone_number=phone_number).count()
    if user_count:
        return make_response('Internal server error.', 503)

    new_user_auth = UserAuthentication(phone_number=phone_number)

    new_user_profile = UserProfile(first_name=first_name, last_name=last_name, gender=gender,
                                   date_of_birth=date_of_birth, phone_number=phone_number,
                                   country_calling_code=country_calling_code, email=email)

    new_user_stat = UserStat()

    new_user_auth.user_profile = new_user_profile
    new_user_auth.user_stat = new_user_stat

    new_user_profile.user_authentication = new_user_auth
    new_user_stat.user_authentication = new_user_auth

    db.session.add(new_user_auth)

    if not commit_changes_to_db():
        return make_response('Internal server error.', 503)


    # Send sms code to phone number with Message Bird API:
    return 200#message_bird_verify_create(phone_number)


@app.route('/user/update-profile-info', methods=['POST', 'PUT'])
@cross_origin()
@token_required
def update_user_profile_info(cur_user_auth):
    # get data from request body:

    data = request.get_json()

    first_name = str(data['first_name'])
    last_name = str(data['last_name'])
    description = str(data['description'])
    gender = int(data['gender'])
    date_of_birth = data['date_of_birth']
    country_calling_code = str(data['country_calling_code'])
    phone_number = country_calling_code + str(data['phone_number'])
    email = str(data['email'])

    errors = []
    if first_name is None:
        errors.append('first name not provided')

    if last_name is None:
        errors.append('last name not provided')

    if gender is None:
        errors.append('gender not provided')

    if date_of_birth is None:
        errors.append('date of birth not provided')

    if len(errors) > 0:
        return jsonify({'errors': errors}), 422

    profile = cur_user_auth.user_profile
    profile.first_name = first_name
    profile.last_name = last_name

    has_profile_description_changed = False
    if profile.description is None or profile.description != description:
        has_profile_description_changed = True
        UserProfileAnalysis

    profile.description = description
    profile.gender = gender
    profile.date_of_birth = date_of_birth
    profile.email = email


    if has_profile_description_changed:
        # Run through sentiment analysis API:
        headers = {'x-access-token': 'hdhSGAshwy1123093iIedhgcdDE123{/}',
                    'Content-Type':'application/json'}
        data = {'sentences': description}

        print('About to send request to sentiment api...')
        sentiment_response = requests.post(url='http://127.0.0.1:4000/sentiment_model',
                                            json=data, headers=headers)
        description_positive_score = 0.0
        description_negative_score = 0.0

        if sentiment_response.status_code == 200:
            sentiment_response_json = sentiment_response.json()
            description_positive_score = sentiment_response_json['positive_score']
            description_negative_score = sentiment_response_json['negative_score']


        profile_analysis_row = UserProfileAnalysis.query.filter_by(user_id=cur_user_auth.user_id).first()
        if profile_analysis_row is None:
            profile_analysis_row = UserProfileAnalysis(user_id=cur_user_auth.user_id,
                                                        description_positive_score=description_positive_score,
                                                        description_negative_score=description_negative_score)
            db.session.add(profile_analysis_row)
        else:
            profile_analysis_row.description_positive_score = description_positive_score
            profile_analysis_row.description_negative_score = description_negative_score


    if not commit_changes_to_db():
        return make_response('Internal server error.', 503)

    response = {
            'first_name': profile.first_name,
            'last_name': profile.last_name,
            'gender': profile.gender,
            'description': profile.description,
            'date_of_birth': profile.date_of_birth,
            'phone_number': profile.phone_number,
            'country_calling_code': profile.country_calling_code,
            'email': profile.email
        }

    return make_response('Success', 200)


@app.route('/user/update-profile-pic', methods=['POST', 'PUT'])
@cross_origin()
@token_required
def update_user_profile_pic(cur_user_auth):

    data = request.get_json()
    base_64_img = data['image']

    image_num = None
    try:
        image_num = data['image_num']
        print('image num:')
        print(image_num)
    except:
        image_num =  0

    if image_num is None or image_num < 0 or image_num > 6:
        image_num = 0

    print('image num:')
    print(image_num)

    decoded_img = base64.b64decode(re.sub('^data:image/.+;base64,', '', base_64_img))

    vision_response = google_cloud_vision_service.process_image(decoded_img)
    # print(vision_response)

    image_errors = []
    if (vision_response.safe_search_annotation is None):
        return make_response('Internal server error', 500)

    if (vision_response.safe_search_annotation.adult >= 5):
        image_errors.append('adult')

    if (vision_response.safe_search_annotation.spoof >= 5):
        image_errors.append('spoof')


    faces = vision_response.face_annotations
    num_faces = len(faces)
    if image_num == 0 and num_faces == 0:
        image_errors.append('first_picture_must_contain_a_face')

    #if len(image_errors) > 0:
    #    return jsonify({'image_errors': image_errors}), 422

    image_row = UserImage.query.filter_by(user_id=cur_user_auth.user_id, image_seq_num=image_num).first()

    # upload base64 image to s3:
    image_filename = aws_service.upload_image(decoded_img, cur_user_auth.public_id, image_num)
    image_filename = 'https://dating-app-final-year-project.s3.eu-west-1.amazonaws.com/profile_images/' + image_filename
    happiness_score = None
    anger_score = None
    sad_score = None
    surprise_score = None
    if image_filename is None:
        return make_response('Internal server error', 500)

    if faces is not None and len(faces) > 0:
        happiness_score = 0
        anger_score = 0
        sad_score = 0
        surprise_score = 0
        try:
            for face in faces:
                happiness_score += face.joy_likelihood
                anger_score += face.anger_likelihood
                sad_score += face.sorrow_likelihood
                surprise_score += face.surprise_likelihood

            happiness_score /= num_faces
            anger_score /= num_faces
            sad_score /= num_faces
            surprise_score /= num_faces
        except:
            print('[ERROR]: face_annotations in google cloud vision API response is missing a property')
            pass

    label_annotations = []
    for annotation in vision_response.label_annotations:
        label_annotations.append(str(annotation.description).lower())

    ignore_label_list_rows = IgnoredImageLabel.query.filter(IgnoredImageLabel.label.in_(label_annotations)).with_entities(IgnoredImageLabel.label).all()
    ignore_label_list = []
    for row in ignore_label_list_rows:
        ignore_label_list.append(row.label)

    label_annotations = [item for item in label_annotations if item not in set(ignore_label_list)]
    print('label annotations:')
    print(label_annotations)

    # Ensure array has atleast three elements:
    label_annotations_len = len(label_annotations)
    diff = label_annotations_len - 3 + 1
    for i in range(diff):
        label_annotations.append(None)

    if image_row is None:
        image_row = UserImage(user_id=cur_user_auth.user_id, image_url=image_filename, image_seq_num=image_num)

    db.session.add(image_row)

    if not commit_changes_to_db():
        return make_response('Internal server error.', 503)

    label_annotation1 = None
    label_annotation2 = None
    label_annotation3 = None
    try:
        label_annotation1=label_annotations[0]
    except:
        pass
    try:
        label_annotation2=label_annotations[1]
    except:
        pass
    try:
        label_annotation3=label_annotations[3]
    except:
        pass

    image_data_row = UserImageData.query.filter_by(image_id=image_row.image_id).first()
    if image_data_row is None:
        image_data_row = UserImageData(image_id=image_row.image_id,
                                    adult_score=vision_response.safe_search_annotation.adult,
                                    spoof_score=vision_response.safe_search_annotation.spoof,
                                    violence_score=vision_response.safe_search_annotation.violence,
                                    racy_score=vision_response.safe_search_annotation.racy,
                                    happiness_score=happiness_score,
                                    anger_score=anger_score,
                                    sad_score=sad_score,
                                    surprise_score=surprise_score,
                                    num_faces=num_faces,
                                    label_annotation1=label_annotation1,
                                    label_annotation2=label_annotation2,
                                    label_annotation3=label_annotation3)
        db.session.add(image_data_row)
    else:
        image_data_row.adult_score=vision_response.safe_search_annotation.adult
        image_data_row.spoof_score=vision_response.safe_search_annotation.spoof
        image_data_row.violence_score=vision_response.safe_search_annotation.violence
        image_data_row.racy_score=vision_response.safe_search_annotation.racy
        image_data_row.happiness_score=happiness_score
        image_data_row.anger_score=anger_score
        image_data_row.sad_score=sad_score
        image_data_row.surprise_score=surprise_score
        image_data_row.num_faces=num_faces
        image_data_row.label_annotation1=label_annotation1
        image_data_row.label_annotation2=label_annotation2
        image_data_row.label_annotation3=label_annotation3

    if not commit_changes_to_db():
        return make_response('Internal server error.', 503)

    #result = profile_service.is_suitable_profile_image(base_64_img)
    return make_response('Success', 200)


# Sends a sms code request to the phone_number
@app.route('/user/request-sms-code', methods=['POST', 'PUT'])
@cross_origin()
def request_sms_code():

    data = request.get_json()
    phone_number = str(data['phone_number'])

    if len(phone_number) < 5:
        return jsonify({'message': 'Default login pass', 'verify_id': "111111"})

    user_count = UserAuthentication.query.filter_by(phone_number=phone_number).count()
    if user_count <= 0:
        return make_response('Could not send sms code. User does not exist!', 500)

    return message_bird_verify_create(phone_number)


def message_bird_verify_create(phone_number):

    verify = None

    try:
        #verify = message_bird_client.verify_create(phone_number, {'originator': app.config['APP_NAME'],

        print('hi')                                                            #'template': MESSAGE_BIRD_MESSAGE_TEMPLATE})
    except messagebird.client.ErrorException as e:
        print('[WARN: request_sms_code] An error occurred while attempting to send a verify sms code.')
        for error in e.errors:
            print('[WARN: message_bird] code        : %d' % error.code)
            print('[WARN: message_bird] description : %s' % error.description)
            print('[WARN: message_bird] parameter   : %s\n' % error.parameter)
        return make_response('Could not send sms code!', 503)

    if not verify:
        print('[WARN: request_sms_code] verify object could not be found.')
        return jsonify({'message': 'Verify code sent successfully!', 'verify_id': 111, 'recipient': 11,
                        'valid_until': 'N/a'})


    return jsonify({'message': 'Verify code sent successfully!', 'verify_id': verify.id, 'recipient': verify.recipient,
                    'valid_until': verify.validUntilDatetime})


# Verifies a verify_id and verify_code from the request body. Returns an access-token on success. Returns 401 otherwise.
@app.route('/user/verify', methods=['POST', 'PUT'])
@cross_origin()
def verify_sms():

    data = request.get_json()

    verify_id = str(data['verify_id'])
    verify_code = str(data['verify_code'])

    if (verify_code):
        user_auth = UserAuthentication.query.filter_by(phone_number=str(verify_code)).first()

        if not user_auth:
            print('[ERROR: verify_sms] User does not exist.')
            return make_response('Could not verify sms code. 3', 500)

        public_id = user_auth.user_id
        first_name = user_auth.user_profile.first_name
        access_token_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10000);
        access_token = jwt.encode(
            {'public_id': public_id, 'exp': access_token_expires},
            app.config['JWT_SECRET_KEY'])

        return jsonify({'message': 'You have been verified successfully.', 'access_token': access_token.decode('UTF-8'),
                        'access_token_expires': access_token_expires, 'first_name': first_name})


    verify = None
    try:
        verify = message_bird_client.verify_verify(verify_id, verify_code)
    except messagebird.client.ErrorException as e:
        print('[WARN: verify_sms] An error occurred while verifying the verify_id ' + str(verify_id)
              + ' with verify_code ' + str(verify_code) + ' in method verify_sms.')

        for error in e.errors:
            print('[WARN: message_bird] code        : %d' % error.code)
            print('[WARN: message_bird] description : %s' % error.description)
            print('[WARN: message_bird] parameter   : %s\n' % error.parameter)

    if not verify:
        print('[WARN: verify_sms] An error occurred while verifying the verify_id ' + str(verify_id)
              + ' with verify_code ' + str(verify_code) + ' in method verify_sms. Verify does not exist.')
        return make_response('Could not verify sms code. 1', 500)

    user_phone_number = verify.recipient
    if not user_phone_number or not verify.status == 'verified':
        return make_response('Could not verify sms code. 2', 500)

    # Get the user's id and first name:

    user_auth = None
    public_id = None
    first_name = None

    user_auth = UserAuthentication.query.filter_by(phone_number=str(user_phone_number)).first()

    if not user_auth:
        print('[ERROR: verify_sms] User does not exist.')
        return make_response('Could not verify sms code. 3', 500)

    public_id = user_auth.user_id
    first_name = user_auth.user_profile.first_name
    access_token_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10000);
    access_token = jwt.encode(
        {'public_id': public_id, 'exp': access_token_expires},
        app.config['JWT_SECRET_KEY'])

    return jsonify({'message': 'You have been verified successfully.', 'access_token': access_token.decode('UTF-8'),
                    'access_token_expires': access_token_expires, 'first_name': first_name})


@app.route('/login/info', methods=['GET'])
@cross_origin()
def login_info():
    country_calling_codes = ['1', '33', '34', '44', '49', '352']
    return jsonify(country_calling_codes)


# Gets the profile information of the user who made the request.
@app.route('/user', methods=['GET'])
@cross_origin()
@token_required
def get_user(cur_user_auth):
    print('Getting information about user ' + str(cur_user_auth.user_id) + '...')
    user_profile = UserProfile.query.filter_by(user_id=cur_user_auth.user_id).first()

    image_rows = UserImage.query.filter_by(user_id=user_profile.user_authentication.user_id).order_by(sqlalchemy.asc(UserImage.image_seq_num)).limit(6).all()
    images = []
    for img in image_rows:
        images.append(img.image_url)

    response = {
            'user_id': cur_user_auth.public_id,
            'first_name': user_profile.first_name,
            'last_name': user_profile.last_name,
            'gender': user_profile.gender,
            'description': user_profile.description,
            'date_of_birth': user_profile.date_of_birth,
            'phone_number': user_profile.phone_number,
            'country_calling_code': user_profile.country_calling_code,
            'email': user_profile.email,
            'images': images
        }
    return jsonify({'profile': response})


# Deletes the user who made the request
@app.route('/user/delete', methods=['DELETE'])
@cross_origin()
@token_required
def delete_user(cur_user_auth):
    if not cur_user_auth:
        return make_response('No user found.', 401)

    try:
        db.session.delete(cur_user_auth)
        db.session.commit()
    except:
        return make_response('Could not delete. Please report the issue to customer support.', 500)

    return jsonify({'message': 'User with id ' + str(cur_user_auth.user_id) \
    + ' has been successfully deleted.'})


@app.route('/user/scores', methods=['GET'])
@cross_origin()
@token_required
def get_scores_for_user(cur_user_auth):
    user_image_labels, positive_sentiment_score = recommender_service.get_scores(cur_user_auth)
    response = {
            'user_id': cur_user_auth.public_id,
            'image_labels': list(user_image_labels),
            'sentiment_score': positive_sentiment_score
        }
    return jsonify({'user_ranking_data': response})


# Gets a batch of profiles for the user who made the request to swipe on.
@app.route('/profiles', methods=['GET'])
@cross_origin()
@token_required
def get_profiles(cur_user_auth):

    # get boolean query params:
    imageSimilarity = request.args.get('imageSimilarity')
    textSemanticSimilarity = request.args.get('textSemanticSimilarity')
    textSentimentSimilarity = request.args.get('textSentimentSimilarity')
    print('imageSimilarity' + str(imageSimilarity))
    print('textSemanticSimilarity' + str(textSemanticSimilarity))
    print('textSentimentSimilarity' + str(textSentimentSimilarity))

    page_num = 1
    page_size = 20

    try:
        page_num = int(args.get('page_num'))
    except:
        pass
    try:
        page_size = int(agrs.get('page_size'))
        if page_size > 200:
            page_size = 200
    except:
        pass

    user_profiles = UserProfile.query.filter(UserProfile.user_id!=cur_user_auth.user_id).all()

    recommendation_dict, user_id_to_image_labels_dict, user_id_to_image_similarity_dict, user_id_to_sentiment_similarity_dict, user_id_to_text_semantic_similarity_dict = recommender_service.get_recommendations(cur_user_auth.user_id, imageSimilarity, textSemanticSimilarity, textSentimentSimilarity)
    print('Recommendations:')
    print(recommendation_dict)
    print()
    print('image labels:')
    print(user_id_to_image_labels_dict)
    print()
    print('image similarity:')
    print(user_id_to_image_similarity_dict)
    print()
    print('sentiment similarity:')
    print(user_id_to_sentiment_similarity_dict)
    print()
    print('semantic similarity:')
    print(user_id_to_text_semantic_similarity_dict)

    # Sorting profiles:

    user_profiles_with_no_ranking_list = []

    private_ids_to_user_profile_row_dict = {}
    for user_profile in user_profiles:
        user_id = user_profile.user_authentication.user_id
        private_ids_to_user_profile_row_dict[user_id] = user_profile
        if user_id not in recommendation_dict:
            user_profiles_with_no_ranking_list.append(user_profile)

    ordered_user_profiles = []
    # order recommendations:
    for user_id in recommendation_dict:
        if user_id in private_ids_to_user_profile_row_dict:
            ordered_user_profiles.append(private_ids_to_user_profile_row_dict[user_id])

    # add profiles that are not ranked:
    ordered_user_profiles.extend(user_profiles_with_no_ranking_list)

    responses = []
    for user_profile in ordered_user_profiles:
        image_rows = UserImage.query.filter_by(user_id=user_profile.user_authentication.user_id).order_by(sqlalchemy.asc(UserImage.image_seq_num)).limit(6).all()
        images = []
        for img in image_rows:
            images.append(img.image_url)

        user_auth = user_profile.user_authentication
        the_user_id = user_auth.user_id

        image_labels = []
        image_similarity = -1
        sentiment_similarity = -1
        text_semantic_similarity = -1

        if the_user_id in user_id_to_image_labels_dict:
            image_labels = user_id_to_image_labels_dict[the_user_id]

        if the_user_id in user_id_to_image_similarity_dict:
            image_similarity = user_id_to_image_similarity_dict[the_user_id]

        if the_user_id in user_id_to_sentiment_similarity_dict:
            sentiment_similarity = user_id_to_sentiment_similarity_dict[the_user_id]

        if the_user_id in user_id_to_text_semantic_similarity_dict:
            text_semantic_similarity = user_id_to_text_semantic_similarity_dict[the_user_id]

        response = {
                'user_id': user_auth.public_id,
                'first_name': user_profile.first_name,
                'last_name': user_profile.last_name,
                'gender': user_profile.gender,
                'description': user_profile.description,
                'date_of_birth': user_profile.date_of_birth,
                'images': images,
                'image_labels': list(image_labels),
                'image_similarity': image_similarity,
                'sentiment_similarity': sentiment_similarity,
                'text_semantic_similarity': text_semantic_similarity
            }
        responses.append(response)
    return jsonify({'profiles': responses})

@app.route('/chat', methods=['GET'])
@cross_origin()
@token_required
def get_chat(cur_user_auth):

    args = request.args

    page_num = 1
    page_size = 15
    match_id = None

    try:
        match_id = int(args.get('match_id'))
        print('Getting messages for user ' + str(cur_user_auth.user_id) + ' for match id ' + str(match_id) + '...')
    except:
        return make_response('Internal server error', 500)

    if match_id is None:
        return make_response('Match_id was null in request body.', 400)

    try:
        page_num = int(args.get('page_num'))
    except:
        pass
    try:
        page_size = int(args.get('page_size'))
        if page_size > 30:
            page_size = 30
    except:
        pass

    cur_user_id = cur_user_auth.user_id

    chat_message_rows = ChatMessage.query.filter((ChatMessage.match_id==match_id) & \
    ((ChatMessage.sent_by_user_id==cur_user_id) | (ChatMessage.sent_to_user_id==cur_user_id))) \
    .order_by(sqlalchemy.asc(ChatMessage.message_id), sqlalchemy.desc(ChatMessage.sent_date)) \
    .paginate(per_page=page_size, page=page_num, error_out=False).items

    messages = []
    for chat_message_row in chat_message_rows:
        message = {
            'message': chat_message_row.message,
            'sent_date': chat_message_row.sent_date,
            'sent_by_me': (chat_message_row.sent_by_user_id == cur_user_id)
        }
        messages.append(message)

    return jsonify({'messages': messages})


@app.route('/report', methods=['POST', 'PUT'])
@cross_origin()
@token_required
def report_user(curr_user_auth):
    data = request.get_json()
    reported_public_user_id = str(data['reported_user_id'])
    comment = str(data['comment'])
    report_type = str(data['report_type'])

    reported_private_user_id = get_private_id_from_public_id(reported_public_user_id)
    if reported_private_user_id == -1:
        return make_response('Internal server error.', 500)

    report_row = UserReport(reported_user_id=reported_private_user_id,
                            reported_by_user_id=curr_user_auth.user_id,
                            reported_date=datetime.datetime.utcnow(),
                            comment=comment, report_type=report_type)

    db.session.add(report_row)
    if not commit_changes_to_db():
        return make_response('Internal server error.', 500)

    return make_response('Successfully reported user.', 200)


@socketio.on('message')
@token_required
def message(curr_user_auth, data_str):
    print(data_str)
    print()
    data = json.loads(data_str)
    match_id = int(data['match_id'])
    message = str(data['message'])

    match = Match.query.filter_by(match_id=match_id).first()
    sent_by_user_id = curr_user_auth.user_id

    # set who the message is being sent to:
    sent_to_user_id =  match.user_1_id
    if sent_by_user_id == sent_to_user_id:
        print('sent_by_user_id == sent_to_user_id is True')
        sent_to_user_id = match.user_2_id

    print('send to:' + str(sent_to_user_id))
    print('sent by:' + str(sent_by_user_id))

    chat_message_row = ChatMessage(match_id=match_id, message=message, \
    sent_by_user_id=sent_by_user_id, sent_to_user_id=sent_to_user_id, \
    sent_date=datetime.datetime.utcnow())

    db.session.add(chat_message_row)
    if not commit_changes_to_db():
        emit('error', 'Internal Server Error.')

    sent_by_user_profile = curr_user_auth.user_profile;
    try:
        sent_to_user_room = UserAuthentication.query.filter_by(user_id=sent_to_user_id) \
                        .with_entities(UserAuthentication.socketio_sid).first().socketio_sid
        socketio.emit('message', {'message': message, 'match_id': match_id, \
                                    'sent_by_name': sent_by_user_profile.first_name, \
                                    'sent_date': sent_date}, \
                        room=sent_to_user_room)
        print('Emmitted to:')
        print(sent_to_user_id)
        print(sent_to_user_room)
    except:
        pass


# Gets a batch of matches for the user who made the request.
@app.route('/matches', methods=['GET'])
@cross_origin()
@token_required
def get_matches(cur_user_auth):

    args = request.args

    page_num = 1
    page_size = 20

    try:
        page_num = int(args.get('page_num'))
    except:
        pass
    try:
        page_size = int(args.get('page_size'))
        if page_size > 100:
            page_size = 100
    except:
        pass

    cur_user_id = cur_user_auth.user_id

    match_rows = Match.query.filter((Match.user_1_id==cur_user_id) | \
    (Match.user_2_id==cur_user_id)).paginate(per_page=page_size, \
    page=page_num, error_out=False).items

    matches = []
    for match_row in match_rows:
        matched_user_id = None;
        if (cur_user_id == match_row.user_1_id):
            matched_user_id = match_row.user_2_id
        else:
            matched_user_id = match_row.user_1_id

        match_profile = UserProfile.query.filter_by(user_id=matched_user_id) \
        .first()

        public_user_id = get_public_id_from_private_id(matched_user_id)
        if public_user_id == -1:
            return make_response('Internal server error.', 500)

        image_rows = UserImage.query.filter_by(user_id=match_profile.user_authentication.user_id).order_by(sqlalchemy.asc(UserImage.image_seq_num)).limit(6).all()
        images = []
        for img in image_rows:
            images.append(img.image_url)

        match = {
                'first_name': match_profile.first_name,
                'last_name': match_profile.last_name,
                'gender': match_profile.gender,
                'description': match_profile.description,
                'date_of_birth': match_profile.date_of_birth,
                'match_id': match_row.match_id,
                'user_id': public_user_id,
                'images': images
            }
        matches.append(match)
    return jsonify({'matches': matches})


# Gets a batch of matches for the user who made the request.
@app.route('/matches', methods=['DELETE'])
@cross_origin()
@token_required
def delete_match(cur_user_auth):
    args = request.args
    match_id = int(args.get('match_id'))
    cur_user_id = cur_user_auth.user_id
    deleteQueryCount = Match.query.filter(((Match.user_1_id==cur_user_id) | \
                                        (Match.user_2_id==cur_user_id)) & \
                                        (Match.match_id==match_id)) \
                                        .delete(synchronize_session=False)
    if not commit_changes_to_db():
        return make_response('Internal server error.', 503)

    if deleteQueryCount <= 0:
        return make_response('No match deleted. Perhaps match_id ' \
                                + str(match_id) + ' for user does not exist', 400)

    return make_response('Unmatch was a success.', 200)



# Submits a like/dislike to the backend.
@app.route('/swipe', methods=['POST', 'PUT'])
@cross_origin()
@token_required
def submit_user_interaction(cur_user_auth):
    data = request.get_json()

    interaction_level = data['interaction_level']
    if interaction_level is None:
        return make_response('Interaction level not specified in request body.', 400)

    # Get receiver private id:

    receiver_public_user_id = data['receiver_public_user_id']
    if receiver_public_user_id is None:
        return make_response('Interaction receiver not specified in request body.', 400)

    try:
        receiver_private_user_id = UserAuthentication.query \
        .filter_by(public_id=receiver_public_user_id).first().user_id
    except:
        return make_response('Failed to find receiver.', 400)

    if receiver_private_user_id is None:
        return make_response('Failed to find receiver.', 400)

    # Find first positive interaction between the two users, initiated by this user:
    existing_interaction_1 = ProfileInteraction.query \
    .filter_by(is_active=True, initiated_by_user_id=cur_user_auth.user_id, \
    received_by_user_id=receiver_private_user_id).filter(interaction_level>0) \
    .order_by(sqlalchemy.desc(ProfileInteraction.interaction_date)).first()
    if existing_interaction_1:
        return make_response('Already liked user.', 400)

    # Find first positive interaction initiated by the other person between the two people:
    existing_interaction_2 = ProfileInteraction.query \
    .filter_by(is_active=True, initiated_by_user_id=receiver_private_user_id, \
    received_by_user_id=cur_user_auth.user_id).filter(interaction_level>0) \
    .order_by(sqlalchemy.desc(ProfileInteraction.interaction_date)).first()

    # does the second type of interaction already exist:
    does_interaction_2_exist = not (existing_interaction_2 is None)

    # is the new interaction sent by this user a like:
    is_new_interaction_positive = (interaction_level > 0)

    # does the new interaction result in a match:
    is_match = does_interaction_2_exist and is_new_interaction_positive

    utc_date_now =  datetime.datetime.utcnow()

    # create this interaction in the interaction table:
    new_interaction = ProfileInteraction(initiated_by_user_id=cur_user_auth.user_id, \
    received_by_user_id=receiver_private_user_id, interaction_date=utc_date_now, \
    interaction_level=interaction_level, is_active=(not is_match))

    db.session.add(new_interaction)

    if is_match:
        print('A match has occurred!!')
        existing_interaction_2.is_active = False;

        match = Match(user_1_id=receiver_private_user_id, \
                        user_2_id=cur_user_auth.user_id, match_date=utc_date_now, \
                        match_level=max(interaction_level, existing_interaction_2.interaction_level))

        db.session.add(match)

    if not commit_changes_to_db():
        return make_response('Internal server error.', 503)

    return make_response('Successfully saved interaction.', 200)


# Returns the public user id if the user was found, and -1 otherwise.
def get_public_id_from_private_id(private_user_id):
    public_user_id = None
    try:
        public_user_id = UserAuthentication.query \
        .filter_by(user_id=private_user_id).first().public_id
    except:
        return -1

    if public_user_id is None:
        return -1
    return public_user_id


# Returns the private user id if the user was found, and -1 otherwise.
def get_private_id_from_public_id(public_user_id):
    private_user_id = None
    try:
        private_user_id = UserAuthentication.query \
        .filter_by(public_id=public_user_id).first().user_id
    except:
        return -1

    if private_user_id is None:
        return -1
    return private_user_id


# Returns true on success, false on failure
def commit_changes_to_db():
    try:
        db.session.commit()
    except Exception as e:
        print("ERROR: Failed to commit changes to db.")
        print("Error details:")
        print("Changes will be rolled back")
        print(e)
        print(e.__doc__)
        db.session.rollback()
        return False
    return True

@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()

if __name__ == '__main__':
    socketio.run(app)
