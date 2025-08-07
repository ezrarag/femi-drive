export interface ElevenLabsConfig {
  apiKey: string
  voiceId?: string
  modelId?: string
  stability?: number
  similarityBoost?: number
}

export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

export class ElevenLabsClient {
  private config: ElevenLabsConfig
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(config: ElevenLabsConfig) {
    this.config = config
  }

  async textToSpeech(text: string, voiceId?: string, settings?: VoiceSettings) {
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId || this.config.voiceId || '21m00Tcm4TlvDq8ikWAM'}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.config.apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: this.config.modelId || 'eleven_monolingual_v1',
            voice_settings: {
              stability: settings?.stability ?? this.config.stability ?? 0.5,
              similarity_boost: settings?.similarity_boost ?? this.config.similarityBoost ?? 0.5,
              style: settings?.style ?? 0.0,
              use_speaker_boost: settings?.use_speaker_boost ?? true,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      throw error
    }
  }

  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.config.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ElevenLabs get voices error:', error)
      throw error
    }
  }

  async createVoice(name: string, description: string, audioFiles: File[]) {
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      
      audioFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.config.apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ElevenLabs create voice error:', error)
      throw error
    }
  }

  async deleteVoice(voiceId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.config.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('ElevenLabs delete voice error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const elevenLabsClient = process.env.ELEVENLABS_API_KEY
  ? new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice (Rachel)
      modelId: 'eleven_monolingual_v1',
      stability: 0.5,
      similarityBoost: 0.5,
    })
  : null 