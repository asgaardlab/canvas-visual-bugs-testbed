# Visual testing for PixiJS applications

Automated visual testing framework for PixiJS applications.
Early in development and does not yet work for all PixiJS apps (see [Issues](https://github.com/asgaardlab/canvas-visual-bugs-testbed/issues/)).

**Note:** To access the replication package for our paper ["Automatically Detecting Visual Bugs in HTML5 \<canvas> Games"](https://asgaard.ece.ualberta.ca/papers/Conference/ASE_2022_Macklon_Automatically_Detecting_Visual_Bugs_In_HTML5_Canvas_Games.pdf):
- download the source from the [`p1` tag](https://github.com/asgaardlab/canvas-visual-bugs-testbed/releases/tag/p1)
- download the data from [Zenodo](https://zenodo.org/record/6950640)

## Features
- Collect snapshots from a [PixiJS](https://github.com/pixijs/pixijs) application; snapshots contain a screenshot paired with a scene graph
- Perform automatic visual comparisons between oracles (generated during the test) and the objects rendered to the \<canvas\>
- Supports automated test scripts written with [Playwright](https://playwright.dev/) in [TypeScript](https://www.typescriptlang.org/)

#### __Note:__ To detect visual bugs, must set baseline (acceptable) error scores and then perform regression testing. This functionality will be added to the framework in a future release.

## Prerequisites

### Python (v3.4+)
Download and install the latest version of Python from [this link](https://www.python.org/downloads/). After installing Python, ensure Python's package manager (Pip) is installed by running the command:

 `python3 -m pip install ---upgrade pip` 

### Node.js
Using the instructions found at [this link](https://github.com/nvm-sh/nvm), first install Node Version Manager (nvm), and then use nvm to install Node and Node Package Manager (npm).

## Installation
1) Download the latest release from the [releases page](https://github.com/asgaardlab/canvas-visual-bugs-testbed/releases/)
2) Unzip the folder and place it inside your test directory
3) Open the folder in your terminal and run the command `npm install -D`

*Note: Initial installation may take a long time due to Python dependencies*

## Usage

1) Collect snapshots by instrumenting automated test scripts
2) Run visual tests on collected snapshots with Python script

- Snapshot name needs to be known on both ends

### 1. Collecting snapshots
- instrument your test code to capture snapshots, which are pairs of (screenshot, scene graph)
- sampling API requires reference to Playwright browser `Page` instance
- sampling API requires call to inject into the `Page` instance before samples can be taken

__Importing:__
```ts 
import { PixiSamplerPlaywright } from 'pixi-visual-test/sampling/PixiSamplerPlaywright'
```

__Instantiating:__ 
```ts
/** @param {playwright.Page} page: Playwright browser page where PixiJS app is running */
const sampler = new PixiSamplerPlaywright(page, 'test/snapshots')
```

__Injecting:__ 
```ts
await sampler.startExposing();
```

__Sampling:__ 
```ts
await sampler.takeSnapshot('<name_of_snapshot>');
```

### 2. Running visual tests

Run `python3 ./pixi-visual-test test/snapshots/<name_of_snapshot>`

## Examples

See [`test/`](test/) directory for a bare minimum example test script made for our toy example PixiJS game.

To run the example, enter the command `npm run test` from the root directory of this repository.
