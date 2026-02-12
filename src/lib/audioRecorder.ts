// src/lib/audioRecorder.ts

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private input: MediaStreamAudioSourceNode | null = null;
  private audioChunks: Float32Array[] = [];
  private isRecording = false;

  async start(): Promise<void> {
    if (this.isRecording) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Request 16kHz sample rate for Whisper compatibility
      // Note: Browsers might ignore this and use system rate, then we'd need resampling.
      // But many modern browsers handle the resampling in the AudioContext if specified.
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.input = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.audioChunks = [];

      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // We must clone the data
        this.audioChunks.push(new Float32Array(inputData));
      };

      this.input.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isRecording = true;
    } catch (err) {
      console.error('Error starting recording:', err);
      throw err;
    }
  }

  async stop(): Promise<Float32Array> {
    if (!this.isRecording) return new Float32Array(0);

    this.isRecording = false;

    // Disconnect and close everything
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.input) {
      this.input.disconnect();
      this.input = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Merge chunks
    const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.audioChunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }
}

export const audioRecorder = new AudioRecorder();
