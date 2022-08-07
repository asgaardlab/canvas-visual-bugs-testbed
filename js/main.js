/**
 * Set up event listeners for responsive iFrame
 */ 
if (document.readyState === 'loading') {
    // wait for DOM content to load before running
    document.addEventListener('DOMContentLoaded', addResizeListeners);
} else {
    // if DOM content loaded before script, just run 
    addResizeListeners();
};

function addResizeListeners() {
    const game = document.getElementById('game');
    game.addEventListener('load', resizeGame);
    window.addEventListener('resize', resizeGame);
    window.addEventListener('orientationchange', resizeGame)//() => { window.location.reload() });
}

function resizeGame() {
    const game = document.getElementById('game');
    const gameBlock = document.getElementById('testgame');
    const gameContainer = document.getElementById('gameContainer');
    const boundingRect = gameBlock.getBoundingClientRect();
    const scaleX = boundingRect.width / 1280;
    const scaleY = boundingRect.height / 720;
    const scale = Math.min(scaleX, scaleY);
    game.style['transform'] = `scale(${scale})`;
    game.style['transform-origin'] = 'top left';
    gameContainer.style['width'] = `${1280 * scale}px`;
    gameContainer.style['height'] = `${720 * scale}px`;
    game.style['width'] = `${1280}px`;
    game.style['height'] = `${720}px`;
}
