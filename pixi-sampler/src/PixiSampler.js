/**
 * Class for exposing the <canvas> objects representation (COR) of PixiJS-based applications
 */
class PixiSampler {
    constructor() {
        this.isExposing = false; // set when we start exposing the scene graph
        this.isFreezing = false; // set when we (un-)freeze the renderer
        this.cor = {}; // set in the renderer's render function
        this.frozenCopiedCor = {}; // set when we poll the scene graph
        this.canvas = null; // set in the renderer's render function
        //this.resolution = 1; // set in the renderer's render function
    }
    /**
     * Inject the game renderer method with our tracking code
     */
    expose() {
        // make sure PIXI actually exists in the global scope
        if (typeof PIXI === "undefined") {
            console.error("PIXI not found in global scope");
            return;
        }
        // use a distinct reference to PixiSampler object 
        // (to reduce confusion with PIXI.Renderer's this)
        const sampler = this;
        // make sure we haven't already injected the code
        if (sampler.isExposing === true) {
            console.warn("PixiSampler already injected");
            return;
        }
        // grab the renderer class from PIXI
        const Renderer = PIXI.Renderer;
        // grab original rendering function that PIXI uses
        const renderFunction = Renderer.prototype.render;
        // inject the tracking code into the rendering function
        Renderer.prototype.render = function (stage, ...args) {
            // prevent rendering when freezing animations
            if (sampler.isFreezing)
                return;
            // use a distinct refernce to the Renderer object
            // (to reduce confusion with PixiSampler's this)
            const renderer = this;
            // apply the original rendering function
            renderFunction.apply(renderer, [stage, ...args]);
            // copy reference to the COR
            sampler.cor = stage;
            // copy reference to the canvas
            sampler.canvas = renderer.view;
            // copy the resolution of the renderer
            //sampler.resolution = renderer.resolution;
        };
        // mark as injected
        sampler.isExposing = true;
    }
    /**
     * Poll the scene graph for a frozen copy of the current COR
     */
    corPoll() {
        return Object.freeze(Object.assign({}, this.cor));
    }
    /**
     * Freeze the renderer and the cor
     */
    freeze() {
        this.isFreezing = true;
        this.frozenCopiedCor = this.corPoll();
    }
    /**
     * Unfreeze the renderer
     */
    unfreeze() {
        this.isFreezing = false;
        this.frozenCopiedCor = {};
    }
    /**
     * Serialize and return the frozen copied COR
     */
    serialize() {
        return Flatted.stringify(this.frozenCopiedCor)
    }
    /**
     * Return a reference to the canvas
     */
    getCanvas() {
        return this.canvas;
    }
    /**
     * Check if the renderer is frozen
     */
    checkFrozen() {
        return this.isFreezing;
    }
    /**
     * Check if the renderer is exposed
     */
    checkExposed() {
        return this.isExposing;
    }
}
