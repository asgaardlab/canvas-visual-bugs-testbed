import { PixiParser } from "../pixi-sampler/src/PixiParser";

function main(){
    const args = process.argv.slice(2);
    // TODO input validation!!
    if (args.length <= 0)
        throw new Error("inFilePath and outFilePath required arguments");
    const inFilePath = args[0];
    const outFilePath = args[1];

    PixiParser.makeTable(inFilePath, outFilePath);
}

main();