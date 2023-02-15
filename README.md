# Visual testing for PIXI applications

This repository contains ...

To access the replication package for the paper "Automatically Detecting Visual Bugs in HTML5 \<canvas> Games", please download the source from the [`p1` tag](https://github.com/asgaardlab/canvas-visual-bugs-testbed/releases/tag/p1), or view the code on the [`paper_1` branch](https://github.com/asgaardlab/canvas-visual-bugs-testbed/tree/paper_1).

## Prerequisites

### Python (v3.4+)
- Download and install from https://www.python.org/downloads/
- Run the command `python3 -m pip install ---upgrade pip` to ensure Python's package manager is installed

### Node.js
- First install Node Version Manager (nvm) using instructions from https://github.com/nvm-sh/nvm
- Then use nvm to install node (with npm)

## Installation
~~1) Clone this repo into the test directory of your project~~
1) Download the latest release at the following link: 
2) Unzip the folder and place it inside your `test` directory
3) Open the folder and run `./install.sh`

*Note: Initial installation may take a long time due to Python dependencies*

## Usage

1) Collect snapshots by instrumenting automated test scripts
2) Run visual tests on collected snapshots with Python script

- Snapshot name needs to be known on both ends

### 1. Collecting snapshots
- instrument your test code to capture snapshots, which are pairs of (screenshot, scene graph)

e.g.
```ts
import { chromium } from 'playwright-core'
import { PixiSamplerAPI } from 'pixi-visual-test/pixi-sampler/src/PixiSamplerAPI'

(() => {
     myTest();
})()

async function myTest() {
    const browser = await chromium.launch();
    const page = browser.newPage();
    sampler = new PixiSamplerAPI(page, 'test/snapshots')
    // navigate to page, wait for canvas, and then inject the sampler into the webpage
    await page.goto("https://localhost:8000")
    await page.waitForSelector("canvas");
    await sampler.startExposing();
    // can now take snapshots of the Pixi application
    await sampler.takeSnapshot('my_snapshot');
}
```

### 2. Running visual tests

Run `python3 sprite_similarity test/snapshots/<name_of_snapshot>`
