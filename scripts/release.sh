#!/bin/bash

rm -r release
mkdir release
mkdir release/pixi-visual-test

rsync -av ./analysis ./release/pixi-visual-test/ \
    --exclude *.pyc \
    --exclude __pycache__

rsync -av ./sampling ./release/pixi-visual-test/ \
    --exclude *.js \

rsync -av ./sampling/PixiSamplerClient.js ./release/pixi-visual-test/sampling/

rsync -av ./scripts/parse.ts ./release/pixi-visual-test/scripts/

rsync -av .gitignore ./release/pixi-visual-test/
rsync -av LICENSE ./release/pixi-visual-test/
rsync -av README.md ./release/pixi-visual-test/ 
rsync -av package.json ./release/pixi-visual-test/ 
rsync -av tsconfig.json ./release/pixi-visual-test/ 
rsync -av requirements.txt ./release/pixi-visual-test/ 
rsync -av __init__.py ./release/pixi-visual-test/ 
rsync -av __main__.py ./release/pixi-visual-test/ 

# create release zip file
cd release
zip -r pixi-visual-test.zip pixi-visual-test
