# https://youtu.be/fVeW9a6wItM
# https://github.com/bnsreenu/python_for_microscopists/tree/master/307%20-%20Segment%20your%20images%20in%20python%20without%20training
import torch
import torchvision
import numpy as np
import matplotlib.pyplot as plt
plt.switch_backend('agg')
import cv2
import io
import base64
from PIL import Image
import sys, os

print("PyTorch version:", torch.__version__)
print("Torchvision version:", torchvision.__version__)
print("CUDA is available:", torch.cuda.is_available())

sys.path.append("..")
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator

# Initialize PyTorch model
# Determine the base directory of the project
base_dir = os.path.dirname(os.path.dirname(__file__))

# Define the relative path to the model file
# https://github.com/facebookresearch/segment-anything#model-checkpoints
relative_path_to_model = "models/sam_vit_b_01ec64.pth"

# Generate the absolute path
sam_checkpoint = os.path.abspath(os.path.join(base_dir, relative_path_to_model))
# check if the model file exists
if not os.path.exists(sam_checkpoint):
    raise FileNotFoundError(f"Model file not found: {sam_checkpoint}. Please download it from https://github.com/facebookresearch/segment-anything#model-checkpoints and place it in the 'models' folder.")
model_type = "vit_b"

if torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"

sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
sam.to(device=device)

mask_generator_ = SamAutomaticMaskGenerator(
    model=sam,
    points_per_side=32,
    pred_iou_thresh=0.9,
    stability_score_thresh=0.96,
    crop_n_layers=1,
    crop_n_points_downscale_factor=2,
    min_mask_region_area=100,  # Requires open-cv to run post-processing
)

def base64_to_image(base64_str):
    try:
        # Remove the data URI scheme prefix if it exists
        prefix = 'data:image/png;base64,'
        if base64_str.startswith(prefix):
            base64_str = base64_str[len(prefix):]

        # Ensure the base64 string has proper padding
        base64_str = base64_str.strip()
        missing_padding = len(base64_str) % 4
        if missing_padding:
            base64_str += '=' * (4 - missing_padding)

        # Decode the base64 string
        img_data = base64.b64decode(base64_str)
        # Convert bytes data to an image
        img = Image.open(io.BytesIO(img_data))
        img = np.array(img)
        return img
    except Exception as e:
        print("Error decoding base64 string:", e)
        return None

def image_to_base64(image, masks):
    try:
        # Turn off interactive mode
        plt.ioff()

        buffered = io.BytesIO()
        plt.figure(figsize=(10,10))
        plt.imshow(image)
        show_anns(masks)
        plt.axis('off')

        # Save the figure to the buffer
        plt.savefig(buffered, format="png", bbox_inches='tight', pad_inches=0)
        plt.close()  # Close the figure to free up memory

        # Get the base64 string and add the data URI scheme prefix
        buffered.seek(0)
        img_data = buffered.read()
        img_str = base64.b64encode(img_data).decode("utf-8")
        data_uri = f"data:image/png;base64,{img_str}"
        return data_uri
    except Exception as e:
        print("Error converting image to base64:", e)
        return None


def show_anns(anns):
    if len(anns) == 0:
        return
    sorted_anns = sorted(anns, key=lambda x: x['area'], reverse=True)
    ax = plt.gca()
    ax.set_autoscale_on(False)
    
    for ann in sorted_anns:
        m = ann['segmentation']
        
        # Use float32 instead of float64 to save memory
        img = np.zeros((m.shape[0], m.shape[1], 3), dtype=np.float32)
        color_mask = np.random.random(3)
        
        # Apply color mask
        for i in range(3):
            img[:, :, i] = color_mask[i]
        
        # Combine the mask with the image
        ax.imshow(np.dstack((img, m * 0.35)))


def process_image(base64_image):
    # Convert base64 to image
    image = base64_to_image(base64_image)
    print("Converted base64 to image")
    if image is None:
        return "Error processing image"
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    print("Converted image to BGR")

    # Generate masks
    masks = mask_generator_.generate(image)
    print("Generated masks")

    # Convert segmented image to base64
    base64_segmented_image = image_to_base64(image, masks)
    print("Converted segmented image to base64")
    return base64_segmented_image
