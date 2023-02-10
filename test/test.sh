#!/bin/bash

# Build and run the test spec
npm run build
npm start

# Run the python script for visual tests
cd ..
python3 sprite_similarity test/snapshots/test_0 -o test -u https://asgaardlab.github.io/canvas-visual-bugs-testbed/game/
