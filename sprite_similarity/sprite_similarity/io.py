import json
import requests
from urllib.parse import urlparse, urljoin
import numpy as np
import pandas as pd
from pathlib import Path
from PIL import Image

import logging
import subprocess
import time

from sprite_similarity.utils import walltimeit
from sprite_similarity.visualize import plot_comparisons, plot_errors

# @walltimeit
def load_snapshot(path_snapshot, logger_name):
    path_snapshot_string = str(path_snapshot)
    path_img = Path(f"{path_snapshot_string}.png")
    path_pixi_json = Path(f"{path_snapshot_string}.json")
    path_pixi_csv = Path(f"{path_snapshot_string}.csv")
    
    parse_pixi(path_pixi_json, path_pixi_csv, logger_name=logger_name)
    
    df = pd.read_csv(path_pixi_csv)
    screenshot = Image.open(path_img)
    
    return screenshot, df

def parse_pixi(path_pixi_json, path_pixi_csv, logger_name=None):
    logger = logging.getLogger(logger_name)
    node_code = f"cd pixi-sampler && npm run parse ../{path_pixi_json} ../{path_pixi_csv}"
    logger.info(f"Began parsing the PIXI scene graph")
    process = subprocess.run(node_code, shell=True, check=True, capture_output=True, text=True)
    logger.info(process.stdout)
    logger.info(f"Completed parsing the PIXI scene graph, saved to path '{path_pixi_csv}'")
    
# @walltimeit
def load_asset(path_assets, obj):
    file_name = Path(urlparse(obj['url']).path).name
    path_asset = path_assets / file_name
    asset_img = Image.open(path_asset)
    return asset_img

def crawl_assets(df, base_url_assets, path_assets, logger_name=None):
    logger = logging.getLogger(logger_name)
    urls_to_crawl = df["url"].dropna().unique().tolist()
    resources_got = [*path_assets.glob("*.png")] # assumes all resources are PNG
    # get each asset
    logger.info("start crawling assets")
    for url in urls_to_crawl:
        if base_url_assets and base_url_assets not in url:
            url = urljoin(base_url_assets, url)
        path_write = path_assets / f"{Path(urlparse(url).path).name}"
        # don't re-crawl assets
        if path_write in resources_got:
            logger.info("already have {}".format(url))
            continue
        # 5 tries per asset
        for i in range(5):
            resp = requests.get(url)
            if resp.status_code == 200:
                logger.info("successfully got {}".format(url))
                with open(path_write, "wb") as f:
                    f.write(resp.content)
                break
        resources_got.append(path_write)
        time.sleep(2)
    logger.info("done crawling assets")

# @walltimeit
def save_results(results, path_results, ss_name, logger_name=None):
    logger = logging.getLogger(logger_name)
    path_exp_results = Path(path_results)
    # set up paths and ensure directories exist
    path_exp_results.mkdir(exist_ok=True, parents=True)
    path_results_file = path_results / "{}.csv".format(ss_name)
    # place results into DataFrame then save as csv
    # index: layer number
    layer_idx = [i for i in reversed(range(1, len(results)+1))]
    # convert to dataframe with new index
    df_results = pd.DataFrame(results, index=layer_idx)
    df_results.to_csv(path_results_file)
    logger.info(f"Wrote results to path '{path_results_file}'")

def create_figures(asset_oracles, obj_images, errors, path_results, ss_name):
    path_fig_comp = path_results / f"{ss_name}_comparisons.png" 
    path_fig_err = path_results / f"{ss_name}_errors.png"
    plot_comparisons(asset_oracles, obj_images, errors, path_fig_comp)
    plot_errors(errors, path_fig_err)
