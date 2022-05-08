## Instructions: injecting the synthetic visual bugs into the \<canvas\> testbed

### State bugs

- S1 is injected by setting `STATE = true` on line 5 of `core.js`. 
- S2, S3, S4, S5, S6 are injected by replacing the original asset with the buggy asset in the game assets directory.

### Appearance bugs

- A1, A2, A3, A4, A5, A6 are injected by replacing the original asset with the buggy asset in the game assets directory.

### Layout bugs

- L1, L2, L3, L4, and L6 are injected by replacing the original asset with the buggy asset in the game assets directory.
- L5 is injected by using both of the buggy assets in `./bugs/layout/_both_L5/` to replace both of the original assets in the game assets directory. 

### Rendering bugs

- R1 and R2 are both injected by placing `./bugs/rendering/_shared_R1_R2/viking_sheet.png` into the game assets directory and making a couple of changes in the source code. At line 9 of `core.js`, set `RENDERING[0] = true` for R1, or set `RENDERING[1] = true` for R2. Also, in `main.js`, replace `.add('sheet', 'assets/viking_sheet_small.png')` with `.add('sheet', 'assets/viking_sheet_small.png')` to complete the injection of bugs R1 or R2.
- R3, R4, R5, R6 are injected by replacing the original asset with the buggy asset in the game assets directory.
