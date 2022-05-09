/*
  Level 1: always logs. 1 thrower. avg. 1 sec                               0.000
  Level 2: 1 in 8 are axes. 2 throwers.                                      0.125
  Level 3: 1 in 6 are axes. 1 in 7 are swords. 2 throwers                     0.309
  Level 4: 1 in 7 are axws. 1 in 12 are oar. 1 in 10 are swords. 3 throwers  0.326
  Level 5: 1 in 10 are anvils. 1 in 8 are swords. 1 in 16 are oar. 4 throwers  0.2875

  chance of hazards = 0.3 - 11 * (level - 4) * (level - 4) / 300
 */

import {Game} from "./core.js";
import { addParallaxBackground } from './parallax.js'

class Projectile extends PIXI.AnimatedSprite {
  static GRAVITY = 0.6;
  static HORIZONTAL_GRAVITY = 0.2;
  ax = 0;
  ay = 0;
  vx = 0;
  vy = 0;
  constructor(textures, x, y) {
    super(textures);
    this.x = x;
    this.y = y;
  }

  update(scale, delta) {
    this.vx += this.ax * scale;
    this.vy += this.ay * scale;
    if(this.vx >= 0) {
      this.vx = 0;
      this.ax = 0;
    }
    this.x += Math.floor(this.vx * scale / caberCatch.devicePixelRatio);
    this.y += Math.floor(this.vy * scale / caberCatch.devicePixelRatio);
    this.angle += Math.floor((180/Math.PI) * 0.01 * this.vx * scale);

    if(this.y > caberCatch.app.screen.height - (60/caberCatch.devicePixelRatio)) {
      this.resetAcc();
      this.resetVel();
      this.y = caberCatch.app.screen.height - (60/caberCatch.devicePixelRatio);
          if(!dead && !waitingForNextLevel) increaseScore(-level);

      this.gotoAndStop(this.currentFrame + 4);
      this.rotation = 0;
    }
  }

  resetAcc() {
    this.ax = 0;
    this.ay = 0;
  }
  resetVel() {
    this.vx = 0;
    this.vy = 0;
  }
  resetPos() {
    this.x = projectileRespawnPoint.x;
    this.y = projectileRespawnPoint.y;
  }
  resetAll() {
    this.resetAcc();
    this.resetVel();
    this.resetPos();
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const MAX_PROJECTILES = 10;
let projectileRespawnPoint = new Point(1200, 300);
const PROJ_VEL_Y = -25;
let PROJ_VEL_X = -8; //just the maximum distance projectiles are thrown.

const LOG_COLLIDER_RADIUS = 40;
const PROJ_COLLIDER_RADIUS = 20;
const PLAYER_COLLIDER_RADIUS = 45;

let SCALE = 1; 

const graphics  = new PIXI.Graphics();

let score = 0;
let lives = 3;
let level = 1;

//true if running around, false if dead, waiting for next level
let dead = false;
let waitingForNextLevel = false;
let counter = 0;

let scoreText;
let livesText;
let levelText;

let upperText;
let lowerText;
let countDownText;

let playButton;
let pauseButton;
let keepPlayingButton;
let menuButton;
let okayButton;

const logStack = [];
let logsStacked = 0;

let player;
let menuBGSprite;
let ship;
const SHIP_WAITING = 0;
const SHIP_LEAVING = 1;
const SHIP_BACKING_UP = 2;
let shipState = SHIP_WAITING;

const textures = [];

const projectiles = [];  //animated sprites so can change texture at runtime (reuse as different projectile)

const CATCH_0 = 0;
const CATCH_1 = 1;
const CATCH_2 = 2;
const CATCH_3 = 3;
const CATCH_4 = 4;
const CATCH_5 = 5;
const DIE_LOG = 6;
const DIE_AXE = 7;
const DIE_SWORD = 8;
const DIE_OAR = 9;
const PROJ_AXE = 10;
const PROJ_SWORD = 11;
const PROJ_OAR = 12;
const PROJ_LOG = 13;
const SMASHED_AXE = 14;
const SMASHED_SWORD = 15;
const SMASHED_OAR = 16;
const SMASHED_LOG = 17;

//delays and counters for each 'thrower' in the ship
const delays = [Math.random() +0.5, Math.random() +0.5, Math.random() +0.5, Math.random() +0.5];
const counters = [0, 0, 0, 0];
//index of next projectile available to throw
let nextProjectile = 0;

//God constructor
const caberCatch = new Game(
  function() {
    this.loader
      .add('sheet', 'assets/viking_sheet_small.png')  
      .add('menu', 'assets/startscreen.jpg')
      .add('gui', 'assets/gui_new.png')
      .add('ship', 'assets/ship.png')
  },
  function(resources) {
    
    resources.sheet.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
    resources.gui.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;

    let length = 190;

    for(let y = 0; y < 4; y++) {
      for(let x = 0; x < 5; x++) {
        textures.push(new PIXI.Texture(
          resources.sheet.texture,
          new PIXI.Rectangle(x * length, y * length, length, length)
        ));
      }
    }

    menuBGSprite = new PIXI.Sprite(resources.menu.texture);
    menuBGSprite.height = this.app.screen.height;
    menuBGSprite.width = this.app.screen.width;
    this.menuScene.addChild(menuBGSprite);

    const background_folder = 'assets/forest/';
    const background_files = [
        '_00_sea.png',
        '_01_ground.png',
        '_02a_bunny.png',
        '_02_trees and bushes.png',
        '_03a_bunny.png',
        '_03_distant_trees.png',
        '_04_bushes.png',
        '_05_hill1.png',
        '_06_hill2.png',
        '_07_huge_clouds.png',
        '_08_clouds.png',
        '_09_distant_clouds1.png',
        '_10_distant_clouds.png',
        '_11_background.png'
    ].reverse();
    const dxs = [
        0,
        0,
        13,
        0,
        -9,
        0,
        0,
        0,
        0,
        1,
        4,
        3,
        2,
        0
    ].reverse();
    const dys = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    addParallaxBackground(this.app, background_folder, background_files, dxs, dys);

    const buttonX = 0;
    const buttonY = 732/2;
    const buttonH = 168/2;
    const buttonW = 504/2;

    const pauseX = 504/2;
    const pauseY = 738/2;
    const pauseW = 64/2;
    const pauseH = 64/2;

    let buttonTexture = new PIXI.Texture(this.loader.resources.gui.texture, new PIXI.Rectangle(buttonX, buttonY, buttonW, buttonH));

    playButton = this.createButton(this.app.screen.width/2, this.app.screen.height/2, (buttonW)/this.devicePixelRatio, (buttonH)/this.devicePixelRatio, 'PLAY!',
      new PIXI.Texture(this.loader.resources.gui.texture, new PIXI.Rectangle(buttonX, buttonY, buttonW, buttonH)),
      () => {
        this.setScene('game');
        reset();
      }, this.menuScene);
    //save this one to
    pauseButton = this.createButton(this.app.screen.width-(40/this.devicePixelRatio), 60/this.devicePixelRatio, (pauseW)/this.devicePixelRatio, (pauseH)/this.devicePixelRatio, '',
      new PIXI.Texture(this.loader.resources.gui.texture, new PIXI.Rectangle(pauseX, pauseY, pauseW, pauseH)), pause, this.gameScene);

    keepPlayingButton = this.createButton(this.app.screen.width/2 - (160/this.devicePixelRatio), this.app.screen.height/2, (buttonW)/this.devicePixelRatio, (buttonH)/this.devicePixelRatio, 'CONTINUE',
      buttonTexture,
      () => {
        this.setScene('game');
      }, this.pauseScene);

    menuButton = this.createButton(this.app.screen.width/2 + (160/this.devicePixelRatio), this.app.screen.height/2, (buttonW)/this.devicePixelRatio, (buttonH)/this.devicePixelRatio, 'EXIT',
      buttonTexture,
      () => {
        this.setScene('menu');
      }, this.pauseScene);

    okayButton = this.createButton(this.app.screen.width/2, this.app.screen.height/2, (buttonW)/this.devicePixelRatio, (buttonH)/this.devicePixelRatio, 'OKAY',
      buttonTexture,
      () => {
        this.setScene('menu');
        upperText.visible = false;
      }, this.winScene);

    livesText = new PIXI.Text('LIVES: 3', this.ButtonTextStyle);
    livesText.x = Math.round(20/this.devicePixelRatio);
    livesText.y = Math.round(48/this.devicePixelRatio);
    this.gameScene.addChild(livesText);

    levelText = new PIXI.Text('LEVEL: 1', this.ButtonTextStyle);
    levelText.x = Math.round(220/this.devicePixelRatio);
    levelText.y = Math.round(48/this.devicePixelRatio);
    this.gameScene.addChild(levelText);

    scoreText = new PIXI.Text('SCORE: 0', this.ButtonTextStyle);
    scoreText.x = Math.round(420/this.devicePixelRatio);
    scoreText.y = Math.round(48/this.devicePixelRatio);
    this.gameScene.addChild(scoreText);

    //initialize stack of coffee on side
    for(let i = 0; i < 60; i++) {
      let sack = new PIXI.Sprite(textures[PROJ_LOG]);
      sack.scale.x = SCALE/this.devicePixelRatio;
      sack.scale.y = SCALE/this.devicePixelRatio;
      sack.x = Math.round(-(Math.floor((i / 30) + 1)* 50 + 100 + Math.random() * 20));
      sack.y = Math.round(this.app.screen.height - ((10 * (i%30) - 160 + 20 * Math.floor((i / 30)) - Math.random() * 5)));
      if(i % 30 < 4)
        sack.y += Math.round(10/this.devicePixelRatio);
      sack.visible = false;
      this.gameScene.addChild(sack);
      logStack.push(sack);
    }

    //initialize projectiles
    for(let i = 0; i < MAX_PROJECTILES; i++) {
      const projectile = new Projectile(textures, 900/this.devicePixelRatio, 300/this.devicePixelRatio);
      projectile.anchor = new PIXI.Point(0.5, 0.5);
      projectile.scale.x = SCALE/this.devicePixelRatio;
      projectile.scale.y = SCALE/this.devicePixelRatio;
      //projectile.gotoAndStop(Math.floor(Math.random()*4 + 10));
      projectile.gotoAndStop(PROJ_LOG);
      projectiles.push(projectile);
      this.gameScene.addChild(projectile);
    }
    updateProjectileRespawnPoint();

    player = new PIXI.AnimatedSprite(textures);
    player.scale.x = SCALE/this.devicePixelRatio;
    player.scale.y = SCALE/this.devicePixelRatio;
    player.x = Math.round(this.app.screen.width/2);
    player.y = Math.round(this.app.screen.height - (102/this.devicePixelRatio));
    player.anchor = new PIXI.Point(0.5, 0.5);

    this.gameScene.addChild(player);

    ship = new PIXI.Sprite(resources.ship.texture);
    ship.scale.x = 1/this.devicePixelRatio;
    ship.scale.y = 1/this.devicePixelRatio;
    this.gameScene.addChild(ship);
    ship.x = Math.round(this.app.screen.width - (this.loader.resources.ship.texture.frame.width/this.devicePixelRatio));
    ship.y = Math.round(this.app.screen.height - (this.loader.resources.ship.texture.frame.height/this.devicePixelRatio));

    upperText = new PIXI.Text('BOAT UNLOADED!!', this.ButtonTextStyle);
    upperText.anchor = new PIXI.Point(0.5, 0.5);
    upperText.x = Math.round(this.app.screen.width/2);
    upperText.y = Math.round(this.app.screen.height / 3);
    upperText.visible = false;
    this.gameScene.addChild(upperText);

    lowerText = new PIXI.Text('TRY AGAIN..', this.ButtonTextStyle);
    lowerText.anchor = new PIXI.Point(0.5, 0.5);
    lowerText.x = Math.round(this.app.screen.width/2);
    lowerText.y = Math.round(this.app.screen.height * 2 / 3);
    lowerText.visible = false;
    this.gameScene.addChild(lowerText);

    countDownText = new PIXI.Text('3', this.BigTextStyle);
    countDownText.anchor = new PIXI.Point(0.5, 0.5);
    countDownText.x = Math.round(this.app.screen.width/2);
    countDownText.y = Math.round(this.app.screen.height / 3);
    countDownText.tint = 0xeeff00;  //yellow
    countDownText.alpha = 0.5;
    countDownText.visible = false;
    this.gameScene.addChild(countDownText);

    updateProjectileRespawnPoint();

    updateProjectileVelocity();

    this.app.stage.addChild(this.menuScene);

    this.app.stage.addChild(graphics);

    this.resize(this.app.screen.width, this.app.screen.height);
  },
  function(scale, delta) {

    if(this.currentScene !== 'game') return; //if not playing, return

    //if dead, increment deadCounter
    if(dead) {
      counter+=delta;
      let seconds = (counter / 1000);
      switch(Math.floor(seconds)) {
        case 0: break;
        case 1: countDownText.visible = true; countDownText.text = '3'; break;
        case 2: countDownText.text = '2'; break;
        case 3: countDownText.text = '1'; break;
        case 4: dead = false; player.gotoAndStop(CATCH_0); countDownText.visible = false; lowerText.visible = false; break;
      }

      countDownText.alpha = Math.ceil(seconds) - seconds;
      countDownText.scale.set((seconds - Math.floor(seconds) + 1) / 2);
    }

    //if waitingForNextLevel, increment waitingCounter
    if(waitingForNextLevel) {
      counter+=delta;

      let dx = this.app.screen.width - ship.x; //distance from left edge of ship to right edge of screen
      let shipSpeed = 8 - (dx / ship.width) * 7;
      if(shipState === SHIP_LEAVING) {
        if(ship.x < this.app.screen.width) {
          ship.x += Math.round((shipSpeed * scale) /this.devicePixelRatio);
        }
        if(counter / 1000 >= 3) {
          shipState = SHIP_BACKING_UP;
          upperText.text = 'NEXT BOAT!!';
        }
      }

      if(shipState === SHIP_BACKING_UP) {
        ship.x -= Math.round(shipSpeed * scale / 2);
        if(ship.x <= this.app.screen.width - (this.loader.resources.ship.texture.frame.width/this.devicePixelRatio)) {
          shipState = SHIP_WAITING;
          upperText.visible = false;
        }
      }

      if(counter / 1000 >= 5 && shipState === SHIP_WAITING) {
        waitingForNextLevel = false;
        // clear stack of coffee
        resetlogStack();
        logsStacked = 0;
        // reset player anim
        player.gotoAndStop(CATCH_0);
        // increment level
        level++;
        levelText.text = 'LEVEL: ' + level;

        waitingForNextLevel = false;
      }
    }

    //throwing projectiles
    if(!dead && !waitingForNextLevel) {
      let throwers = level;
      if(level >= 3) throwers--;

      for (let i = 0; i < throwers ; i++) {
        counters[i] += delta / 1000;
        // *** assuming delays.length === counters.length
        if (counters[i] >= delays[i]) {
          delays[i] = Math.random() + 0.5;  //range 0.5 -> 1.5
          counters[i] = 0;

          projectiles[nextProjectile].resetAll();
          projectiles[nextProjectile].visible = true;
          projectiles[nextProjectile].ay = Projectile.GRAVITY;
          projectiles[nextProjectile].ax = Projectile.HORIZONTAL_GRAVITY;
          projectiles[nextProjectile].vy = ((Math.random() * (PROJ_VEL_Y + 16)) - 16);//this.devicePixelRatio;
          projectiles[nextProjectile].vx = ((Math.random() * (PROJ_VEL_X + 10)) - 10);//this.devicePixelRatio;  //horizontal is range from -8 to -max

          projectiles[nextProjectile].gotoAndStop(PROJ_LOG);
          if(Math.random() < 0.3 - 11 * (level - 4) * (level - 4) / 300) {
            //is hazard
            if(level < 4) {
              projectiles[nextProjectile].gotoAndStop(Math.random() * (level - 1) + 10);
            } else if(level >= 4) {
              projectiles[nextProjectile].gotoAndStop(Math.random() * 3 + 10);
            }
          }

          nextProjectile++;
          if (nextProjectile === MAX_PROJECTILES)
            nextProjectile = 0;
        }
      }
    }
    //update projectiles
    for(const projectile of projectiles) {
      projectile.update(scale, delta);
    }

    //check for and react to collisions
    if(!dead && !waitingForNextLevel) {
      for (const projectile of projectiles) {
        let dx = projectile.x - player.x;
        let dy = projectile.y - player.y;

        //early skip if the projectile is smashed
        if(projectile.currentFrame >= SMASHED_AXE) {
          continue;
        }
        //hit! if coffee, reset projectile, increase score, set sprite, play sound
        else if (projectile.currentFrame === PROJ_LOG) {
          if (Math.sqrt(dy * dy + dx * dx) <= LOG_COLLIDER_RADIUS/this.devicePixelRatio + PLAYER_COLLIDER_RADIUS/this.devicePixelRatio) {
            //max coffee
            player.gotoAndStop(player.currentFrame + 1);
            if (player.currentFrame === DIE_LOG) {
              projectile.resetAll();
              projectile.visible = false;
              loseLife();
            }
            else {
              increaseScore(2 * level);
              projectile.resetAll();
              projectile.visible = false;
            }
          }
        }
        //if other, lose life, set sprite, lose? play dead sound
        else if (Math.sqrt(dy * dy + dx * dx) <= PROJ_COLLIDER_RADIUS + PLAYER_COLLIDER_RADIUS) {

          loseLife();
          projectile.resetAll();

          switch (projectile.currentFrame) {
            case PROJ_OAR:
              player.gotoAndStop(DIE_OAR);
              break;
            case PROJ_AXE:
              player.gotoAndStop(DIE_AXE);
              break;
            case PROJ_SWORD:
              player.gotoAndStop(DIE_SWORD);
              break;
          }
        }
      }
    }
  },
  function(x, y) {
    if (!dead && !waitingForNextLevel && this.currentScene === 'game') {
      if ((x/this.devicePixelRatio) > (300/this.devicePixelRatio) && (x/this.devicePixelRatio) < this.app.screen.width - ((this.loader.resources.ship.texture.width/this.devicePixelRatio) + player.width/4)) {
        player.x = Math.round(x/this.devicePixelRatio);
      } else if((x/this.devicePixelRatio) <= (300/this.devicePixelRatio)){
        player.x = Math.round(300/this.devicePixelRatio);
      } else {
        player.x = Math.round(this.app.screen.width - (this.loader.resources.ship.texture.width/this.devicePixelRatio + player.width/4));
      }

    }
  },
  function(x, y) {
    //if win, cant place things
    if(this.currentScene !== 'game') return;

    //if player is on the left side of screen, increase score, decrement anim frame
    if(player.x <= (350/this.devicePixelRatio) && !dead && !waitingForNextLevel) {
      if(player.currentFrame > 0) {
        player.gotoAndStop(player.currentFrame - 1);
        increaseScore(3 * level);
        logStack[logsStacked].visible = true;
        logsStacked++;

        for(let i = 4; i > 0; i--) {
          if((logsStacked % 30) - i >= 4) {
            logStack[logsStacked - i].y += i;
            logStack[logsStacked - i].x += Math.random() * 2 - 1;
          }
        }

        //complete level
        if(logsStacked >= 10 * (level + 1)) {
          increaseScore(level * 25); //bonus for beating level
          if(level === 5) {
            increaseScore(lives * 250);
            this.setScene('win');
            upperText.text = 'GAME OVER!! SCORE: ' + score;
            upperText.visible = true;
            return;
          }
          debugger
          counter = 0;
          waitingForNextLevel = true;
          shipState = SHIP_LEAVING;
          upperText.text = 'BOAT UNLOADED!!'
          upperText.visible = true;
        }
      }
    }
  },
  function(x, y) {},
  function(key) {
    if(key === 'Escape') {
      pause();
    }
  },
  function() {},
  function(width, height) {} // don't resize, fixed size for the <canvas>
);

function pause() {
  if(caberCatch.currentScene === 'game') {
    caberCatch.setScene('pause');
  }
}

function resetlogStack() {
  for(let i = 0; i < logStack.length; i++) {
    logStack[i].visible = false;
    logStack[i].x = Math.round((-Math.floor((i / 30) + 1)* 50 + 100 + Math.random() * 20)/caberCatch.devicePixelRatio);
    logStack[i].y = Math.round((caberCatch.app.view.height - 10 * (i%30) - 160 + 20 * Math.floor((i / 30)) - Math.random() * 5)/caberCatch.devicePixelRatio);
    if(i % 30 < 4)
      logStack[i].y += Math.round(10/caberCatch.devicePixelRatio);
  }
}

//resets game
function reset() {
  player.gotoAndStop(CATCH_0);
  resetlogStack();
  logsStacked = 0;
  score = 0;
  scoreText.text = 'SCORE: ' + score;
  lives = 3;
  livesText.text = 'LIVES: ' + lives;
  level = 1;
  levelText.text = 'LEVEL: ' + level;
  //reset projectiles
  for(let projectile of projectiles) {
    projectile.resetAll();
  }
  counters[0] = 0;
  counters[1] = 0;
  counters[2] = 0;
  counters[3] = 0;
}

function increaseScore(amount) {
  if(score+amount >= 0) {
    score += amount;
  }
  scoreText.text = 'SCORE: ' + score;
}

function loseLife() {
  if(lives === 0) {
    caberCatch.setScene('win');
    upperText.text = 'GAME OVER!! SCORE: ' + score;
    upperText.visible = true;
    return;
  }
  lives--;
  livesText.text = 'LIVES: ' + lives;
  dead = true;
  counter = 0;
  lowerText.text = 'TRY AGAIN..';
  lowerText.visible = true;
}

function updateProjectileRespawnPoint() {
  projectileRespawnPoint.x = Math.round(caberCatch.app.screen.width - (100/caberCatch.devicePixelRatio));
  projectileRespawnPoint.y = Math.round(caberCatch.app.screen.height - ((caberCatch.loader.resources.ship.texture.height/8)/caberCatch.devicePixelRatio));
}

function updateProjectileVelocity() {
  //using kinematics, find time it takes for projectile to fall, use that time to determine vi
  let d = (projectileRespawnPoint.y - caberCatch.app.view.height + 60); //vertical distance (-)
  let vf = -Math.sqrt(PROJ_VEL_Y * PROJ_VEL_Y + 2 * (-Projectile.GRAVITY) * d); //middle step since I dont want to use quadratic formula
  let t = 2 * d / (-PROJ_VEL_Y + vf);
  PROJ_VEL_X = (-caberCatch.app.view.width + (400) - 0.5 * (Projectile.HORIZONTAL_GRAVITY) * t * t) / t;  //solve for vi
}
