export class Game {
    /**BUG INJECTION*/
    INJECTED_BUGS = {
        // State bug S1
        "STATE": false,
        // Rendering bugs R1 and R2
        // also need to swap the viking_sheet_small.png to viking_sheet.png
        // in the asset directory of the game, and update code in main.js (lines 230-231)
        "RENDERING": [false, false],
    }
    // State bugs S2,3,4,5,6 injected by altering file in directory
    // Rendering bugs R3,4,5,6 injected by altering file in directory
    // Appearance all bugs injected by altering file in directory
    // Layout all bugs injected by altering file in directory
    /**********************/

    //callbacks
    addTextures;
    loadTextures;
    update;
    mouseMove;
    mouseUp;
    mouseDown;
    keyUp;
    keyDown;
    resize;

    //PIXI things
    app;

    loader;
    ticker;

    //scene things
    currentScene = 'menu';
    menuScene = new PIXI.Container();
    gameScene = new PIXI.Container();
    pauseScene = new PIXI.Container();
    winScene = new PIXI.Container();

    //buttons
    constructor(addTextures, loadTextures, update, mouseMove, mouseDown, mouseUp, keyDown, keyUp, resize) {
        this.addTextures = addTextures;
        this.loadTextures = loadTextures;
        this.update = update;
        this.mouseMove = mouseMove;
        this.mouseUp = mouseUp;
        this.mouseDown = mouseDown;
        this.keyUp = keyUp;
        this.keyDown = keyDown;
        this.resize = resize;
        this.showColliders = false;

        this.devicePixelRatio = window.devicePixelRatio;  

        //PIXI setup
        this.app = new PIXI.Application(
          {
              width: 1280 / this.devicePixelRatio, //window.innerWidth / this.devicePixelRatio,
              height: 720 / this.devicePixelRatio, //window.innerHeight / this.devicePixelRatio,
              //backgroundColor: 0x000000, // set with CSS
              autoResize: false,
              resolution: this.devicePixelRatio,
              antialias: true,
          }
        );

        document.body.appendChild(this.app.view);

        this.ButtonTextStyle = new PIXI.TextStyle({fill: 0xFFFFFF, stroke: 0x0, strokeThickness: 4/this.devicePixelRatio, miterLimit: 2/this.devicePixelRatio, fontSize: 29/this.devicePixelRatio, fontFamily: 'Lucida Console,Lucida Sans Typewriter,monaco,Bitstream Vera Sans Mono,monospace', padding: 0, trim: false});
        this.BigTextStyle = new PIXI.TextStyle({fill: 0xFFFFFF, stroke: 0x0, strokeThickness: 4/this.devicePixelRatio, miterLimit: 2/this.devicePixelRatio, fontSize: 128/this.devicePixelRatio, fontFamily: 'Lucida Console,Lucida Sans Typewriter,monaco,Bitstream Vera Sans Mono,monospace', padding: 0, trim: false}); 

        this.loader = PIXI.Loader.shared;
        this.ticker = PIXI.Ticker.shared;

        //call where user adds textures to loader
        this.addTextures();

        this.loader.load((loader, resources) => {
            //call user-defined loadTextures;
            this.loadTextures(resources);

            //input callbacks
            document.body.onmousemove = (e) => {this.mouseMove(e.x - this.app.view.offsetLeft, e.y - this.app.view.offsetTop)};
            document.body.onmousedown = (e) => {this.mouseDown(e.x - this.app.view.offsetLeft, e.y - this.app.view.offsetTop)};
            document.body.onmouseup = (e) => {this.mouseUp(e.x - this.app.view.offsetLeft, e.y - this.app.view.offsetTop)};
            document.body.onkeydown = (e) => {this.keyDown(e.key)};
            document.body.onkeyup = (e) => {this.keyUp(e.key)};
            //call user-defined update
            this.ticker.add((delta)=>{
                this.update(delta, this.ticker.deltaMS);
            });
        });
    }

    setScene(scene) {
        switch(this.currentScene) {
            case 'game': this.app.stage.removeChild(this.gameScene); break;
            case 'menu': this.app.stage.removeChild(this.menuScene); break;
            case 'pause': this.app.stage.removeChild(this.pauseScene); this.app.stage.removeChild(this.gameScene); break;
            case 'win': this.app.stage.removeChild(this.winScene); this.app.stage.removeChild(this.gameScene); break;
        }

        switch(scene) {
            case 'game': this.app.stage.addChild(this.gameScene); break;
            case 'menu': this.app.stage.addChild(this.menuScene); break;
            case 'pause': this.app.stage.addChild(this.gameScene); this.app.stage.addChild(this.pauseScene); break;
            case 'win': this.app.stage.addChild(this.gameScene); this.app.stage.addChild(this.winScene); break;
            default: console.log('scene "' + scene + '" is not a valid scene!'); return;
        }
        this.currentScene = scene;
    }

    createButton(x, y, width, height, text, texture, func, scene) {
        const b = new PIXI.Sprite(texture);
        b.anchor = new PIXI.Point(0.5, 0.5);
        b.x = x;
        b.y = y;
        b.width = width;
        b.height = height;
        b.interactive = true;
        b.buttonMode = true;

        const t = new PIXI.Text(text, this.ButtonTextStyle);
        t.anchor = new PIXI.Point(0.5, 0.5);
        t.x = x;
        t.y = y;

        b.click = function() {
            b.tint = 0xffffff;
            func();
        }
        b.pointerdown = function() {
            this.tint = 0xbfbfbf;
        };
        b.pointerup = function() {
            this.tint = 0xffffff;
        };
        b.pointerover = function() {
            this.tint = 0xeeeeee;
        };
        b.pointerout = function() {
            this.tint = 0xffffff;
        };

        scene.addChild(b);

        if (text != "") {
            scene.addChild(t);
        } 
            

        //return the button object
        return {'sprite': b, 'text': t};
    }
}