// src/lib/transcriptionService.ts

export class TranscriptionService {
  private worker: Worker | null = null;
  private onResult: ((text: string) => void) | null = null;
  private onProgress: ((progress: any) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    this.worker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.addEventListener('message', (event) => {
      const { type, data } = event.data;
      if (type === 'result') {
        if (this.onResult && data && data.text) {
          this.onResult(data.text);
        }
      } else if (type === 'progress') {
        if (this.onProgress) {
          this.onProgress(data);
        }
      } else if (type === 'error') {
        if (this.onError) {
          this.onError(data);
        }
      } else if (type === 'ready') {
        console.log('Model loaded');
      }
    });
  }

  loadModel(onProgress?: (p: any) => void) {
    this.onProgress = onProgress || null;
    this.worker?.postMessage({ type: 'LOAD' });
  }

  transcribe(audioData: Float32Array, language: string, onResult: (text: string) => void, onError?: (err: string) => void) {
    this.onResult = onResult;
    this.onError = onError || null;
    this.worker?.postMessage({ type: 'TRANSCRIBE', audio: audioData, language });
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
  }
}

export const transcriptionService = new TranscriptionService();
