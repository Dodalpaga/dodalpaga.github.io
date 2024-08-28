from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    # Return the base64 image as received
    return {"base64_image": request.base64_image}
