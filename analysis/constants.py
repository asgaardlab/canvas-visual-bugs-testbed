# ----------------------------------------------------------------------------------------------------
# Object names
# ----------------------------------------------------------------------------------------------------
VIKING_S0 = 'viking'
VIKING_S1 = 'viking_1_log'
VIKING_S2 = 'viking_2_logs'
VIKING_S3 = 'viking_3_logs'
VIKING_S4 = 'viking_4_logs'
VIKING_S5 = 'viking_5_logs'
VIKING_S6 = 'viking_crushed'
LOG_S0 = 'log'
LOG_S1 = 'log_smashed'
SHIP = 'ship'
BG_0_SEA = 'bg_sea'
BG_1_GROUND = 'bg_ground'
BG_2_TREES = 'bg_trees_bushes'
BG_2A_BUNNY = 'bg_bunny_1'
BG_3_TREES = 'bg_distant_trees'
BG_3A_BUNNY = 'bg_bunny_2'
BG_4_BUSHES = 'bg_bushes'
BG_5_HILL = 'bg_hill_1'
BG_6_HILL = 'bg_hill_2'
BG_7_CLOUDS = 'bg_huge_clouds'
BG_8_CLOUDS = 'bg_clouds'
BG_9_CLOUDS = 'bg_distant_clouds_1'
BG_10_CLOUDS = 'bg_distant_clouds_2'
BG_11_SKY = 'bg_sky'
GUI_BUTTON = 'gui_button'
GUI_PAUSE = 'gui_pause'
STARTSCREEN = 'startscreen'
# ----------------------------------------------------------------------------------------------------
# The game object types are not provided in PixiJS COR (ie scene graph) 
# But we can translate them based off of the parsed object descriptions
# ----------------------------------------------------------------------------------------------------
DESCRIPTION_TO_KEY = {
    # -----------------------------------------------------------------------------------------------
    # objects keys for all experiments except with visual bugs R1 or R2 injected
    # -----------------------------------------------------------------------------------------------
    '{"tbox": [0, 366, 252, 450], "url": "assets/gui_new.png"}': GUI_BUTTON,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/startscreen.jpg"}': STARTSCREEN,
    '{"tbox": [0, 0, 339, 400], "url": "assets/ship.png"}': SHIP,
    '{"tbox": [0, 0, 190, 190], "url": "assets/viking_sheet_small.png"}': VIKING_S0,
    '{"tbox": [380, 570, 570, 760], "url": "assets/viking_sheet_small.png"}': LOG_S1,
    '{"tbox": [252, 369, 284, 401], "url": "assets/gui_new.png"}': GUI_PAUSE,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_00_sea.png"}': BG_0_SEA,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_01_ground.png"}': BG_1_GROUND,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_02a_bunny.png"}': BG_2A_BUNNY,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_02_trees and bushes.png"}': BG_2_TREES,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_03a_bunny.png"}': BG_3A_BUNNY,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_03_distant_trees.png"}': BG_3_TREES,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_04_bushes.png"}': BG_4_BUSHES,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_05_hill1.png"}': BG_5_HILL,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_06_hill2.png"}': BG_6_HILL,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_07_huge_clouds.png"}': BG_7_CLOUDS,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_08_clouds.png"}': BG_8_CLOUDS,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_09_distant_clouds1.png"}': BG_9_CLOUDS,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_10_distant_clouds.png"}': BG_10_CLOUDS,
    '{"tbox": [0, 0, 1280, 720], "url": "assets/forest/_11_background.png"}': BG_11_SKY,
    '{"tbox": [190, 0, 380, 190], "url": "assets/viking_sheet_small.png"}': VIKING_S1,
    '{"tbox": [570, 380, 760, 570], "url": "assets/viking_sheet_small.png"}': LOG_S0,
    '{"tbox": [380, 0, 570, 190], "url": "assets/viking_sheet_small.png"}': VIKING_S2,
    '{"tbox": [570, 0, 760, 190], "url": "assets/viking_sheet_small.png"}': VIKING_S3,
    '{"tbox": [760, 0, 950, 190], "url": "assets/viking_sheet_small.png"}': VIKING_S4,
    '{"tbox": [190, 190, 380, 380], "url": "assets/viking_sheet_small.png"}': VIKING_S6,
    '{"tbox": [0, 190, 190, 380], "url": "assets/viking_sheet_small.png"}': VIKING_S5,
    # -----------------------------------------------------------------------------------------------
    # repeated object keys because some texture descriptions are intentionally scaled from injected rendering bugs R1 & R2
    # -----------------------------------------------------------------------------------------------
    '{"tbox": [0, 0, 331.8, 331.8], "url": "assets/viking_sheet.png"}': VIKING_S0,
    '{"tbox": [663.6, 995.4000000000001, 995.4000000000001, 1327.2], "url": "assets/viking_sheet.png"}': LOG_S1,
    '{"tbox": [995.4000000000001, 663.6, 1327.2, 995.4000000000001], "url": "assets/viking_sheet.png"}': LOG_S0,
    '{"tbox": [331.8, 0, 663.6, 331.8], "url": "assets/viking_sheet.png"}': VIKING_S1,
    '{"tbox": [663.6, 0, 995.4000000000001, 331.8], "url": "assets/viking_sheet.png"}': VIKING_S2,
    '{"tbox": [331.8, 331.8, 663.6, 663.6], "url": "assets/viking_sheet.png"}': VIKING_S6,
    '{"tbox": [995.4000000000001, 0, 1327.2, 331.8], "url": "assets/viking_sheet.png"}': VIKING_S3,
    '{"tbox": [1327.2, 0, 1659.0, 331.8], "url": "assets/viking_sheet.png"}': VIKING_S4,
    '{"tbox": [0, 331.8, 331.8, 663.6], "url": "assets/viking_sheet.png"}': VIKING_S5,
    # -----------------------------------------------------------------------------------------------
}
# ----------------------------------------------------------------------------------------------------
# To easily reference the experiments based off of the keys as defined in the paper
# The folders from our data/ directory match these names 
# ----------------------------------------------------------------------------------------------------
# state
SB1 = 'exp_state_1'
SB2 = 'exp_state_2'
SB3 = 'exp_state_3'
SB4 = 'exp_state_4'
SB5 = 'exp_state_5'
SB6 = 'exp_state_6'
# appearance
AB1 = 'exp_appearance_1'
AB2 = 'exp_appearance_2'
AB3 = 'exp_appearance_3'
AB4 = 'exp_appearance_4'
AB5 = 'exp_appearance_5'
AB6 = 'exp_appearance_6'
# layout
LB1 = 'exp_layout_1'
LB2 = 'exp_layout_2'
LB3 = 'exp_layout_3'
LB4 = 'exp_layout_4'
LB5 = 'exp_layout_5'
LB6 = 'exp_layout_6'
# rendering
RB1 = 'exp_rendering_1'
RB2 = 'exp_rendering_2'
RB3 = 'exp_rendering_3'
RB4 = 'exp_rendering_4'
RB5 = 'exp_rendering_5'
RB6 = 'exp_rendering_6'
# ----------------------------------------------------------------------------------------------------
# Map the bugs to the primarily affected objects
# Sometimes overlaps means the bug affects other objects too, though.
# ----------------------------------------------------------------------------------------------------
BUGS = {
    VIKING_S0: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, LB2], 
    VIKING_S1: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, AB4, LB4, SB4], 
    VIKING_S2: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, AB4, LB4, SB4], 
    VIKING_S3: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, AB4, LB4, SB4], 
    VIKING_S4: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, AB4, SB4], 
    VIKING_S5: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, AB4, LB4, SB4], 
    VIKING_S6: [SB1, RB1, RB2, RB3, AB1, AB2, AB3, AB4, LB4, SB4], 
    LOG_S0: [RB1, RB2, RB3, AB3, AB4, LB6], 
    LOG_S1: [RB1, RB2, RB3, AB3, AB4, SB5, LB4],  # NOT ALWAYS AFFECTED BY LB4
    SHIP: [SB3, LB1, AB5], 
    BG_0_SEA: [], 
    BG_1_GROUND: [RB6, SB5],  # NOT ALWAYS AFFECTED BY SB5
    BG_2_TREES: [LB5, RB4], 
    BG_2A_BUNNY: [AB6], 
    BG_3_TREES: [LB5], 
    BG_3A_BUNNY: [], 
    BG_4_BUSHES: [RB5], 
    BG_5_HILL: [SB2, SB6], 
    BG_6_HILL: [], 
    BG_7_CLOUDS: [LB3], 
    BG_8_CLOUDS: [], 
    BG_9_CLOUDS: [], 
    BG_10_CLOUDS: [], 
    BG_11_SKY: [LB3], 
    GUI_BUTTON: [], 
    GUI_PAUSE: [], 
    STARTSCREEN: [], 
}
# ----------------------------------------------------------------------------------------------------