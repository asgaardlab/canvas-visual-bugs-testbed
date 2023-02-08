import Flatted from 'flatted';
import { readFileAsync } from 'fs-extra-promise';
import { createArrayCsvWriter } from 'csv-writer';
// import { Sprite } from '@pixi/sprite';

export async function makeTable(inFilePath: string, outFilePath: string) {
    // blocking read
    const corString = await readFileAsync(inFilePath, 'utf8');
    const corJson = Flatted.parse(corString);
    const records = traverseCor(corJson);
    writeCsv(outFilePath, records);
}

// BFS: https://fireship.io/courses/javascript/interview-graphs/
function traverseCor(root: Record<string, unknown>): Array<Array<string|number>> {
    // import the types from PIXI 
    // check if the key is defined by PIXI
    // if so, let's keep it?
    // for now just hardcoding the keys/paths we want
    // kind of like dynamic type checking for JS...
    const records: Array<Array<string|number>> = [];
    const seen = new Set();
    const queue = [root];
    while (queue.length > 0) {
        const node = queue.shift();
        // @ts-ignore: Dynamic property checking
        if (typeof node?._texture?.baseTexture?.resource?.url !== "undefined") {
            // extract the data we want for visual testing
            const entry = extractObject(node);
            records.push(entry);
        } else if (typeof node?.text === "string" || typeof node?._text === "string") {
            // extract the data we want for visual testing
            const entry = extractTextbox(node);
            records.push(entry);
        }
        // @ts-ignore: Dynamic property checking
        if (typeof node.children !== "undefined") {
            // breadth-first search
            // @ts-ignore: Property checked
            node.children.map((c: Record<string, unknown>) => {
                if (!seen.has(c)) {
                    seen.add(c);
                    queue.push(c);
                }
            });
        }
    }
    return records;
}

function extractObject(node: Record<string, unknown>): Array<string|number> {
    return [
        "object",
        // @ts-ignore
        node._texture.baseTexture.resource.url,
        // @ts-ignore
        node._texture._frame.x,
        // @ts-ignore
        node._texture._frame.y,
        // @ts-ignore
        node._texture._frame.width,
        // @ts-ignore
        node._texture._frame.height,
        // @ts-ignore
        node.visible,
        // @ts-ignore
        node.transform._rotation,
        // @ts-ignore
        node.vertexData["0"],
        // @ts-ignore
        node.vertexData["1"],
        // @ts-ignore
        node.vertexData["2"],
        // @ts-ignore
        node.vertexData["3"],
        // @ts-ignore
        node.vertexData["4"],
        // @ts-ignore
        node.vertexData["5"],
        // @ts-ignore
        node.vertexData["6"],
        // @ts-ignore
        node.vertexData["7"],
    ];
}

function extractTextbox(node: Record<string, unknown>): Array<string|number> {
    // @ts-ignore
    // console.log(node.text)
    // console.log(node._text)
    // console.log(node._bounds)
    // console.log(node.vertexData)
    // NOTE using x, y, width, height differently than with extractObject - but whatever for now
    // TODO fix this - maybe write 2 CSV - 1 with objects, 1 with textboxes
    return [
        "textBox",
        null,
        // @ts-ignore
        node.transform.worldTransform.tx,
        // @ts-ignore
        node.transform.worldTransform.ty,
        null,
        // @ts-ignore
        node.fontSize * 4 / 3, // points to pixels
        // @ts-ignore
        node.visible,
        // @ts-ignore
        node.transform._rotation,
        // null,
        // null,
        // null,
        // null,
        // null,
        // null,
        // null,
        // null,
        // @ts-ignore
        node.vertexData["0"],
        // @ts-ignore
        node.vertexData["1"],
        // @ts-ignore
        node.vertexData["2"],
        // @ts-ignore
        node.vertexData["3"],
        // @ts-ignore
        node.vertexData["4"],
        // @ts-ignore
        node.vertexData["5"],
        // @ts-ignore
        node.vertexData["6"],
        // @ts-ignore
        node.vertexData["7"],
    ];
}

function writeCsv(path: string, records: Array<Array<string|number>>) {
    const header = [
        "type", "url", "x", "y", "width", "height", "visible", "rotation",
        "vx0", "vy0", "vx1", "vy1", "vx2", "vy2", "vx3", "vy3"
    ];
    const csvWriter = createArrayCsvWriter({
        header: header,
        path: path
    });
    // non-blocking write
    csvWriter.writeRecords(records).then(() => {
        console.log(`Wrote ${records.length} records to ${path}`);
    });
}