import OpenAI from 'openai'

export class OpenAIVoiceAgent {
  private openai: OpenAI
  private systemPrompt: string

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key required')
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    this.systemPrompt = `You are Femi, an AI assistant for Femi Leasing, a premium vehicle rental company in the NJ/NY area specializing in gig economy drivers.

COMPANY INFO:
- Femi Leasing provides flexible vehicle rentals for Uber, Lyft, and delivery drivers
- Located in Newark, NJ with service throughout NJ/NY area
- Offers daily, weekly, and lease-to-own options
- All vehicles are gig-ready and include insurance & maintenance
- Pricing starts at $42/day

YOUR ROLE:
- Answer questions about vehicle rentals, pricing, and availability
- Guide customers through the booking process
- Collect booking information (dates, vehicle type, contact info)
- Send booking links via SMS when requested
- Escalate to human agent when needed

COMMUNICATION STYLE:
- Professional but friendly
- Speak clearly and at moderate pace
- Ask one question at a time
- Confirm important details
- Keep responses concise (under 30 seconds)

Remember: You cannot process payments directly. Always send customers to our secure booking system for payment.`
  }

  async createVoiceCall() {
    try {
      const call = await this.openai.beta.assistants.create({
        name: "Femi Leasing Assistant",
        instructions: this.systemPrompt,
        model: "gpt-4o",
        tools: [
          {
            type: "function",
            function: {
              name: "send_booking_link",
              description: "Send a booking link via SMS to the customer",
              parameters: {
                type: "object",
                properties: {
                  phone_number: {
                    type: "string",
                    description: "Customer's phone number"
                  },
                  message: {
                    type: "string",
                    description: "SMS message with booking link"
                  }
                },
                required: ["phone_number", "message"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "escalate_to_human",
              description: "Transfer call to human agent",
              parameters: {
                type: "object",
                properties: {
                  reason: {
                    type: "string",
                    description: "Reason for escalation"
                  }
                },
                required: ["reason"]
              }
            }
          }
        ]
      })

      return call
    } catch (error) {
      console.error('Error creating OpenAI voice call:', error)
      throw error
    }
  }

  async processVoiceStream(callId: string, audioChunk: Buffer) {
    try {
      // This would integrate with OpenAI's streaming voice API
      // Implementation depends on OpenAI's voice API structure
      const response = await this.openai.beta.assistants.messages.create(
        callId,
        {
          role: "user",
          content: audioChunk.toString('base64')
        }
      )

      return response
    } catch (error) {
      console.error('Error processing voice stream:', error)
      throw error
    }
  }
} 