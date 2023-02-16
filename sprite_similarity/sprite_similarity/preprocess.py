import numpy as np
from PIL import Image, ImageChops

import logging

from sprite_similarity.utils import walltimeit #, watchit
from sprite_similarity.io import load_asset

# same as PixiJS; 0 -> Nearest, 1 -> Bilinear
SCALE_MODES = [
    Image.NEAREST,
    Image.BILINEAR
]

#@walltimeit
def cropImage(img, bbox):
    return img.crop(bbox)

#@walltimeit
def tileImage(img, tile):
    if tile is None:
        return img
    offset_x = int(tile[0])
    offset_y = int(tile[1])
    return ImageChops.offset(img, offset_x, offset_y)

#@walltimeit
def rotateImage(img, angle, mode=None, cw=True):
    if cw:
        angle = -angle
    if mode:
        return img.rotate(angle, expand=True, resample=SCALE_MODES[mode])
    else:
        return img.rotate(angle, expand=True)

#@walltimeit
def scaleImage(img, bbox, mode=None):
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    if mode:
        return img.resize((width,height), resample=SCALE_MODES[mode])
    else:
        return img.resize((width, height))
    
def pasteAsset(asset, bbox, orig_size, bgc=(0,0,0)):
    # make sure no alpha in background when adding mask
    bg_color = (bgc[0], bgc[1], bgc[2], 0)
    img = Image.new('RGBA', orig_size, color=bg_color)
    img.paste(asset, box=bbox)
    return img

#@walltimeit
def makeMask(img, bgc=(0,0,0)):
    # make sure no alpha in background when making mask
    bg_color = (bgc[0], bgc[1], bgc[2], 0)
    r,g,b,a = img.split()
    mask = Image.new('RGBA', img.size, color=bg_color)
    mask.putalpha(a)
    return mask

#@walltimeit
def makeTextMask(bbox, orig_size, bgc=(0,0,0)):
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    # make sure no alpha in background when making mask
    bg_color = (bgc[0], bgc[1], bgc[2], 255)
    no_color = (bgc[0], bgc[1], bgc[2], 0)
    img = Image.new('RGBA', (width, height), color=bg_color)
    mask = Image.new('RGBA', orig_size, color=no_color)
    mask.paste(img, box=bbox)
    return mask

#@walltimeit
def saturateAlpha(mask, to_zero=False):
    """
    Replace partial transparency with full or no transparency
    For applying masks
    """
    MAX_PIXEL = 255
    channels = mask.split()
    # cannot remove if no alpha channel
    if len(channels) < 4:
        return
    r,g,b,a = channels
    
    ###if to_zero:
    ###     a = a.point(lambda p: MAX_PIXEL if p == MAX_PIXEL else 0)
    ### else:
    
    # because of how applyMask works
    # (pastes mask instead filtering existing pixels)
    # this actually removes all transparency
    a = a.point(lambda p: 0 if p == 0 else MAX_PIXEL)
    mask.putalpha(a)
    return mask

#@walltimeit
def removeAlpha(img, bg_color):
    channels = img.split()
    # cannot remove if no alpha channel
    if len(channels) < 4:
        return img
    img.load()
    img_rgb = Image.new("RGB", img.size, color=bg_color)
    img_rgb.paste(img, mask=channels[3])
    return img_rgb

def invertMask(mask):
    (r,g,b,a) = mask.split()
    a = ImageChops.invert(a)
    mask = Image.merge('RGBA', (r,g,b,a))
    return mask

#@walltimeit
def applyMasks(img, masks, is_bg=False, bgc=(0,0,0,255)):
    for m in masks:
        if not is_bg:
            m = invertMask(m)
        m = saturateAlpha(m)#, to_zero=False)###HARDCODED
        img = applyMask(img, m, bgc)
    return img

#@walltimeit
def applyMask(img, mask, bgc=(0,0,0,255)):
    mask.load()
    channels = mask.split()
    if len(channels) == 4:
        solidBox = Image.new('RGBA', img.size)#, color=bgc)
        img.paste(im=solidBox, mask=channels[3])
    return img

# @walltimeit
def preprocess_layer(screenshot, assetImg, obj, assetMasks, bg_color, cw=True):
    if assetImg is None:
        textMask = makeTextMask(obj['bbox'], screenshot.size, bgc=bg_color)
        return None, None, textMask
    
    # Apply transformations to the asset
    assetImg = cropImage(assetImg, obj['tbox'])
    assetImg = tileImage(assetImg, obj['tile'])
    assetImg = rotateImage(assetImg, obj['angle'], mode=obj['scaleMode'], cw=cw)
    assetImg = scaleImage(assetImg, obj['bbox'], mode=obj['scaleMode'])
    
    # Paste asset on blank image with same size as the <canvas>
    assetImg = pasteAsset(assetImg, obj['bbox'], screenshot.size, bgc=bg_color)
    
    # generate a mask using this asset to use for underlying objects
    mask = makeMask(assetImg, bgc=bg_color)
    
    # fill transparency, equiv. operation as for object imges
    assetImg = applyMasks(assetImg, [mask], is_bg=False, bgc=bg_color)
    # apply masks from overlying objects to asset 
    assetImg = applyMasks(assetImg, assetMasks, is_bg=True, bgc=bg_color)
    
    # apply background asset mask to object in screenshot
    objectImg = applyMasks(screenshot.copy(), [mask], is_bg=False, bgc=bg_color)
    # apply overlaying asset masks to object
    objectImg = applyMasks(objectImg, assetMasks, is_bg=True, bgc=bg_color)
    
    # crop images
    objectImg = cropImage(objectImg, obj['bbox'])
    assetImg = cropImage(assetImg, obj['bbox'])
    
    # shouldn't be transparency on object image now, remove alpha channel
    objectImg = removeAlpha(objectImg, bg_color)
    assetImg = removeAlpha(assetImg, bg_color)
    
    return objectImg, assetImg, mask

# @walltimeit
def preprocess(screenshot, df, path_assets, bg_color, cw=True, logger_name=None):
    logger = logging.getLogger(logger_name)
    
    # grab just the visible objects on the <canvas>
    df_objects = df[df['visible'] & ~df.apply(check_bounds, axis=1)]
    
    bg_color = (0, 0, 0, 255)
    asset_masks = []
    obj_images = []
    asset_oracles = []

    # for asset_image, obj in zip(asset_images, objects):
    # hack for now - assume all text layered on top of the objects.
    for idx, row in df_objects.sort_values(by="type", ascending=True, inplace=False).iloc[::-1].iterrows(): # HACK for textbox layering!
        # create object description
        obj = {
            'bbox': make_bbox(row),#, clockwise=False),
            'tbox': make_tbox(row) if row['type']=='object' else None,
            'tile': None,
            'angle': make_angle(row),
            # 'scale': calc_scale(row),
            'scaleMode': 1
        }
        # load base asset
        if row['type']=='object':
            asset_image = load_asset(path_assets, row)
            # asset_image = Image.open(make_asset_path(row))
        else:
            asset_image = None

        # preprocess the asset and object
        try:
            obj_image, oracle, mask = preprocess_layer(screenshot, asset_image, obj, asset_masks, bg_color, cw)
            if row['type']=='object':
                obj_images.append(obj_image)
                asset_oracles.append(oracle)
            asset_masks.append(mask)
        except Exception as e:
            logger.warning(f"Preprocessing failed for {obj}")#\n{row['url']}")#\n{row}")
            
    return asset_oracles, obj_images

def check_bounds(row):
    """check if this object actually isn't shown - infinitesimally small"""
    no_width = (row['vx0'] == row['vx1'] == row['vx2'] == row['vx3'])
    no_height = (row['vy0'] == row['vy1'] == row['vy2'] == row['vy3'])
    return (no_width or no_height)

def normalizeRotation(rot):#, clockwise=True):
    if rot == 0:
        return rot
    while rot < 0:
        rot += 2*np.pi
    while rot >= 2*np.pi:
        rot -= 2*np.pi
    # if not clockwise:
    #     rot = (2*np.pi) - rot
    return rot 

def make_angle(row):
    rot = normalizeRotation(row['rotation'])
    return rot * 180 / np.pi

# TODO fix rotations with bbox - bbox should be tighter and then rotated when preprocessing
def make_bbox(row):#, clockwise=True):
    """generate bounding-box from this object's data"""
    rot = row['rotation'] 
    vx0 = row['vx0']
    vx1 = row['vx1']
    vx2 = row['vx2']
    vx3 = row['vx3']
    vy0 = row['vy0']
    vy1 = row['vy1']
    vy2 = row['vy2']
    vy3 = row['vy3']
    
    minx = np.min([vx0, vx1, vx2, vx3])
    miny = np.min([vy0, vy1, vy2, vy3])
    maxx = np.max([vx0, vx1, vx2, vx3])
    maxy = np.max([vy0, vy1, vy2, vy3])
    
    return (int_ceil(minx), int_ceil(miny), int_floor(maxx), int_floor(maxy))

    # normalize rotation
    # rot = normalizeRotation(rot)#, clockwise)
    # cropbox depends on rotation
    # but the scaling factor is different
    # if clockwise:
    #     if (rot >= 0) and (rot < np.pi/2):
    #         return (int_ceil(vx3), int_ceil(vy0), int_floor(vx1), int_floor(vy2))
    #     elif (rot >= np.pi/2) and (rot < np.pi):
    #         return (int_ceil(vx2), int_ceil(vy3), int_ceil(vx0), int_ceil(vy1))
    #     elif (rot >= np.pi) and (rot < 3*np.pi/2):
    #         return (int_floor(vx1), int_floor(vy2), int_ceil(vx3), int_ceil(vy0))
    #     elif (rot >= 3*np.pi/2) and (rot < 2*np.pi):
    #         return (int_floor(vx0), int_floor(vy1), int_floor(vx2), int_floor(vy3))
    # else:
    #     if (rot >= 0) and (rot < np.pi/2):
    #         return (int_ceil(vx1), int_ceil(vy2), int_floor(vx3), int_floor(vy0))
    #     elif (rot >= np.pi/2) and (rot < np.pi):
    #         return (int_ceil(vx0), int_ceil(vy1), int_ceil(vx2), int_ceil(vy3))
    #     elif (rot >= np.pi) and (rot < 3*np.pi/2):
    #         return (int_floor(vx3), int_floor(vy0), int_ceil(vx1), int_ceil(vy2))
    #     elif (rot >= 3*np.pi/2) and (rot < 2*np.pi):
    #         return (int_floor(vx2), int_floor(vy3), int_floor(vx0), int_floor(vy1))
    # print("OOPSIE shouldn't reach here")

def make_tbox(row):
    """generate texture-box from this object's data"""
    # NOT ACCOUNTING FOR ROTATION HERE!!!! ASSET MIGHT BE ROTATED WITHIN SPRITESHEET
    return (int_ceil(row['x']), int_ceil(row['y']), int_floor(row['x']+row['width']), int_floor(row['y']+row['height']))

# def calc_scale(row):
#     """find the width and height of object (different from bbox used for pasting/cropping)"""
#     return (abs(int_floor(row['vx0'] - row['vx1'])), abs(int_floor(row['vy0'] - row['vy3'])))

def int_ceil(num):
    return int(np.ceil(num))

def int_floor(num):
    return int(np.floor(num))