# Visual testing for PIXI applications


## Prerequisites

### Python (v3.4+)
- Download and install from https://www.python.org/downloads/
- Run the command `python3 -m pip install ---upgrade pip` to ensure Python's package manager is installed

### Node.js
- Install like so
- ensure `npm` also installed

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

### Collecting snapshots
- instrument your test code to capture snapshots, which are pairs of (screenshot, scene graph)

e.g.
```js
import { PixiSamplerAPI } from 'MyApplication/test/canvas-visual-bugs-testbed/pixi-sampler/src/PixiSamplerAPI'

sampler = new PixiSamplerAPI()

sampler.startExposing();

sampler.takeSnapshot('test_0');
```

### Running visual tests

Run `python3 sprite_similarity test/snapshots/<name_of_snapshot>`
