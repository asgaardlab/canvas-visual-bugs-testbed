import { makeTable } from "./parsePixi";

(() => {
    const args = process.argv.slice(2);
    // TODO input validation!!
    if (args.length <= 0)
        console.log("inFilePath and outFilePath required arguments");
    const inFilePath = args[0];
    const outFilePath = args[1];
    makeTable(inFilePath, outFilePath);
})();