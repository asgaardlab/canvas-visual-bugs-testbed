import numpy as np
from PIL import Image, ImageChops

from sprite_similarity.utils import walltimeit, watchit

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
def rotateImage(img, angle, mode=None):
    if mode:
        return img.rotate(-angle, resample=SCALE_MODES[mode])
    else:
        return img.rotate(-angle)

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

@walltimeit
def preprocess(snapshot, assetImg, obj, assetMasks, bg_color):
    if assetImg is None:
        textMask = makeTextMask(obj['bbox'], snapshot.size, bgc=bg_color)
        return None, None, textMask
    
    # Apply transformations to the asset
    assetImg = cropImage(assetImg, obj['tbox'])
    assetImg = tileImage(assetImg, obj['tile'])
    assetImg = rotateImage(assetImg, obj['angle'], mode=obj['scaleMode'])
    assetImg = scaleImage(assetImg, obj['bbox'], mode=obj['scaleMode'])
    
    # Paste asset on blank image with same size as the <canvas>
    assetImg = pasteAsset(assetImg, obj['bbox'], snapshot.size, bgc=bg_color)
    
    # generate a mask using this asset to use for underlying objects
    mask = makeMask(assetImg, bgc=bg_color)
    
    # fill transparency, equiv. operation as for object imges
    assetImg = applyMasks(assetImg, [mask], is_bg=False, bgc=bg_color)
    # apply masks from overlying objects to asset 
    assetImg = applyMasks(assetImg, assetMasks, is_bg=True, bgc=bg_color)
    
    # apply background asset mask to object in snapshot
    objectImg = applyMasks(snapshot.copy(), [mask], is_bg=False, bgc=bg_color)
    # apply overlaying asset masks to object
    objectImg = applyMasks(objectImg, assetMasks, is_bg=True, bgc=bg_color)
    
    # crop images
    objectImg = cropImage(objectImg, obj['bbox'])
    assetImg = cropImage(assetImg, obj['bbox'])
    
    # shouldn't be transparency on object image now, remove alpha channel
    objectImg = removeAlpha(objectImg, bg_color)
    assetImg = removeAlpha(assetImg, bg_color)
    
    return objectImg, assetImg, mask