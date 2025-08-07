# Enhanced AI Voice System for Femi Leasing

## Overview

Your voice system has been enhanced with professional-grade speech recognition and text-to-speech capabilities. The system now supports:

- **Deepgram** for superior speech-to-text accuracy
- **ElevenLabs** for high-quality voice synthesis
- **Fallback mechanisms** to ensure reliability
- **Voice management dashboard** for easy configuration
- **Analytics and monitoring** for performance tracking

## Architecture

```
Customer Call → Twilio → Your API → Enhanced Voice Agent → AI Processing → Voice Response
                                    ↓
                              Deepgram (STT) + ElevenLabs (TTS)
                                    ↓
                              Fallback to Twilio if needed
```

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Required for basic functionality
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
OPENAI_API_KEY=your_openai_api_key

# Enhanced voice features (optional)
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Business settings
BUSINESS_OWNER_PHONE=+1234567890
```

### 2. Get API Keys

**Deepgram** (Speech-to-Text):
1. Sign up at [deepgram.com](https://deepgram.com)
2. Get your API key from the console
3. Free tier: 200 hours/month

**ElevenLabs** (Text-to-Speech):
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the dashboard
3. Free tier: 10,000 characters/month

### 3. Install Dependencies

```bash
pnpm install
```

## Features

### Enhanced Speech Recognition
- **Deepgram Nova-2** model for superior accuracy
- **Real-time transcription** with confidence scores
- **Speaker diarization** (identifies different speakers)
- **Smart formatting** (punctuation, numbers, etc.)

### High-Quality Voice Synthesis
- **ElevenLabs** for natural-sounding voices
- **Voice cloning** capabilities
- **Multiple voice options** (Rachel, Adam, Bella, etc.)
- **Custom voice creation** from audio samples

### Fallback System
- **Automatic fallback** to Twilio if enhanced services fail
- **Graceful degradation** ensures calls always work
- **Error handling** with detailed logging

### Voice Management Dashboard
Access at `/admin/voice-settings` to:
- Test different voices
- Configure speech recognition settings
- Monitor call analytics
- Create custom voices

## Usage

### Making Calls

Your system works exactly as before - customers call your Twilio number and get connected to the AI assistant. The enhanced system automatically:

1. **Captures audio** from the caller
2. **Transcribes speech** using Deepgram (if available)
3. **Processes with AI** using your existing OpenAI integration
4. **Generates voice response** using ElevenLabs (if available)
5. **Plays back response** through Twilio

### Voice Testing

Use the dashboard to test different voices:

1. Go to `/admin/voice-settings`
2. Click the "Voice Test" tab
3. Enter text and select a voice
4. Click "Test Voice" to hear the result

### Creating Custom Voices

1. **Prepare audio samples** (3-10 minutes of clear speech)
2. **Upload to ElevenLabs** through the dashboard
3. **Train the voice** (takes 5-10 minutes)
4. **Use in your system** immediately

## Cost Analysis

### Current System (Basic)
- **Twilio**: ~$0.006/minute
- **OpenAI**: ~$0.002/1K tokens
- **Total**: ~$0.01/minute

### Enhanced System
- **Twilio**: ~$0.006/minute
- **OpenAI**: ~$0.002/1K tokens
- **Deepgram**: ~$0.004/minute (Nova-2)
- **ElevenLabs**: ~$0.002/minute
- **Total**: ~$0.014/minute

**Cost increase**: ~40% for significantly better quality

## API Endpoints

### Voice Configuration
- `GET /api/admin/voice-config/voices` - Get available voices
- `GET /api/admin/voice-config/analytics` - Get call analytics
- `GET /api/admin/voice-config/settings` - Get current settings
- `POST /api/admin/voice-config/test` - Test voice synthesis
- `POST /api/admin/voice-config/settings` - Update settings

### Voice Processing
- `POST /api/voice` - Main voice processing endpoint
- `POST /api/voice/voicemail` - Voicemail handling

## Troubleshooting

### Common Issues

**"Deepgram not configured"**
- Add `DEEPGRAM_API_KEY` to your environment
- System will fall back to Twilio transcription

**"ElevenLabs not configured"**
- Add `ELEVENLABS_API_KEY` to your environment
- System will use Twilio TTS

**"Voice test failed"**
- Check API key validity
- Ensure text is not empty
- Check network connectivity

### Performance Monitoring

Monitor these metrics:
- **Call success rate**: Should be >95%
- **Average confidence**: Should be >80%
- **Response time**: Should be <2 seconds
- **Escalation rate**: Should be <15%

## Advanced Configuration

### Custom Voice Settings

```typescript
// In lib/enhanced-voice-agent.ts
const config = {
  useDeepgram: true,
  useElevenLabs: true,
  fallbackToTwilio: true,
  voiceId: 'your-custom-voice-id',
  language: 'en-US'
}
```

### Voice Quality Tuning

```typescript
// ElevenLabs voice settings
const voiceSettings = {
  stability: 0.5,        // 0-1: Higher = more stable
  similarity_boost: 0.5, // 0-1: Higher = more similar to original
  style: 0.0,           // 0-1: Higher = more expressive
  use_speaker_boost: true
}
```

## Security Considerations

1. **API Key Management**: Store keys securely in environment variables
2. **Rate Limiting**: Monitor usage to prevent abuse
3. **Data Privacy**: Audio is not stored permanently
4. **Access Control**: Admin dashboard should be protected

## Future Enhancements

1. **Real-time streaming** with WebRTC
2. **Multi-language support** with language detection
3. **Emotion detection** for better responses
4. **Call recording** for quality assurance
5. **Advanced analytics** with conversation insights

## Support

For issues or questions:
1. Check the logs in your console
2. Verify API keys are correct
3. Test individual services separately
4. Monitor usage quotas

Your enhanced voice system is now ready to provide a superior customer experience with professional-grade voice quality! 