import conv2d_tex from './shaders/conv2d_tex.wgsl';
import conv2d_1_tex from './shaders/conv2d_1_tex.wgsl';
import conv2d_2_tex from './shaders/conv2d_2_tex.wgsl';
import conv2d_3_tex from './shaders/conv2d_3_tex.wgsl';
import conv2d_4_tex from './shaders/conv2d_4_tex.wgsl';
import conv2d_5_tex from './shaders/conv2d_5_tex.wgsl';
import conv2d_6_tex from './shaders/conv2d_6_tex.wgsl';
import conv2d_7_tex from './shaders/conv2d_7_tex.wgsl';
import conv2d_7_1_tex from './shaders/conv2d_7_1_tex.wgsl';
import conv2d_7_2_tex from './shaders/conv2d_7_2_tex.wgsl';

import { NeuralPipeline, NeuralPipelineDescriptor } from '../../interfaces';
import { Conv2d, DepthToSpace, Overlay } from '../../helpers';

export class CNN implements NeuralPipeline {
/*
 * [0] conv2d_tex (inputs: [MAIN])
 * [1] conv2d_1_tex (inputs: [conv2d])
 * [2] conv2d_2_tex (inputs: [conv2d_1])
 * [3] conv2d_3_tex (inputs: [conv2d_2])
 * [4] conv2d_4_tex (inputs: [conv2d_3])
 * [5] conv2d_5_tex (inputs: [conv2d_4])
 * [6] conv2d_6_tex (inputs: [conv2d_5])
 * [7 - 9] conv2d_7_tex - conv2d_7_2_tex (inputs: [conv2d, conv2d_1, conv2d_2, conv2d_3, conv2d_4, conv2d_5, conv2d_6])
 */

  pipelines: NeuralPipeline[] = [];

  /**
   * Creates an instance of CNN.
   *
   * @param {Object} options - The options for the CNN pipeline.
   * @param {GPUDevice} options.device - The GPU device to use for
   * creating textures and shader modules.
   * @param {GPUTexture} options.inputTexture - The input texture for the pipeline.
   */
  constructor({
    device,
    inputTexture,
  }: NeuralPipelineDescriptor) {
    const shaders: string[] = [
      conv2d_tex,
      conv2d_1_tex,
      conv2d_2_tex,
      conv2d_3_tex,
      conv2d_4_tex,
      conv2d_5_tex,
      conv2d_6_tex,
      conv2d_7_tex,
      conv2d_7_1_tex,
      conv2d_7_2_tex
    ];

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: [inputTexture],
      shaderWGSL: conv2d_tex,
      name: 'conv2d_tex',
    }));
    const outputTextures_1: GPUTexture[] = [];
    outputTextures_1.push(this.pipelines[0].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_1,
      shaderWGSL: conv2d_1_tex,
      name: 'conv2d_1_tex',
    }));
    const outputTextures_2: GPUTexture[] = [];
    outputTextures_2.push(this.pipelines[1].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_2,
      shaderWGSL: conv2d_2_tex,
      name: 'conv2d_2_tex',
    }));
    const outputTextures_3: GPUTexture[] = [];
    outputTextures_3.push(this.pipelines[2].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_3,
      shaderWGSL: conv2d_3_tex,
      name: 'conv2d_3_tex',
    }));
    const outputTextures_4: GPUTexture[] = [];
    outputTextures_4.push(this.pipelines[3].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_4,
      shaderWGSL: conv2d_4_tex,
      name: 'conv2d_4_tex',
    }));
    const outputTextures_5: GPUTexture[] = [];
    outputTextures_5.push(this.pipelines[4].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_5,
      shaderWGSL: conv2d_5_tex,
      name: 'conv2d_5_tex',
    }));
    const outputTextures_6: GPUTexture[] = [];
    outputTextures_6.push(this.pipelines[5].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_6,
      shaderWGSL: conv2d_6_tex,
      name: 'conv2d_6_tex',
    }));
    const outputTextures_7: GPUTexture[] = [];
    outputTextures_7.push(this.pipelines[0].getOutputTexture());
    outputTextures_7.push(this.pipelines[1].getOutputTexture());
    outputTextures_7.push(this.pipelines[2].getOutputTexture());
    outputTextures_7.push(this.pipelines[3].getOutputTexture());
    outputTextures_7.push(this.pipelines[4].getOutputTexture());
    outputTextures_7.push(this.pipelines[5].getOutputTexture());
    outputTextures_7.push(this.pipelines[6].getOutputTexture());

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_7,
      shaderWGSL: conv2d_7_tex,
      name: 'conv2d_7_tex',
    }));

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_7,
      shaderWGSL: conv2d_7_1_tex,
      name: 'conv2d_7_1_tex',
    }));

    this.pipelines.push(new Conv2d({
      device,
      inputTextures: outputTextures_7,
      shaderWGSL: conv2d_7_2_tex,
      name: 'conv2d_7_2_tex',
    }));

    const finalOutputTextures: GPUTexture[] = [];
    finalOutputTextures.push(this.pipelines[7].getOutputTexture());
    finalOutputTextures.push(this.pipelines[8].getOutputTexture());
    finalOutputTextures.push(this.pipelines[9].getOutputTexture());

    this.pipelines.push(new DepthToSpace({
      device,
      inputTextures: finalOutputTextures,
      name: 'DepthToSpace',
    }));

    this.pipelines.push(new Overlay({
      device,
      inputTextures: [inputTexture, this.pipelines[this.pipelines.length - 1].getOutputTexture()],
      outputTextureSize: [2 * inputTexture.width, 2 * inputTexture.height],
    }));
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateParam(param: string, value: any): void {
    throw new Error(`${self.constructor.name} has no param`);
  }

  getOutputTexture(): GPUTexture {
    return this.pipelines[this.pipelines.length - 1].getOutputTexture();
  }

  pass(encoder: GPUCommandEncoder) {
    for (let i = 0; i < this.pipelines.length; i += 1) {
      this.pipelines[i].pass(encoder);
    }
  }
}
