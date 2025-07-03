export default class CanvasControls {
  public readonly container: HTMLDivElement;

  public readonly playPauseButton: HTMLButtonElement;

  public readonly fullscreenButton: HTMLButtonElement;

  public readonly progressSlider: HTMLInputElement;

  public readonly timeDisplay: HTMLSpanElement;

  private isPlaying = true;

  private canvasElement: HTMLCanvasElement;

  private wrapperDiv: HTMLDivElement | null = null;

  private fullscreenChangeHandler: () => void;

  private controlsPlaceholder: HTMLElement;

  constructor(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    controlsPlaceholder: HTMLElement,
  ) {
    this.container = document.createElement('div');

    this.canvasElement = canvasElement;

    this.controlsPlaceholder = controlsPlaceholder;
    // Play/Pause
    this.playPauseButton = document.createElement('button');
    this.playPauseButton.style.width = '100px';
    this.playPauseButton.textContent = 'Pause';
    this.playPauseButton.onclick = () => {
      this.isPlaying = !this.isPlaying;
      this.playPauseButton.textContent = this.isPlaying ? 'Pause' : 'Play';
      const vE = videoElement;
      if (this.isPlaying) {
        vE.play();
      } else {
        vE.pause();
      }
    };

    // Fullscreen
    this.fullscreenButton = document.createElement('button');
    this.fullscreenButton.textContent = 'Fullscreen';
    this.fullscreenButton.onclick = () => {
      this.canvasElement.requestFullscreen?.();
    };

    // --- Fullscreen Change Handler ---
    this.fullscreenChangeHandler = () => {
      const isFullscreen = document.fullscreenElement === this.canvasElement;

      if (isFullscreen) {
        // Apply styles to controlsPlaceholder
        this.controlsPlaceholder.style.position = 'fixed';
        this.controlsPlaceholder.style.bottom = '5px';
        this.controlsPlaceholder.style.left = '0';
        this.controlsPlaceholder.style.width = '100vw';
        this.controlsPlaceholder.style.zIndex = '10';

        // Create fullscreen black wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100vw';
        wrapper.style.height = '100vh';
        wrapper.style.backgroundColor = 'black';
        document.body.appendChild(wrapper);
        this.wrapperDiv = wrapper;
      } else {
        // Restore controlsPlaceholder styles
        this.controlsPlaceholder.style.position = '';
        this.controlsPlaceholder.style.bottom = '';
        this.controlsPlaceholder.style.left = '';
        this.controlsPlaceholder.style.width = '';
        this.controlsPlaceholder.style.zIndex = '1';

        // Remove wrapper
        if (this.wrapperDiv) {
          this.wrapperDiv.remove();
          this.wrapperDiv = null;
        }
      }
    };

    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);

    // --- Progress Slider ---
    this.progressSlider = document.createElement('input');
    this.progressSlider.type = 'range';
    this.progressSlider.min = '0';
    this.progressSlider.value = '0';
    this.progressSlider.step = '0.01';
    this.progressSlider.style.flex = '1';

    // --- Time Display ---
    this.timeDisplay = document.createElement('span');
    this.timeDisplay.textContent = '0:00 / 0:00';
    this.timeDisplay.style.fontFamily = 'monospace';
    this.timeDisplay.style.whiteSpace = 'nowrap';

    // --- Event Listeners for Progress/Time ---
    this.progressSlider.addEventListener('input', () => {
      const newTime = parseFloat(this.progressSlider.value);
      const vE = videoElement;
      vE.currentTime = newTime;
    });

    videoElement.addEventListener('timeupdate', () => {
      this.progressSlider.value = videoElement.currentTime.toString();
      this.updateTimeDisplay(videoElement);
    });

    videoElement.addEventListener('loadedmetadata', () => {
      this.progressSlider.max = videoElement.duration.toString();
      this.updateTimeDisplay(videoElement);
    });

    // --- Append to container ---
    this.container.appendChild(this.playPauseButton);
    this.container.appendChild(this.progressSlider);
    this.container.appendChild(this.timeDisplay);
    this.container.appendChild(this.fullscreenButton);
  }

  private static formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  private updateTimeDisplay(videoElement: HTMLVideoElement): void {
    const current = CanvasControls.formatTime(videoElement.currentTime);
    const total = CanvasControls.formatTime(videoElement.duration || 0);
    this.timeDisplay.textContent = `${current} / ${total}`;
  }

  public fitToCanvasSize(): void {
    this.container.style.width = this.canvasElement.style.width;
  }

  public destroy(): void {
    // Stop video interaction
    this.isPlaying = false;

    // Remove wrapper if still present
    if (this.wrapperDiv) {
      this.wrapperDiv.remove();
      this.wrapperDiv = null;
    }

    // Remove fullscreen listener
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);

    // Remove container and clear content
    this.container.innerHTML = '';
    this.container.remove();
  }
}
