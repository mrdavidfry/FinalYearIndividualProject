# Stores all functions that interact with aws
import boto3
from APITokens.aws import AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, IMAGES_BUCKET_NAME

# Uploads a base 64 encoded image to s3. Returns the filename on success, None on failure
def upload_image(image, public_user_id, image_num):
    filename = public_user_id + "_" + str(image_num) + ".png"
    try:
        s3 = boto3.resource('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
        result = s3.Bucket(IMAGES_BUCKET_NAME).put_object(Key='profile_images/' + filename, Body=image)
    except Exception as e:
        print('ERROR: Failed to upload image to s3 bucket.')
        print('Filename: ' + filename)
        print(e)
        return None
    return filename
