from google.cloud import vision

client = vision.ImageAnnotatorClient()

def process_image(decoded_image):
    return client.annotate_image(create_cloud_vision_request_body(decoded_image))

def create_cloud_vision_request_body(base64_image):
	return {"image": {"content": base64_image}, "features":
        [{"type":"LABEL_DETECTION"},
      	{"type":"LANDMARK_DETECTION"},
        {"type":"SAFE_SEARCH_DETECTION"},
        {"type":"FACE_DETECTION"}
        ]}
