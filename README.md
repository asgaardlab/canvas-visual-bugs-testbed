## Automatically Detecting Visual Bugs in HTML5 &lt;canvas&gt; Games

This repository contains the test &lt;canvas&gt; game, collected data, and experiment analysis from our paper: `Automatically Detecting Visual Bugs in HTML5 <canvas> Games`, [accepted at ASE 2022](https://asgaard.ece.ualberta.ca/automatically-detecting-visual-bugs-in-html5-games-accepted-at-ase-2022/).

### The test &lt;canvas&gt; game
- The code for our testbed (i.e., the version of the game with injectable bugs) can be found in `./testbed/`
- The injectable visual bugs can be found in `./testbed/bugs/`
- The test case can be found in `./testbed/test/test.js` and run from the `./testbed/` directory using `npm run test` (after installing dependencies)
- The code for the non-buggy version of our test &lt;canvas&gt; game can be found in `./game/`

  
### Our collected data
- Our collected data, i.e., the screenshot, &lt;canvas&gt; object representation (COR) pairs, can be found in `./analysis/data.tar.gz` (using git LFS)
- Our collected data is also available on Zenodo at the following link: https://zenodo.org/record/6950640
  
  
### Experiments and analysis
- Our experiment analysis can be found in `./analysis/`
- Our experiment results can be found in `./analysis/results/`
- Our implementation of our visual testing approach is available in `./analysis/sprite_similarity/`
- The latest version of our data collection framework for PixiJS applications can be found here: https://github.com/finlaymacklon/pixi-sampler
