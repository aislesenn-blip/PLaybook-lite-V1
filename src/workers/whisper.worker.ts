import { pipeline, env, type PipelineType } from '@xenova/transformers';

// Skip local model check since we are running in browser
env.allowLocalModels = false;

// Singleton for the pipeline
class AutomaticSpeechRecognitionPipeline {
  static task: PipelineType = 'automatic-speech-recognition';
  static model = 'Xenova/whisper-tiny';
  static instance: any = null;

  static async getInstance(progress_callback: Function | undefined = undefined) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event: MessageEvent) => {
  const message = event.data;

  // LOAD MODEL
  if (message.type === 'LOAD') {
    try {
      await AutomaticSpeechRecognitionPipeline.getInstance((x: any) => {
        // We can send progress updates back to main thread
        self.postMessage({ type: 'progress', data: x });
      });
      self.postMessage({ type: 'ready' });
    } catch (err: any) {
      self.postMessage({ type: 'error', data: err.message });
    }
    return;
  }

  // TRANSCRIBE AUDIO
  if (message.type === 'TRANSCRIBE') {
    const audio = message.audio; // float32 array or similar format expected by pipeline

    // Check if we got audio data
    if (!audio) {
      self.postMessage({ type: 'error', data: 'No audio data provided' });
      return;
    }

    try {
      const transcriber = await AutomaticSpeechRecognitionPipeline.getInstance();

      // Run transcription
      const output = await transcriber(audio, {
        language: 'english', // Can be dynamic if we pass language code
        task: 'transcribe',
      });

      self.postMessage({ type: 'result', data: output });
    } catch (err: any) {
      self.postMessage({ type: 'error', data: err.message });
    }
  }
});
