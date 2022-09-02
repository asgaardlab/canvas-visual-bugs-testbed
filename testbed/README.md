## &lt;canvas&gt; visual bugs testbed

- This is the buggy version of our test &lt;canvas&gt; game.

- All of our visual bugs are available in `./bugs/`, and are not injected by default.

- For instructions on how to inject the bugs, see `./bugs/instructions.md`.

### To run the game, run a local HTTP fileserver at this directory.

For example, with Python,

`python3 -m http.server --directory "./<path_to_this_folder>/" 8000`

would start a fileserver at this folder, which could be accessed on your machine or local network at `localhost:8000`

For more information, [see this link](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server).

### To run the test, run the test.js script

1) First, install dependencies using `npm i`. 
2) Ensure you have Python3 installed as well, as this is used to launch a simple HTTP server.
3) Run the test script by using `npm run test`.
This will launch the game (using `python3 -m http.server` on port `8000`), then will run the test case 10 times in series.
