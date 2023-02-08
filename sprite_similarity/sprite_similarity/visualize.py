import numpy as np
from matplotlib import pyplot as plt

from PIL import Image, ImageDraw

# from sprite_similarity.cosine_sim import display_transform
from sprite_similarity.utils import walltimeit


def plot_comparisons(asset_oracles, obj_images, errors, path_figure):
    cols = 2
    rows = len(asset_oracles)
    fig, axes = plt.subplots(rows, cols, figsize=(cols * 5, rows * 3))
    for im1, im2, err, (idx, ax) in zip(asset_oracles, obj_images, errors, enumerate(axes)):
        ax[0].imshow(im1)
        ax[1].imshow(im2)
        for a, name in zip(ax, [f"Oracle #{rows - idx - 1}", f"Error={err:.1f}"]):
            a.set_xticks([])
            a.set_yticks([])
            a.set_title(name)
    plt.savefig(path_figure)

    
def plot_bounding_boxes(screenshot, df_objects):
    check_ss = ss.copy()
    check_ss_draw = ImageDraw.Draw(check_ss)  

    for idx, row in df_objects.iloc[::-1].iterrows():
        bbox = make_bbox(row)#, clockwise=False)
        check_ss_draw.rectangle(bbox, outline ="red", width=1)


def plot_errors(errors, path_figure, error_type="MSE"):
    figsize = 2 * np.flip([4,20])
    plt.figure(figsize=figsize)
    plt.bar(x=np.flip(np.arange(0,len(errors))), height=errors)
    plt.xticks(np.flip(np.arange(0,len(errors))))
    plt.xlim(0, len(errors))
    plt.xlabel("Layer#")
    plt.ylabel(error_type)
    plt.xticks(rotation=90)
    # plt.show() 
    plt.savefig(path_figure)


# #@walltimeit
# def plot_pairs(cos_sims, pix_sims, obj_imgs, asset_imgs, ss_name, subtitle_pre="layer"):
#     """
#     Plot expected and actual results for each object in a snapshot.
#     """
    
#     figsize = (8, 2*cos_sims.shape[0])
#     fig, axes = plt.subplots(cos_sims.shape[0], 2, figsize=figsize)
    
#     if len(axes.shape) == 1:
#         axes = [axes]
    
#     for i, (ax, c_sim, p_sim, o_img, a_img) in enumerate(zip(axes, cos_sims, pix_sims, obj_imgs, asset_imgs)):
#         #ax[0].imshow(display_transform(a_img))
#         ax[0].imshow(a_img)
#         ax[0].set_xticks([])
#         ax[0].set_yticks([])
#         ax[0].set_title("{} {}".format(subtitle_pre, len(obj_imgs) - i))
#         #ax[1].imshow(display_transform(o_img))
#         ax[1].imshow(o_img)
#         ax[1].set_xticks([])
#         ax[1].set_yticks([])
#         title = 'cos = {0:.3f}\npix = {1:.3f}'.format(c_sim, p_sim)
#         ax[1].set_title(title, weight='bold')
#     fig.set_tight_layout(True)
#     fig.suptitle("Snapshot {}".format(ss_name), weight='bold')
#     fig.show()

    
# #@walltimeit
# def plot_bugs(cos_sims, pix_sims, obj_imgs, asset_imgs, ss_name, th_cos=0.9, th_pix=0.9):
#     """
#     Plot expected and actual results for each object in a snapshot.
#     """
    
#     is_bug_cos = cos_sims < th_cos
#     is_bug_pix = pix_sims < th_pix
    
#     is_bug = is_bug_cos | is_bug_pix
    
#     if not is_bug.any():
#         #print("No bugs detected in snapshot {}.".format(ss_name))
#         return
    
#     cos_sims_b = []
#     pix_sims_b = []
#     obj_imgs_b = []
#     asset_imgs_b = []
#     for b, c, p, o, a in zip(is_bug, cos_sims, pix_sims, obj_imgs, asset_imgs):
#         if b:
#             cos_sims_b.append(c)
#             pix_sims_b.append(p)
#             obj_imgs_b.append(o)
#             asset_imgs_b.append(a)
    
#     cos_sims_b = np.array(cos_sims_b)
#     pix_sims_b = np.array(pix_sims_b)
    
#     plot_pairs(cos_sims_b, pix_sims_b, obj_imgs_b, asset_imgs_b, ss_name, "bug")
