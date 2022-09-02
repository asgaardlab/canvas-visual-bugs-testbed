// browser automation framework
import { firefox, webkit, chromium } from "playwright";

// for canvas testing
import * as pdebug from "./pixi-exposer/tools/pixiDebugger/src/api.js";

// options
const SLOWMO = 0;
const HEADLESS = false;
const URL = "http://localhost:8000/";
const DEVTOOLS = false;

const rootPath = process.cwd();

/**
 * Run the test spec contained in this file 10 times to get 10 sets of datapoints per bug. 
 * (Running 10 times for redundancy)
 */
(async () => {
  let testRunName = process.argv[2];
  if (testRunName === undefined)
    testRunName = "snapshots";
  const subRunList = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  await runTest(testRunName, subRunList);
})();

async function runTest(testRunName, subRunList) {
  const subRunName = subRunList.pop();
  const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOWMO, devtools: DEVTOOLS });
  const page = await browser.newPage();
  await page.setViewportSize({
    width: 1280,
    height: 720,
  });
  // run the test once the page is fully loaded
  page.on('load', async () => {
    if (page.url() !== URL) return;
    console.log(subRunName);
    console.log('Page loaded.');
    await pdebug.loadScript(page);
    await pdebug.injectDebugger(page);
    await getExperimentData(page, testRunName, subRunName);
    console.log('Test complete.\nClosing browser...')
    await browser.close();
    if (subRunList.length > 0) {
      await runTest(testRunName, subRunList);
    }
  });
  await page.goto(URL);
}

async function getExperimentData(page, testRunName, subRunName) {
  let startIsShown = false;
  console.log('looking for start button....')
  while (!startIsShown)
    startIsShown = await checkForObject(page, 'assets/gui_new.png')
  console.log('found start button!')
  await captureCanvasState(page, testRunName, subRunName, '0');
  await startGame(page);
  //await captureCanvasState(page);
  setTimeout(captureCanvasState, 1000, page, testRunName, subRunName, '1');
  setTimeout(captureCanvasState, 2000, page, testRunName, subRunName, '2');
  setTimeout(captureCanvasState, 3000, page, testRunName, subRunName, '3');
  setTimeout(captureCanvasState, 4000, page, testRunName, subRunName, '4');
  setTimeout(captureCanvasState, 5000, page, testRunName, subRunName, '5');
  setTimeout(captureCanvasState, 6000, page, testRunName, subRunName, '6');
  setTimeout(captureCanvasState, 7000, page, testRunName, subRunName, '7');
  setTimeout(captureCanvasState, 8000, page, testRunName, subRunName, '8');
  await loseGame(page);
  // grab a snapshot of the current application state
  await captureCanvasState(page, testRunName, subRunName, '9'); 
};

async function captureCanvasState(page, testRunName, subRunName, snapshotName) {
  const snapshotPath = `${rootPath}/${testRunName}/${subRunName}/${snapshotName}`;
  const canvas = await page.$("canvas");
  // grab snapshot of state of objects on <canvas> and snapshot of rendered content
  await pdebug.takeStateSnapshot(page, canvas, snapshotPath);
}

async function checkForObject(page, resourceUrl) {
  const findObject = pdebug.makeGameSelector([
    pdebug.filterByResource(resourceUrl),
    pdebug.mapProperties(['x', 'y'])
  ]);
  const findObjectHandle = await page.evaluateHandle(findObject);
  const findObjectJson = await findObjectHandle.jsonValue();
  if (findObjectJson.length > 0) 
    return true;
  return false;
}

/**
 * Find the start button on canvas and click it to begin the game.
 * @arg {Object} page - PlayWright reference to game page.
 */
 async function startGame(page) {
  // just assuming there is one canvas on the web page.
  //const canvas = document.getElementsByTagName('canvas')[0];
  const canvas = await page.$("canvas");
  const canvasBounds = await canvas.boundingBox();
  const getBounds = pdebug.makeGameSelector([
    pdebug.filterByType("PIXI.Text"),
    pdebug.filterByText("PLAY!"),
    pdebug.mapProperties(["x", "y", "height", "width"]),
  ]);
  let boundsHandle, boundsJson;
  while (!boundsJson) {
    boundsHandle = await page.evaluateHandle(getBounds);
    boundsJson = await boundsHandle.jsonValue();
  }
  const { x, y, height, width } = boundsJson[0];
  const xClick = canvasBounds.x + x;
  const yClick = canvasBounds.y + y;
  //await page.click("canvas", options={position:{x: xClick, y: yClick}});
  await page.click('canvas', {position: {x: xClick, y: yClick}})
  //await canvas.click(options={position: {x: xClick, y: yClick}})
}

/**
 * Move character to middle of screen and wait until we lose.
 * @arg {Object} page - PlayWright reference to game page.
 */
async function loseGame(page) {

  const canvas = await page.$("canvas");
  const canvasBounds = await canvas.boundingBox();

  const checkLoss = pdebug.makeGameSelector([
    pdebug.filterByType("PIXI.Text"),
    pdebug.filterByVisible("true"),
    pdebug.filterByText("TRY AGAIN.."),
    pdebug.mapProperties(["visible"])
  ]);

  let didLose = false;

  const max_x = canvasBounds.width;
  const max_y = canvasBounds.height;
  const osc_x0 = max_x/4;
  const osc_x1 = 3 * osc_x0;
  const osc_y = max_y/2;

  let step = osc_x0;
  let stepSize = 100;
  let parity = 1;

  while (!didLose) {
    if (step <= osc_x0) {
      parity = 1;
    } else if (step >= osc_x1) {
      parity = -1;
    }
    step += parity;
    if (step%stepSize === 0) {
      await page.mouse.move(step, osc_y);
    }
    // wait until we lose the game
    const checkLossHandle = await page.evaluateHandle(checkLoss);
    const checkLossResult = await checkLossHandle.jsonValue();
    if (checkLossResult.length > 0) {
      didLose = true;
    }
  }
}