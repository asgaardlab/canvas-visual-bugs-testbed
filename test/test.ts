import { chromium, firefox } from "playwright-core"
import { PixiSamplerAPI } from "../pixi-sampler/src/PixiSamplerAPI"

const GAME_URL = "https://asgaardlab.github.io/canvas-visual-bugs-testbed/game/";
const SNAPSHOTS_PATH = `${__dirname}/snapshots`;

(async () => {
    await test("test_0");
})()

async function test(snapshot_name:string = "test") {
    // start browser
    const browser = await chromium.launch({ headless: false });
    // open new page with browser
    const page = await browser.newPage();
    // create exposer for current page
    // @ts-ignore This works after transpiling to JS
    const sampler = new PixiSamplerAPI(page, SNAPSHOTS_PATH);
    // open the game website
    await page.goto(GAME_URL);
    // wait for game to load
    await page.waitForLoadState("load");
    await page.waitForSelector("canvas");
    await page.waitForTimeout(1000); // 1 second
    // once game has loaded, inject the script
    await sampler.startExposing();
    // click the central button to start game
    await page.click("canvas");
    // wait for game to start up
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // 1 second
    // take snapshot
    await sampler.takeSnapshot(snapshot_name);
    // end the test
    await browser.close();
}
