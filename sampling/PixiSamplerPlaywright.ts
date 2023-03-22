import fs from 'fs-extra-promise';
import { Page, JSHandle } from '@playwright/test'

/**
 * Playwright API for PixiSamplerClient
 */
export class PixiSamplerPlaywright {
    private readonly instanceName:string = '__PIXI_SAMPLER__';
    private readonly basePath:string = __dirname;
    private snapshotsPath:string;
    private page:Page;

    constructor (page:Page, path:string) {
        this.page = page;
        this.snapshotsPath = path;
    }

    public async startExposing() {
        await this.injectScript('../node_modules/flatted/min.js');
        await this.injectScript('PixiSamplerClient.js');
        await this.exposePixi();
    }

    private async injectScript(relativePath: string) {
        const scriptPath = `${this.basePath}/${relativePath}`;
        await this.page.addScriptTag({ 'path': scriptPath });
    }
    
    private async exposePixi() {
        const code = [
            `const ${this.instanceName} = new PixiSamplerClient();`,
            `window.${this.instanceName} = ${this.instanceName};`,
            `${this.instanceName}.expose();`
        ].join('\n');
        await this.page.evaluate(code);
    }

    public async takeSnapshot(name:string) {
        // grab reference to the canvas
        const canvas = await this.getCanvasHandle();
        // stop animations
        await this.freezeRenderer();
        // take screenshot
        // @ts-ignore
        await canvas.screenshot({ path: `${this.snapshotsPath}/${name}.png` });
        // grab reference to scene graph
        const sceneGraphHandle = await this.getSceneGraphHandle();
        // read the scene graph
        const sceneGraph = await sceneGraphHandle.jsonValue();
        // re-start animations
        await this.unfreezeRenderer();
        // save the scene graph
        // @ts-ignore
        await this.saveSceneGraph(sceneGraph, `${this.snapshotsPath}/${name}.json`);
    }

    private async freezeRenderer() {
        const code = `${this.instanceName}.freeze();`
        await this.page.evaluate(code);
    }

    private async unfreezeRenderer() {
        const code = `${this.instanceName}.unfreeze();`
        await this.page.evaluate(code);
    }

    private async getCanvasHandle(): Promise<JSHandle> {
        const code = `${this.instanceName}.getCanvas();`
        return await this.page.evaluateHandle(code);
    }

    private async getSceneGraphHandle(): Promise<JSHandle> {
        // serialize the Scene Graph
        const code = `${this.instanceName}.serialize();`
        return await this.page.evaluateHandle(code);
    }

    private async saveSceneGraph(corString:string, path:string) {
        await fs.writeFileAsync(path, corString);
    }
}