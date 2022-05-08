import json
import numpy as np
import pandas as pd
from pathlib import Path
from PIL import Image

from sprite_similarity.utils import walltimeit

@walltimeit
def load_snapshot(path_experiment_data, ss_name):
    path_img = Path(path_experiment_data) / "{}.png".format(ss_name)
    path_pixi_json = Path(path_experiment_data) / "{}.json".format(ss_name)
    
    scene_list = parse_pixi_json(path_pixi_json)
    snapshot = Image.open(path_img)
    
    return snapshot, scene_list

@walltimeit
def load_asset(path_assets, obj):
    if obj['url'] is None:
        return
    path_sheet = Path(path_assets) / obj['url']
    assetImg = Image.open(path_sheet)
    return assetImg

@walltimeit
def parse_pixi_json(path_pixi_json):
    with open(Path(path_pixi_json)) as f:
        pixi_json = json.load(f)
        
    scene_list = []
    
    RES = pixi_json['resolution']
    
    for obj in pixi_json['scene']:
        desc = {}
        
        obj_left = RES * (obj['x'] - (obj['width'] * obj['anchor.x']))
        obj_top = RES * (obj['y'] - (obj['height'] * obj['anchor.y']))
        # not every object is scaled by the renderer, but some are
        has_equal_widths = obj['width'] == obj['texture.frame']['width']
        has_equal_heights = obj['height'] == obj['texture.frame']['height']
        if has_equal_widths or has_equal_heights:
            obj_height = RES * obj['height'] * obj['scale.y']
            obj_width = RES * obj['width'] * obj['scale.x']
        else:
            obj_height = RES * obj['height'] 
            obj_width = RES * obj['width']
        
        obj_right = obj_left + obj_width
        obj_bottom = obj_top + obj_height
        
        # TODO handle roundPixels or blend when non-integer coordinates
        obj_left = int_floor(obj_left)
        obj_top = int_floor(obj_top)
        obj_right = int_floor(obj_right)
        obj_bottom = int_floor(obj_bottom)
            
        asset_left = obj['texture.frame']['x']
        asset_top = obj['texture.frame']['y']
        asset_height = obj['texture.frame']['height']
        asset_width = obj['texture.frame']['width']
        asset_right = asset_left + asset_width
        asset_bottom = asset_top + asset_height
            
        desc['bbox'] = (obj_left, obj_top, obj_right, obj_bottom)
        #desc['scale'] = (RES * obj['scale.y'], RES * obj['scale.x'])
        desc['tbox'] = (asset_left, asset_top, asset_right, asset_bottom)
        desc['angle'] = obj['angle']
        
        if ('tilePosition.x' in obj) and ('tilePosition.y' in obj):
            desc['tile'] = (RES * obj['tilePosition.x'], RES * obj['tilePosition.y'])
        else:
            desc['tile'] = None
        
        if 'texture.baseTexture.scaleMode' in obj:
            desc['scaleMode'] = obj['texture.baseTexture.scaleMode']
        else:
            desc['scaleMode'] = None

        if 'texture.baseTexture.resource.url' in obj:
            desc['url'] = obj['texture.baseTexture.resource.url']
        else:
            desc['url'] = None
            
        scene_list.append(desc)
    
    return scene_list

def int_ceil(num):
    return int(np.ceil(num))

def int_floor(num):
    return int(np.floor(num))

@walltimeit
def save_results(results, path_exp_results, ss_name):
    path_exp_results = Path(path_exp_results)
    # set up paths and ensure directories exist
    path_exp_results.mkdir(exist_ok=True, parents=True)
    path_results_file = path_exp_results / "{}.csv".format(ss_name)
    # place results into DataFrame then save as csv
    # index: layer number
    layer_idx = [i for i in reversed(range(1, len(results['object_key'])+1))]
    # convert to dataframe with new index
    df_results = pd.DataFrame(results, index=layer_idx)
    df_results.to_csv(path_results_file)
