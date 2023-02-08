#!/bin/bash

cd sprite_similarity 
pip install requirements.txt

cd ../parse_pixi
npm install
tsc
