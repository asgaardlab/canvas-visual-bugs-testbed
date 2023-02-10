"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_core_1 = require("playwright-core");
const PixiSamplerAPI_1 = require("../pixi-sampler/src/PixiSamplerAPI");
const GAME_URL = "https://asgaardlab.github.io/canvas-visual-bugs-testbed/game/";
const SNAPSHOTS_PATH = `${__dirname}/snapshots`;
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield test("test_0");
}))();
function test(snapshot_name = "test") {
    return __awaiter(this, void 0, void 0, function* () {
        // start browser
        const browser = yield playwright_core_1.chromium.launch({ headless: false });
        // open new page with browser
        const page = yield browser.newPage();
        // create exposer for current page
        // @ts-ignore This works after transpiling to JS
        const sampler = new PixiSamplerAPI_1.PixiSamplerAPI(page, SNAPSHOTS_PATH);
        // open the game website
        yield page.goto(GAME_URL);
        // wait for game to load
        yield page.waitForLoadState("networkidle");
        yield page.waitForLoadState("domcontentloaded");
        yield page.waitForSelector("canvas");
        // once page has loaded, inject the script
        yield sampler.startExposing();
        // click the central button to start game
        yield page.click("canvas");
        // wait for game to load
        yield page.waitForLoadState("networkidle");
        // take snapshot
        yield sampler.takeSnapshot(snapshot_name);
        // end the test
        yield browser.close();
    });
}
