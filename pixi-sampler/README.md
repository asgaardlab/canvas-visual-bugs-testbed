# Pixi-sampler

## Requirements

- [Playwright](https://playwright.dev/) (I can add support for other frameworks upon request, but Playwright is recommended)
- [TypeScript](https://www.typescriptlang.org/) (I will add support for pure JavaScript soon, importing the module can be a bit more complicated with pure JS)

## Installation
Currently, this module is not available in `npm`, so installation must be done as follows:

1) Clone this repository: `git clone https://github.com/finlaymacklon/pixi-sampler`
2) Run the command `npm i -D` from the `pixi-sampler` directory
3) Transpile TypeScript using `npm run build`

## Usage

Load and use the Pixi Sampler API into your test code as follows:

```js
import { chromium } from "playwright";
import { PixiSamplerAPI } from "pixi-sampler/src/PixiSamplerAPI.ts"

// set url for your game, e.g., localhost:8000
const url = "localhost:8000" 

(async () => {
  // create browser using playwright
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // create sampler 
  const pixiSampler = new PixiSamplerAPI(page, "path/to/snapshots/folder");

  // define the test to run once you have loaded the page
  page.on("load", async () => {
    if (page.url() !== url) return;

    // inject the sampler into the browser page
    await pixiSampler.startExposing();

    // your test code...

    // sample synchronized Scene Graph and screenshot
    await pixiSampler.takeSnapshot("name_of_snapshot");

    // your test code...

    await browser.close();
  });

  // navigate to your Pixi.js game/app and the test will run
  await page.goto(URL);
}
```

## Feedback

If you have any issues installing or using this module, please [post an issue on this repository](https://github.com/finlaymacklon/pixi-sampler/issues/new) and I will help you out/fix the problem ASAP.
