import { EventEmitter } from 'events'

export interface VoiceAgentConfig {
  speechToText: 'whisper' | 'deepgram' | 'assemblyai'
  textToSpeech: 'elevenlabs' | 'azure' | 'google'
  language: string
  voiceId?: string
}

export class CustomVoiceAgent extends EventEmitter {
  private config: VoiceAgentConfig
  private conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }> = []

  constructor(config: VoiceAgentConfig) {
    super()
    this.config = config
  }

  async processAudio(audioBuffer: Buffer): Promise<{
    text: string
    confidence: number
  }> {
    // Speech-to-Text processing
    switch (this.config.speechToText) {
      case 'whisper':
        return this.processWithWhisper(audioBuffer)
      case 'deepgram':
        return this.processWithDeepgram(audioBuffer)
      case 'assemblyai':
        return this.processWithAssemblyAI(audioBuffer)
      default:
        throw new Error('Unsupported speech-to-text service')
    }
  }

  async generateResponse(text: string): Promise<string> {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    })

    // Process with AI (using your existing OpenAI integration)
    const response = await this.processWithAI(text)

    // Add AI response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    })

    return response
  }

  async synthesizeSpeech(text: string): Promise<Buffer> {
    // Text-to-Speech processing
    switch (this.config.textToSpeech) {
      case 'elevenlabs':
        return this.synthesizeWithElevenLabs(text)
      case 'azure':
        return this.synthesizeWithAzure(text)
      case 'google':
        return this.synthesizeWithGoogle(text)
      default:
        throw new Error('Unsupported text-to-speech service')
    }
  }

  private async processWithWhisper(audioBuffer: Buffer) {
    // OpenAI Whisper API implementation
    try {
      const OpenAI = await import('openai')
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const transcription = await openai.audio.transcriptions.create({
        file: audioBuffer,
        model: "whisper-1",
      })

      return {
        text: transcription.text,
        confidence: 0.9 // Whisper doesn't return confidence scores
      }
    } catch (error) {
      console.error('Whisper processing failed:', error)
      throw new Error('Speech-to-text processing failed')
    }
  }

  private async processWithDeepgram(audioBuffer: Buffer) {
    // Deepgram API implementation
    try {
      const { Deepgram } = await import('@deepgram/sdk')
      const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY)

      const response = await deepgram.transcription.preRecorded(
        { buffer: audioBuffer, mimetype: 'audio/wav' },
        {
          smart_format: true,
          model: 'nova-2',
          language: this.config.language,
        }
      )

      return {
        text: response.results?.channels[0]?.alternatives[0]?.transcript || '',
        confidence: response.results?.channels[0]?.alternatives[0]?.confidence || 0
      }
    } catch (error) {
      console.error('Deepgram processing failed:', error)
      throw new Error('Speech-to-text processing failed')
    }
  }

  private async processWithAssemblyAI(audioBuffer: Buffer) {
    // AssemblyAI API implementation
    try {
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'Authorization': process.env.ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioBuffer.toString('base64'),
          language_code: this.config.language,
        }),
      })

      const result = await response.json()
      return {
        text: result.text || '',
        confidence: result.confidence || 0
      }
    } catch (error) {
      console.error('AssemblyAI processing failed:', error)
      throw new Error('Speech-to-text processing failed')
    }
  }

  private async processWithAI(text: string): Promise<string> {
    // Use your existing OpenAI integration
    try {
      const OpenAI = await import('openai')
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Femi, an AI assistant for Femi Leasing. Keep responses concise and helpful.`
          },
          ...this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 150,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || "I apologize, I didn't understand that."
    } catch (error) {
      console.error('AI processing failed:', error)
      return "I apologize, I'm experiencing technical difficulties."
    }
  }

  private async synthesizeWithElevenLabs(text: string): Promise<Buffer> {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId || '21m00Tcm4TlvDq8ikWAM'}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      })

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error)
      throw new Error('Text-to-speech synthesis failed')
    }
  }

  private async synthesizeWithAzure(text: string): Promise<Buffer> {
    // Azure Cognitive Services TTS implementation
    try {
      const response = await fetch(`https://eastus.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: `<speak version='1.0' xml:lang='en-US'>
          <voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>
            ${text}
          </voice>
        </speak>`,
      })

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error('Azure synthesis failed:', error)
      throw new Error('Text-to-speech synthesis failed')
    }
  }

  private async synthesizeWithGoogle(text: string): Promise<Buffer> {
    // Google Cloud Text-to-Speech implementation
    try {
      const { TextToSpeechClient } = await import('@google-cloud/text-to-speech')
      const client = new TextToSpeechClient()

      const request = {
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      }

      const [response] = await client.synthesizeSpeech(request)
      return Buffer.from(response.audioContent, 'base64')
    } catch (error) {
      console.error('Google synthesis failed:', error)
      throw new Error('Text-to-speech synthesis failed')
    }
  }

  getConversationHistory() {
    return this.conversationHistory
  }

  clearHistory() {
    this.conversationHistory = []
  }
} 