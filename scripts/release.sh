#!/bin/bash

cd ..

mkdir release
mkdir release/pixi-visual-test

rsync -av --progress ./sprite_similarity ./release/pixi-visual-test/ \
    --exclude *.pyc \
    --exclude __pycache__

rsync -av -vvv --progress ./pixi-sampler ./release/pixi-visual-test/ \
    --exclude node_modules \
    --exclude .git \
    --exclude *.js \
    --exclude *.package-lock.json

rsync -av --progress ./pixi-sampler/src/PixiSampler.js ./release/pixi-visual-test/pixi-sampler/src/

rsync -av --progress LICENSE ./release/pixi-visual-test/
rsync -av --progress README.md ./release/pixi-visual-test/ 

# create release zip file
cd release
zip -r pixi-visual-test.zip pixi-visual-test
