import google_api_wrapper
import base64

# Returns true if image is suitable for the application, false otherwise.
# Also returns a list of reasons why the image was denied.
def is_suitable_profile_image(image):
    explicit = google_api_wrapper.detect_explicit(image)
    print(explicit)
    return explicit
