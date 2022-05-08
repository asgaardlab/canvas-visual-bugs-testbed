import os
import random
import numpy as np
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.models as models

from PIL import Image

from sprite_similarity.utils import walltimeit

tensor_transform = transforms.Compose([
    transforms.Resize((224,224)), 
    transforms.ToTensor(), 
    #transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

display_transform = transforms.Compose([
    transforms.Resize((224,224))
    ])

concat = lambda x: np.concatenate(x, axis=0)
to_np = lambda x: x.data.to('cpu').numpy()

class Wrapper(torch.nn.Module):
    def fw_hook(self, module, input, output):
        self.layer4_ouputs = output
    
    def __init__(self, model):
        super(Wrapper, self).__init__()
        self.model = model
        self.layer4_ouputs = None
        self.query = None
        self.cossim_value = {}
        self.model.layer4.register_forward_hook(self.fw_hook)

    def forward(self, input):
        _ = self.model(input)
        return self.layer4_ouputs

    def __repr__(self):
        return "Wrapper"

#@walltimeit
def setup_pytorch():
    # set random seed
    seed = 420
    random.seed(seed)
    np.random.seed(seed)
    
    # limit to just one GPU
    os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID" 
    os.environ["CUDA_VISIBLE_DEVICES"] = "0"
    
    # print GPU info to be sure
    device_count = torch.cuda.device_count()
    print("Device count = {}".format(device_count))
    for i in range(device_count):
        name = torch.cuda.get_device_name(device=i)
        print("Device {}/{}: {}".format(i+1, device_count, name))

@walltimeit
def get_model():
    model = models.resnet50(pretrained=True)
    model = model.cuda()
    model.eval(); 
    # You can also do this: 
    #(nn.Sequential(*list(model.children())[:layer-6] 
    # But it is not a recommended way to access the inner layer's activation
    # Keep in mind PyTorch has a new API for this task:
    # https://pytorch.org/vision/main/feature_extraction.html
    # DONT USE THIS ONE AS THER ARE A BUG IN THIS FUNCTION ATM.
    return Wrapper(model)

#@walltimeit
def get_tensors(images):
    tensors = []
    for img in images:
        if img.mode == "RGBA": 
            img = drop_alpha_channel(img)
        tensors.append(tensor_transform(img))
    return tensors

def drop_alpha_channel(img_rgba):
    img_rgba.load()  # needed for split()
    img_rgb = Image.new('RGB', img_rgba.size)
    img_rgb.paste(img_rgba, mask=img_rgba.split()[3])
    return img_rgb

#@walltimeit
def get_embeddings(wrapped_model, tensors):
    batch = torch.stack(tensors)
    embeddings = None
    with torch.no_grad():
        batch = batch.cuda()
        embeddings = wrapped_model(batch)
    return embeddings

#@walltimeit
def calculate_similarity(object_embeddings, asset_embeddings):
    """
    Similarity for object snapshot images and corresponding asset image
    """
    object_embeddings = object_embeddings.view(-1, 2048*7*7)
    object_embeddings = F.normalize(object_embeddings, dim=1)

    asset_embeddings = asset_embeddings.view(-1, 2048*7*7)
    asset_embeddings = F.normalize(asset_embeddings, dim=1)

    similarities = to_np(torch.einsum('ij,ij->i', object_embeddings, asset_embeddings))

    return similarities

@walltimeit
def get_cosine_sims(model, object_images, asset_images):
    object_tensors = get_tensors(object_images)
    asset_tensors = get_tensors(asset_images)
    # encoding images with RN-50 embeddings
    object_embeddings = get_embeddings(model, object_tensors)
    asset_embeddings = get_embeddings(model, asset_tensors)
    # calculating cosine similarities between pairs
    return calculate_similarity(object_embeddings, asset_embeddings)