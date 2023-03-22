import Flatted from 'flatted';
import { readFileAsync } from 'fs-extra-promise';
import { createArrayCsvWriter } from 'csv-writer';
// import { Sprite } from '@pixi/sprite';

export class PixiParser {
    private readonly basePath:string = __dirname;

    constructor () {
    }

    public static async makeTable(inFilePath: string, outFilePath: string) {
        // blocking read
        const corString = await readFileAsync(inFilePath, 'utf8');
        const corJson = Flatted.parse(corString);
        const records = this.traverseCor(corJson);
        this.writeCsv(outFilePath, records);
    }

    private static traverseCor(root: Record<string, unknown>): Array<Array<string|number>> {
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
                const entry = this.extractObject(node);
                records.push(entry);
            } else if (typeof node?.text === "string" || typeof node?._text === "string") {
                // extract the data we want for visual testing
                const entry = this.extractTextbox(node);
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

    private static extractObject(node: Record<string, unknown>): Array<string|number> {
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
            node.vertexData["0"], node.vertexData["1"], node.vertexData["2"], node.vertexData["3"], 
            // @ts-ignore
            node.vertexData["4"], node.vertexData["5"], node.vertexData["6"], node.vertexData["7"],
        ];
        // // @ts-ignore: Dynamic property checking
        // const url = node._texture.baseTexture.resource.url;
        // // @ts-ignore: Dynamic property checking
        // const x = node.x;
        // // @ts-ignore: Dynamic property checking
        // const y = node.y;
        // // @ts-ignore: Dynamic property checking
        // const width = node.width;
        // // @ts-ignore: Dynamic property checking
        // const height = node.height;
        // // @ts-ignore: Dynamic property checking
        // const rotation = node.rotation;
        // // @ts-ignore: Dynamic property checking
        // const anchorX = node.anchor.x;
        // // @ts-ignore: Dynamic property checking
        // const anchorY = node.anchor.y;
        // // @ts-ignore: Dynamic property checking
        // const scaleX = node.scale.x;
        // // @ts-ignore: Dynamic property checking
        // const scaleY = node.scale.y;
        // // @ts-ignore: Dynamic property checking
        // const alpha = node.alpha;
        // // @ts-ignore: Dynamic property checking
        // const visible = node.visible;
        // return [url, x, y, width, height, rotation, anchorX, anchorY, scaleX, scaleY, alpha, visible];
    }

    private static extractTextbox(node: Record<string, unknown>): Array<string|number> {
        // @ts-ignore
        // console.log(node.text)
        // console.log(node._text)
        // console.log(node._bounds)
        // console.log(node.vertexData)
        // NOTE using x, y, width, height differently than with extractObject - but whatever for now
        // TODO fix this - maybe write 2 CSV - 1 with objects, 1 with textboxes
        return [
            "textBox",
            // no resource url or frame for text... just font
            null,
            null,
            null,
            null,
            null,
            // @ts-ignore
            node.visible,
            // @ts-ignore
            node.transform._rotation,
            // @ts-ignore
            node.vertexData["0"], node.vertexData["1"], node.vertexData["2"], node.vertexData["3"],
            // @ts-ignore
            node.vertexData["4"], node.vertexData["5"], node.vertexData["6"], node.vertexData["7"],
        ];
        // // @ts-ignore: Dynamic property checking
        // const text = node.text || node._text;
    }
    
    private static writeCsv(outFilePath: string, records: Array<Array<string|number>>) {
        const csvWriter = createArrayCsvWriter({
            path: outFilePath,
            header: [
                "type", "url", "x", "y", "width", "height", "visible", "rotation",
                "vx0", "vy0", "vx1", "vy1", "vx2", "vy2", "vx3", "vy3"
            ]
        });
        csvWriter.writeRecords(records).then(() => {
            console.log(`Wrote ${records.length} records to ${outFilePath}`);
        });
    }
}
