import json
from pathlib import Path
import sys

from sprite_similarity.io import load_snapshot, load_asset, save_results
from sprite_similarity.preprocess import preprocess
from sprite_similarity.compare_embeddings import setup_pytorch, get_model, get_cosine_sims
from sprite_similarity.compare_pixels import get_pixel_sims, get_struc_sims, get_mean_squared_errors
from sprite_similarity.utils import walltimeit, setup_logger

@walltimeit
def run(experiment_name, bg_color_name="0001"):
    """
    Run the experiment with input data in folder named `experiment_name`
    If vis=True, show images of the detected bugs
    """
    
    color_name_to_rgb = {
        "0001": (0, 0, 0, 255),
        "1001": (255, 0, 0, 255),
        "1111": (255, 255, 255, 255)
    }
    
    if bg_color_name not in color_name_to_rgb:
        raise ValueError("Invalid background color name: {}. Pick from: {}".format(bg_color, colorNameToRGB.keys()))
        
    bg_color = color_name_to_rgb[bg_color_name]
    
    path_data = Path("./data")
    path_assets = path_data
    path_results = Path("./results")
    
    run_names = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
    snapshot_names = ["{}".format(i) for i in range(10)]
    #snapshot_names = ["{}".format(i) for i in (0, 1)]
    
    setup_pytorch()
    # create the RN-50 model to get embeddings
    model = get_model()
    
    for run_name in run_names:
        setup_logger("bg_{}_{}_{}".format(bg_color_name, experiment_name, run_name))
        path_exp_data = path_data / experiment_name / run_name
        path_exp_results = path_results / "bg_{}".format(bg_color_name) / experiment_name / run_name
        for ss_name in snapshot_names:
            check_snapshot(ss_name, path_exp_data, path_exp_results, path_assets, model, bg_color)

@walltimeit
def check_snapshot(ss_name, path_exp_data, path_exp_results, path_assets, model, bg_color):

    snapshot, scene_list = load_snapshot(path_exp_data, ss_name)

    object_images = []
    asset_images = []
    asset_masks = []
    object_keys = []

    for obj in reversed(scene_list):            
        asset_img = load_asset(path_assets, obj)
        object_img, asset_img, mask = preprocess(snapshot, asset_img, obj, asset_masks, bg_color)
        if (object_img is not None) and (asset_img is not None):
            object_images.append(object_img)
            asset_images.append(asset_img)
            object_keys.append(json.dumps(obj))

        if mask is not None:
            asset_masks.append(mask)

    cosine_sims = get_cosine_sims(model, object_images, asset_images)
    pixel_sims = get_pixel_sims(object_images, asset_images)
    mses = get_mean_squared_errors(object_images, asset_images)
    struc_sims = get_struc_sims(object_images, asset_images)
    
    results = {
        'object_key': object_keys,
        'cosine_similarity': cosine_sims,
        'pixel_similarity': pixel_sims,
        'mean_squared_error': mses,
        'structural_similarity': struc_sims
    }

    save_results(results, path_exp_results, ss_name)
        
if __name__ == "__main__":
    if len(sys.argv < 2):
        raise ValueError("Experiment folder name required")
    exp_name = sys.argv[1]
    main(exp_name)