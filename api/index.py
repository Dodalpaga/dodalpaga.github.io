from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys, os

# Add the segmentation directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'segmentation'))
from app import process_image

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Define the request body structure
class ImageRequest(BaseModel):
    base64_image: str

@app.post("/api/image_segmentation")
def image_segmentation(request: ImageRequest):
    # Process the image and get the base64 of the segmented image
    base64_segmented_image = process_image(request.base64_image)
    return {"base64_image": base64_segmented_image}
