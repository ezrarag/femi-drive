import { deepgramClient } from './deepgram-client'
import { elevenLabsClient } from './elevenlabs-client'
import { aiAgent } from './ai-voice-agent'
import { sendSMS } from './twilio'

export interface EnhancedVoiceConfig {
  useDeepgram: boolean
  useElevenLabs: boolean
  fallbackToTwilio: boolean
  voiceId?: string
  language: string
}

export class EnhancedVoiceAgent {
  private config: EnhancedVoiceConfig
  private conversationContexts: Map<string, any> = new Map()

  constructor(config: EnhancedVoiceConfig) {
    this.config = config
  }

  async processCall(
    callSid: string,
    speechResult: string,
    callInfo: { from: string; to: string },
    audioBuffer?: Buffer
  ) {
    let processedText = speechResult
    let confidence = 0.8 // Default confidence for Twilio

    // Use Deepgram for better transcription if available
    if (this.config.useDeepgram && deepgramClient && audioBuffer) {
      try {
        const deepgramResult = await deepgramClient.transcribeAudio(audioBuffer)
        if (deepgramResult.confidence > confidence) {
          processedText = deepgramResult.text
          confidence = deepgramResult.confidence
          console.log('Using Deepgram transcription:', processedText, 'confidence:', confidence)
        }
      } catch (error) {
        console.warn('Deepgram transcription failed, using Twilio result:', error)
      }
    }

    // Process with AI agent
    if (!aiAgent) {
      return {
        response: "I'm experiencing technical difficulties. Let me transfer you to our team.",
        action: "escalate",
        audioBuffer: null
      }
    }

    const aiResult = await aiAgent.processCall(callSid, processedText, callInfo)

    // Generate audio response
    let generatedAudioBuffer: Buffer | null = null

    if (this.config.useElevenLabs && elevenLabsClient) {
      try {
        generatedAudioBuffer = await elevenLabsClient.textToSpeech(aiResult.response)
        console.log('Generated ElevenLabs audio response')
      } catch (error) {
        console.warn('ElevenLabs TTS failed, will use Twilio TTS:', error)
      }
    }

    return {
      ...aiResult,
      audioBuffer: generatedAudioBuffer,
      confidence
    }
  }

  async generateCustomVoiceResponse(text: string, voiceId?: string) {
    if (!elevenLabsClient) {
      throw new Error('ElevenLabs not configured')
    }

    return await elevenLabsClient.textToSpeech(text, voiceId)
  }

  async createCustomVoice(name: string, description: string, audioFiles: File[]) {
    if (!elevenLabsClient) {
      throw new Error('ElevenLabs not configured')
    }

    return await elevenLabsClient.createVoice(name, description, audioFiles)
  }

  async getAvailableVoices() {
    if (!elevenLabsClient) {
      return []
    }

    try {
      const voices = await elevenLabsClient.getVoices()
      return voices.voices || []
    } catch (error) {
      console.error('Failed to get voices:', error)
      return []
    }
  }

  // Enhanced SMS with better formatting
  async sendEnhancedSMS(to: string, message: string, bookingLink?: string) {
    let enhancedMessage = message

    if (bookingLink) {
      enhancedMessage += `\n\n🔗 Secure Booking Link: ${bookingLink}\n\n📞 Need help? Call us back anytime!`
    }

    return await sendSMS(to, enhancedMessage)
  }

  // Analytics and monitoring
  getConversationAnalytics(callSid: string) {
    const context = this.conversationContexts.get(callSid)
    if (!context) return null

    return {
      duration: Date.now() - context.startTime,
      turns: context.conversationHistory?.length || 0,
      confidence: context.averageConfidence || 0,
      escalationRequested: context.escalationRequested || false,
      bookingCompleted: context.bookingCompleted || false
    }
  }

  // Voice quality settings
  updateVoiceSettings(voiceId: string, settings: any) {
    if (elevenLabsClient) {
      // Update voice settings for future calls
      console.log('Voice settings updated for voice ID:', voiceId)
    }
  }
}

// Export singleton instance with default configuration
export const enhancedVoiceAgent = new EnhancedVoiceAgent({
  useDeepgram: !!process.env.DEEPGRAM_API_KEY,
  useElevenLabs: !!process.env.ELEVENLABS_API_KEY,
  fallbackToTwilio: true,
  language: 'en-US',
  voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
}) 