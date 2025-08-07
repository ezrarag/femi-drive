import { Deepgram } from '@deepgram/sdk'

export interface DeepgramConfig {
  apiKey: string
  model?: string
  language?: string
  smartFormat?: boolean
}

export class DeepgramClient {
  private deepgram: Deepgram
  private config: DeepgramConfig

  constructor(config: DeepgramConfig) {
    this.config = config
    this.deepgram = new Deepgram(config.apiKey)
  }

  async transcribeAudio(audioBuffer: Buffer, mimetype: string = 'audio/wav') {
    try {
      const response = await this.deepgram.transcription.preRecorded(
        { buffer: audioBuffer, mimetype },
        {
          smart_format: this.config.smartFormat ?? true,
          model: this.config.model ?? 'nova-2',
          language: this.config.language ?? 'en-US',
          punctuate: true,
          diarize: true,
          utterances: true,
          paragraphs: true,
        }
      )

      const result = response.results?.channels[0]?.alternatives[0]
      
      return {
        text: result?.transcript || '',
        confidence: result?.confidence || 0,
        words: result?.words || [],
        paragraphs: response.results?.channels[0]?.paragraphs || [],
        speakers: response.results?.channels[0]?.alternatives[0]?.words?.map(w => w.speaker) || []
      }
    } catch (error) {
      console.error('Deepgram transcription error:', error)
      throw error
    }
  }

  async transcribeStream(audioStream: ReadableStream) {
    try {
      const response = await this.deepgram.transcription.live({
        smart_format: this.config.smartFormat ?? true,
        model: this.config.model ?? 'nova-2',
        language: this.config.language ?? 'en-US',
        punctuate: true,
        diarize: true,
        interim_results: true,
      })

      return response
    } catch (error) {
      console.error('Deepgram stream transcription error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const deepgramClient = process.env.DEEPGRAM_API_KEY 
  ? new DeepgramClient({
      apiKey: process.env.DEEPGRAM_API_KEY,
      model: 'nova-2',
      language: 'en-US',
      smartFormat: true,
    })
  : null 