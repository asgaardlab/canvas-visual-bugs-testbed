/**
 * Insert layers of parallax background into background of PIXI application.
 * 
 * @param {PIXI.Application} app - the PIXI application instance.
 * @param {string} asset_folder - path to the folder containing background assets.
 * @param {string[]} asset_files - list of file names to load for background (FILO).
 * @param {number[]} dxs - list of the rates of change in x-direction for each layer.
 * @param {number[]} dys - list of the rates of change in y-direction for each layer.
 */
export const addParallaxBackground = (app, asset_folder, asset_files, dxs, dys) => {
    const loader = loadBackgroundSprites(asset_folder, asset_files);
    loader.load((_, resources) => {
        const sprites = asset_files.map(a => 
            new PIXI.TilingSprite(
                resources[a].texture, 
                resources[a].texture.baseTexture.width, 
                resources[a].texture.baseTexture.height
            )
        );
        // Size the background layers accordingly
        sprites.map(s => updateSpriteSize(s, app.screen.width, app.screen.height));
        const layers = createParallaxLayers(sprites, dxs, dys);
        // Add the background layers to the game scene
        const background = new PIXI.Container;
        layers.reverse().map(l => background.addChildAt(l.sprite, 0));
        app.stage.addChildAt(background, 0);
        app.ticker.add((scale) => {
            layers.map(l => animateParallaxLayer(l, scale));
        });
        // add resize listener
        window.addEventListener('resize', () => {
            layers.map(l => updateSpriteSize(l.sprite, app.screen.width, app.screen.height));
        }); 
    });
}
const animateParallaxLayer = (layer, scale) => {
    layer.sprite.tilePosition.x = layer.sprite.tilePosition.x + (layer.dx * scale);
    layer.sprite.tilePosition.y = layer.sprite.tilePosition.y + (layer.dy * scale);
}
const createParallaxLayers = (sprites, dxs, dys) => {
    const layers = sprites.map(s => new Object({"sprite": s}));
    dxs.map((dx, i) => layers[i].dx = dx);
    dys.map((dy, i) => layers[i].dy = dy);
    return layers
}
const updateSpriteSize = (sprite, screenW, screenH) => {
    const scaleX = screenW / sprite.texture.baseTexture.width;
    const scaleY = screenH / sprite.texture.baseTexture.height;
    sprite.scale.set(scaleX, scaleY);
}
const loadBackgroundSprites = (assets_folder, asset_files) => {
    const loader = new PIXI.Loader;
    asset_files.map(a => loader.add(a, assets_folder+a));
    return loader;
}
