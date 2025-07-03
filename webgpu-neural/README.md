# webgpu-neural

This project is a combination of modified files from the [Anime4K-WebGPU](https://github.com/Anime4KWebBoost/Anime4K-WebGPU) repository.  
For more information, usage, demos, and documentation, please visit the [Anime4K-WebGPU page](https://github.com/Anime4KWebBoost/Anime4K-WebGPU).

## Introduction

Neural enhancement for WebGPU, featuring upscaling, denoising, and deblurring. Computing is done entirely on the client side using WebGPU compute shaders. Functionality of this implementation can be published as an NPM package and incorporated into your WebGPU pipeline.

Note: your browser must support WebGPU. See this [list](https://caniuse.com/webgpu) for compatibility.

## Usage

There are 2 ways to use this package:

### 1. Render Wrapper

This is for frontend devs who do not wish to tap into WebGPU too much.
You only need the `render` function which will setup all the rendering from a video element to a canvas element:

```typescript
import { CNNx2UL, GANUUL, render } from 'webgpu-neural';

await render({
  // your source video HTMLElement
  video,
  // your render destination canvas HTMLElement
  canvas,
  // your function to build custom pipeline
  // return all pipelines in order of execution
  // e.g. inputTexture(video) -> CNNx2UL -> GANUUL -> (canvas)
  pipelineBuilder: (device, inputTexture) => {
    const upscale = new CNNx2UL({
      device,
      inputTexture,
    });
    const restore = new GANUUL({
      device,
      inputTexture: upscale.getOutputTexture(),
    });
    return [upscale, restore];
  },
});
```

In the upper example, the input texture (vide) will go through a `CNNx2UL` for upscaling, and then a `GANUUL` for restore, before it is rendered to the canvas. You will build your custom pipeline in the `pipelineBuilder` function.

### 2. WebGPU Pipelines

If you already have a webGPU render pipeline setup and would like to use the enhancement module on an existing texture, this package contains classes that implements interface `NeuralPipeline`. 
To use these classes, first install `webgpu-neural` package, then insert proveded pipelines in 4 lines:

```typescript
// +++ import CNNx2UL, one of the CNN upscale pipeline +++
import { NeuralPipeline, CNNx2UL } from 'webgpu-neural';

// your original texture to be processed
const inputTexture: GPUTexture;

// +++ instantiate pipeline +++
const pipeline: NeuralPipeline = new CNNx2UL({
  device,
  inputTexture
});

// bind (upscaled) output texture wherever you want e.g. render pipeline
const renderBindGroup = device.createBindGroup({
  ...
  entries: [{
    binding: 0,
    // +++ use pipeline.getOutputTexture() instead of inputTexture +++
    resource: pipeline.getOutputTexture().createView(),
  }]
});

function frame() {
  const commandEncoder: GPUCommandEncoder;

  // +++ inject commands into the encoder +++
  pipeline.pass(commandEncoder);

  // begin other render pass...
}
```

To change an adjustable parameter (e.g. deblur strength) call `NeuralPipeline::updateParam(param: string, value: any)` and the value will be applied for the next render cycle:
```typescript
pipeline.updateParam('strength', 3.0);
```

The input texture must have usage `TEXTURE_BINDING`, and the output texture has `TEXTURE_BINDING | RENDER_ATTACHMENT | STORAGE_BINDING` to be used in render pipelines. You can also have multiple pipelines in tandem to achieve sophisticated effects.

### Supported Pipelines

This package currently support the following pipelines:

* Deblur
  * ✅ DoG
* Denoise
  * ✅ BilateralMean
* Restore
  * ✅ CNNM
  * ✅ CNNSoftM
  * ✅ CNNSoftVL
  * ✅ CNNVL
  * ✅ CNNUL
  * ✅ GANUUL
* Upscale
  * ✅ CNNx2M
  * ✅ CNNx2VL
  * ✅ DenoiseCNNx2VL
  * ✅ CNNx2UL
  * ✅ GANx3L
  * ✅ GANx4UUL
* Other Helpers
  * ✅ AutoDownscalePre
  * ✅ ClampHighlights

## Credits

* [Anime4K](https://github.com/bloc97/Anime4K)
* [UnityAnime4K](https://github.com/keijiro/UnityAnime4K)
* [WebGPU-Samples](https://github.com/webgpu/webgpu-samples)
* [Anime4K-WebGPU](https://github.com/Anime4KWebBoost/Anime4K-WebGPU)
