#!/bin/bash

tsc
npm start

cd ..
python3 sprite_similarity test/snapshots/test_0 -o test
