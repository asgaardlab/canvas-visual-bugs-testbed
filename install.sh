#!/bin/bash

cd sprite_similarity 
pip install requirements.txt

cd ../pixi-sampler
npm install -D
npm run build
