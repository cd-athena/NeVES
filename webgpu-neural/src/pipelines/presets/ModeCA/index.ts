import { ClampHighlights, Downscale } from '../../helpers';
import { NeuralPipeline, NeuralPresetPipelineDescriptor } from '../../interfaces';
import { CNNM } from '../../restore';
import { CNNx2M, CNNx2VL, DenoiseCNNx2VL } from '../../upscale';

export class ModeCA implements NeuralPipeline {
  pipelines: NeuralPipeline[];

  outputTexture: GPUTexture;

  /**
   * Constructs a new instance of the preset class.
   *
   * @param {NeuralPresetPipelineDescriptor} options - An object containing
   * the following properties:
   * @param {GPUDevice} options.device - The GPU device to use for the pipeline.
   * @param {GPUTexture} options.inputTexture - The input texture to process.
   * @param {Dimensions} options.nativeDimensions - The original dimensions of the input texture.
   * @param {Dimensions} options.targetDimensions - The target dimension for the output texture.
   */
  constructor({
    device,
    inputTexture,
    nativeDimensions,
    targetDimensions,
  }: NeuralPresetPipelineDescriptor) {
    let curWidth = nativeDimensions.width;
    let curHeight = nativeDimensions.height;
    this.pipelines = [];
    let currentTexture = inputTexture; // track most recent texture

    // Clamp Highlights
    const clampHighlights = new ClampHighlights({
      device,
      inputTexture: currentTexture,
    });
    this.pipelines.push(clampHighlights);
    currentTexture = clampHighlights.getOutputTexture();

    // Upscale 1
    if (targetDimensions.width > 1.2 * curWidth
        && targetDimensions.height > 1.2 * curHeight) {
      const upscale1 = new DenoiseCNNx2VL({
        device,
        inputTexture: currentTexture,
      });
      this.pipelines.push(upscale1);
      currentTexture = upscale1.getOutputTexture();
      curWidth *= 2;
      curHeight *= 2;
    }

    // Auto Downscale x2
    if (targetDimensions.width > 1.2 * nativeDimensions.width
        && targetDimensions.height > 1.2 * nativeDimensions.height
        && targetDimensions.width < 2.0 * nativeDimensions.width
        && targetDimensions.height < 2.0 * nativeDimensions.height) {
      const autoDownscalex2 = new Downscale({
        device,
        inputTexture: currentTexture,
        targetDimensions,
      });
      this.pipelines.push(autoDownscalex2);
      currentTexture = autoDownscalex2.getOutputTexture();
      curWidth = targetDimensions.width;
      curHeight = targetDimensions.height;
    }

    // Auto Downscale x4
    if (targetDimensions.width > 2.4 * nativeDimensions.width
        && targetDimensions.height > 2.4 * nativeDimensions.height
        && targetDimensions.width < 4.0 * nativeDimensions.width
        && targetDimensions.height < 4.0 * nativeDimensions.height) {
      const autoDownscalex4 = new Downscale({
        device,
        inputTexture: currentTexture,
        targetDimensions: {
          width: Math.ceil(targetDimensions.width / 2),
          height: Math.ceil(targetDimensions.height / 2),
        },
      });
      this.pipelines.push(autoDownscalex4);
      currentTexture = autoDownscalex4.getOutputTexture();
      curWidth = Math.ceil(targetDimensions.width / 2);
      curHeight = Math.ceil(targetDimensions.height / 2);
    }

    // restore
    const restore = new CNNM({
      device,
      inputTexture: currentTexture,
    });
    this.pipelines.push(restore);
    currentTexture = restore.getOutputTexture();

    // Upscale 2
    if (targetDimensions.width > 1.2 * curWidth
        && targetDimensions.height > 1.2 * curHeight) {
      const upscale2 = new CNNx2M({
        device,
        inputTexture: currentTexture,
      });
      this.pipelines.push(upscale2);
      currentTexture = upscale2.getOutputTexture();
      curWidth *= 2;
      curHeight *= 2;
    }

    this.outputTexture = currentTexture;
  }

  updateParam(param: string, value: any): void {
    throw new Error('Preset has no param');
  }

  pass(encoder: GPUCommandEncoder): void {
    for (let i = 0; i < this.pipelines.length; i += 1) {
      this.pipelines[i].pass(encoder);
    }
  }

  getOutputTexture(): GPUTexture {
    return this.outputTexture;
  }
}
