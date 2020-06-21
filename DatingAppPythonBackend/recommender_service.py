import app

import gensim
import requests
from sqlalchemy import and_

import math

word_2_vec_model = gensim.models.KeyedVectors.load_word2vec_format('./models/GoogleNews-vectors-negative300.bin', binary=True)

IMAGE_SIMILARITY_WEIGHTING = 4
SEMANTIC_TEXT_SIMILARITY_WEIGHTING = 2
SENTIMENT_TEXT_SIMILARITY_WEIGHTING = 1

TWINWORD_APIKEY = '3L0nCBGBKnJbq5FbSbvsAf52xzmJL2ClFx9mqsaqLE/FqsrY7BHXXWW4352UAl6mAiVDu3PcUgRQgM9rpaUKlQ==' # Put the Twinword api access key here

# Returns an ordered list of private user ids from most similar to least similar
def get_recommendations(private_user_id, use_image_scores, use_semantic_scores, use_sentiment_scores):
    user_id_to_score_dict = {}

    user_id_to_image_labels_dict = {}
    image_scores_dict = {}
    sentiment_scores_dict = {}
    semantic_scores_dict = {}

    if use_image_scores == 'true':
        image_scores_dict, user_id_to_image_labels_dict = get_user_id_to_image_similarity_dict(private_user_id)

        # Reweight score:
        image_scores_dict = {k: image_scores_dict[k] * 1 for k in image_scores_dict}
        print(image_scores_dict)
        image_scores_sorted_list = sorted(image_scores_dict, key=image_scores_dict.get, reverse=False)

        print('Image similarity ranking:')
        print(image_scores_sorted_list)

        index = 0
        vote = 0
        for key in image_scores_sorted_list:
            vote = IMAGE_SIMILARITY_WEIGHTING * math.ceil(index / 5.0)
            if key in user_id_to_score_dict.keys():
                user_id_to_score_dict[key] += vote
            else:
                user_id_to_score_dict[key] = vote
            index += 1

    if use_sentiment_scores == 'true':
        sentiment_scores_dict = get_user_id_to_description_sentiment_similarity_dict(private_user_id)
        sentiment_scores_sorted_list = sorted(sentiment_scores_dict, key=sentiment_scores_dict.get, reverse=False)
        index = 0
        vote = 0
        for key in sentiment_scores_sorted_list:
            vote = SEMANTIC_TEXT_SIMILARITY_WEIGHTING * math.ceil(index / 5.0)
            if key in user_id_to_score_dict.keys():
                user_id_to_score_dict[key] += vote
            else:
                user_id_to_score_dict[key] = vote
            index += 1

        print('Sentiment similarity ranking:')
        print(sentiment_scores_sorted_list)

    if use_semantic_scores == 'true':
        semantic_scores_dict = get_user_id_to_description_semantic_similarity_dict(private_user_id)

        # Reweight score:
        semantic_scores_dict = {k: semantic_scores_dict[k] * 1 for k in semantic_scores_dict}
        semantic_scores_sorted_list = sorted(semantic_scores_dict, key=semantic_scores_dict.get, reverse=False)
        index = 0
        vote = 0
        for key in semantic_scores_sorted_list:
            vote = SENTIMENT_TEXT_SIMILARITY_WEIGHTING * math.ceil(index / 5.0)
            if key in user_id_to_score_dict.keys():
                user_id_to_score_dict[key] += vote
            else:
                user_id_to_score_dict[key] = vote
            index += 1

        print('Semantic similarity ranking:')
        print(semantic_scores_sorted_list)

    print(user_id_to_score_dict)
    # Order user_id to score dict in descending order of values:
    user_id_to_score_dict = sorted(user_id_to_score_dict, key=user_id_to_score_dict.get, reverse=True)

    return user_id_to_score_dict, user_id_to_image_labels_dict, image_scores_dict, sentiment_scores_dict, semantic_scores_dict


# Gets the image labels and sentiment scores for a given user.
def get_scores_for_user(cur_user_auth):

    # get image labels:

    user_images_not_to_include = app.UserImage.query.filter_by(user_id=cur_user_auth.user_id).all()
    user_image_ids_not_to_include = []
    for image_row in user_images_not_to_include:
        user_image_ids_not_to_include.append(image_row.image_id)

    curr_user_image_data = app.UserImageData.query.filter(app.UserImageData.image_id.in_(user_image_ids_not_to_include)).all()
    curr_user_image_labels = set()
    for image_data in curr_user_image_data:
        if image_data.label_annotation1 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
            label = image_data.label_annotation1
            curr_user_image_labels.add(label)
        if image_data.label_annotation2 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
            label = image_data.label_annotation1
            curr_user_image_labels.add(label)
        if image_data.label_annotation3 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
            label = image_data.label_annotation1
            curr_user_image_labels.add(label)

    # Get sentiment score:
    curr_user_profile_analysis = app.UserProfileAnalysis.query.filter_by(user_id=private_user_id).first()
    curr_user_profile_analysis = None
    if curr_user_profile_analysis is not None:
        description_positive_score = curr_user_profile_analysis.description_positive_score

    return curr_user_image_labels, description_positive_score

# Takes the private_user_id of the user who the recommendations are being provided to.
# Returns a dictionary mapping private user ids to image similarity scores.
# Image similarity scores range bewteen 0 and 1 (inclusive)
def get_user_id_to_image_similarity_dict(private_user_id):
    user_images_not_to_include = app.UserImage.query.filter_by(user_id=private_user_id).all()
    user_image_ids_not_to_include = []
    for image_row in user_images_not_to_include:
        user_image_ids_not_to_include.append(image_row.image_id)

    curr_user_image_data = app.UserImageData.query.filter(app.UserImageData.image_id.in_(user_image_ids_not_to_include)).all()
    candidate_image_data = app.UserImageData.query.filter(~app.UserImageData.image_id.in_(user_image_ids_not_to_include)).all()

    # Get curr user's image labels
    curr_user_image_labels = set()
    for image_data in curr_user_image_data:
        if image_data.label_annotation1 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
            label = image_data.label_annotation1
            curr_user_image_labels.add(label)
        if image_data.label_annotation2 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
            label = image_data.label_annotation1
            curr_user_image_labels.add(label)
        if image_data.label_annotation3 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
            label = image_data.label_annotation1
            curr_user_image_labels.add(label)

    user_id_to_label_ranking_dict = {}
    user_id_to_num_images_dict = {}
    user_id_to_image_labels_dict = {}

    for target_image_label in curr_user_image_labels:
        for image_data in candidate_image_data:
            max_similarity_score = 0
            candidate_user_id = image_data.user_image.user_id

            if image_data.label_annotation1 is not None and image_data.label_annotation1 in word_2_vec_model.vocab:
                sim_score = word_2_vec_model.similarity(target_image_label, image_data.label_annotation1)
                max_similarity_score = max(max_similarity_score, sim_score)
                if candidate_user_id not in user_id_to_image_labels_dict:
                    user_id_to_image_labels_dict[candidate_user_id] = set()
                user_id_to_image_labels_dict[candidate_user_id].add(image_data.label_annotation1)
            if image_data.label_annotation2 is not None and image_data.label_annotation2 in word_2_vec_model.vocab:
                sim_score = word_2_vec_model.similarity(target_image_label, image_data.label_annotation2)
                max_similarity_score = max(max_similarity_score, sim_score)
                if candidate_user_id not in user_id_to_image_labels_dict:
                    user_id_to_image_labels_dict[candidate_user_id] = set()
                user_id_to_image_labels_dict[candidate_user_id].add(image_data.label_annotation2)
            if image_data.label_annotation3 is not None and image_data.label_annotation3 in word_2_vec_model.vocab:
                sim_score = word_2_vec_model.similarity(target_image_label, image_data.label_annotation3)
                max_similarity_score = max(max_similarity_score, sim_score)
                if candidate_user_id not in user_id_to_image_labels_dict:
                    user_id_to_image_labels_dict[candidate_user_id] = set()
                user_id_to_image_labels_dict[candidate_user_id].add(image_data.label_annotation3)

            if max_similarity_score <= 0:
                continue

            if candidate_user_id not in user_id_to_label_ranking_dict.keys():
                user_id_to_label_ranking_dict[candidate_user_id] = max_similarity_score
                user_id_to_num_images_dict[candidate_user_id] = 1
            else:
                user_id_to_label_ranking_dict[candidate_user_id] += max_similarity_score
                #user_id_to_label_ranking_dict[candidate_user_id] = max(user_id_to_label_ranking_dict[candidate_user_id],
                user_id_to_num_images_dict[candidate_user_id] += 1

    # compute mean scores
    user_id_to_label_ranking_dict = {k: user_id_to_label_ranking_dict[k] / user_id_to_num_images_dict[k] for k in user_id_to_label_ranking_dict if k in user_id_to_num_images_dict}
    print('Id to image labels dictionary:')
    print(user_id_to_image_labels_dict)
    print(user_id_to_label_ranking_dict)
    print()
    return user_id_to_label_ranking_dict, user_id_to_image_labels_dict


# Takes the private_user_id of the user who the recommendations are being provided to.
# Returns a dictionary mapping private user ids to text sentiment scores.
# Text sentiment scores range bewteen 0 and 1 (inclusive)
def get_user_id_to_description_sentiment_similarity_dict(private_user_id):
    curr_user_profile_analysis = app.UserProfileAnalysis.query.filter_by(user_id=private_user_id).first()
    other_users_profile_analysis = app.UserProfileAnalysis.query.filter(app.UserProfileAnalysis.user_id!=private_user_id).all()

    user_id_to_sentiment_score_dict = {}

    if curr_user_profile_analysis is None:
        print('Recommendations based on profile descriptions cannot be made as no profile description analysis data is present for the initial user.')
        return []

    if other_users_profile_analysis is None:
        print('Recommendations based on profile descriptions cannot be made as no profile description analysis data is present for other users.')
        return []

    for profile_analysis in other_users_profile_analysis:
        if profile_analysis.user_id not in user_id_to_sentiment_score_dict.keys():
            score = abs((profile_analysis.description_positive_score - curr_user_profile_analysis.description_positive_score)) + \
                        abs((profile_analysis.description_negative_score - curr_user_profile_analysis.description_negative_score))
            user_id_to_sentiment_score_dict[profile_analysis.user_id] = score

    # normalize scores, with 1 being most similar sentiment and 0 being least similar sentiment:
    user_id_to_sentiment_score_dict = {k: 1 - user_id_to_sentiment_score_dict[k] / 2 for k in user_id_to_sentiment_score_dict}

    return user_id_to_sentiment_score_dict


# Returns a dictionary mapping private user ids to semantic similarity scores taken from
# comparing their profile descriptions with the profile description belonging to
# the user with private id as private_user_id
# Similarity scores range bewteen 0 and 1 (inclusive)
def get_user_id_to_description_semantic_similarity_dict(private_user_id):
    curr_user_profile = app.UserProfile.query.filter_by(user_id=private_user_id).first()

    # case for no recommendations to be made:
    if curr_user_profile is None or curr_user_profile.description is None or curr_user_profile.description.strip() == "":
        print('[INFO] Current user profile has no profile description. No profiles could be recommended based on text similarity.')
        return []

    other_user_profiles = app.UserProfile.query.filter(and_(app.UserProfile.user_id!=private_user_id, app.UserProfile.description!=None)).all()
    print(other_user_profiles)
    print(len(other_user_profiles))
    user_id_to_similarity_score_dict = {}

    for profile in other_user_profiles:
        if profile is None or profile.description is None or profile.description.strip() == "":
            # Do not include profiles without a profile description
            print('Ignore user with private id: ' + str(profile.user_id))
            continue
        r = requests.post('https://api.twinword.com/api/text/similarity/latest/',
                            headers={'X-Twaip-Key': TWINWORD_APIKEY},
                            data={'text1': curr_user_profile.description, 'text2': profile.description})
        try:
            similarity = r.json()['similarity']
            if profile.user_id not in user_id_to_similarity_score_dict.keys():
                print('putting user with user id ' + str(profile.user_id) + ' into dict')
                user_id_to_similarity_score_dict[profile.user_id] = similarity
        except:
            print('[Error]: User in semantic similarity recommendation ranking has been ignored due to an error.')
            print('Ignored user id: ' + profile.user_id)
            pass

    # Order user_id dict in descending order of values:
    return user_id_to_similarity_score_dict


def is_word_in_vocab(word):
    return word in word_2_vec_model.vocab
