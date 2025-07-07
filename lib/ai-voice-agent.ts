import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CallContext {
  callSid: string
  from: string
  to: string
  conversationHistory: Array<{
    role: "system" | "user" | "assistant"
    content: string
    timestamp: Date
  }>
  customerInfo?: {
    name?: string
    preferredVehicleType?: string
    dates?: {
      startDate?: string
      endDate?: string
    }
    location?: string
  }
  escalationRequested?: boolean
  bookingInProgress?: boolean
}

export class AIVoiceAgent {
  private systemPrompt: string
  private conversationContexts: Map<string, CallContext> = new Map()

  constructor() {
    this.systemPrompt = this.getSystemPrompt()
  }

  private getSystemPrompt(): string {
    return `You are Femi, an AI assistant for Femi Leasing, a premium vehicle rental company in the NJ/NY area specializing in gig economy drivers.

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

ESCALATION TRIGGERS:
- Customer says "speak to a person", "human agent", or "transfer me"
- Complex pricing negotiations
- Technical issues with booking
- Complaints or disputes
- Requests outside your knowledge scope

BOOKING FLOW:
1. Greet customer and ask how you can help
2. If booking: collect dates, vehicle preference, location
3. Check availability (simulate - always say "let me check our system")
4. Provide pricing and confirm details
5. Offer to send secure booking link via SMS
6. If customer agrees, collect phone number and send link

COMMUNICATION STYLE:
- Professional but friendly
- Speak clearly and at moderate pace
- Ask one question at a time
- Confirm important details
- Keep responses concise (under 30 seconds)

AVAILABLE VEHICLES:
- Economy sedans ($42-45/day) - Nissan Sentra, etc.
- Mid-size sedans ($48-52/day) - VW Passat, BMW 328i, etc.
- SUVs ($55/day) - Ford Edge, Chevy Equinox, etc.

Remember: You cannot process payments directly. Always send customers to our secure booking system for payment.`
  }

  async processCall(
    callSid: string,
    userInput: string,
    callInfo: any,
  ): Promise<{
    response: string
    action: "continue" | "escalate" | "send_booking_link" | "end_call"
    bookingData?: any
  }> {
    let context = this.conversationContexts.get(callSid)

    if (!context) {
      context = {
        callSid,
        from: callInfo.from,
        to: callInfo.to,
        conversationHistory: [],
        customerInfo: {},
      }
      this.conversationContexts.set(callSid, context)
    }

    // Add user input to conversation history
    context.conversationHistory.push({
      role: "user",
      content: userInput,
      timestamp: new Date(),
    })

    // Check for escalation triggers
    if (this.shouldEscalate(userInput)) {
      context.escalationRequested = true
      return {
        response:
          "I understand you'd like to speak with someone from our team. Let me transfer you to our business owner right away. Please hold for just a moment.",
        action: "escalate",
      }
    }

    // Generate AI response
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompt },
          ...context.conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        max_tokens: 150,
        temperature: 0.7,
      })

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I apologize, I'm having trouble processing that. Could you please repeat your request?"

      // Add AI response to conversation history
      context.conversationHistory.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      })

      // Analyze if booking link should be sent
      const shouldSendBookingLink = this.shouldSendBookingLink(aiResponse, context)

      if (shouldSendBookingLink) {
        return {
          response: aiResponse,
          action: "send_booking_link",
          bookingData: context.customerInfo,
        }
      }

      return {
        response: aiResponse,
        action: "continue",
      }
    } catch (error) {
      console.error("AI processing error:", error)
      return {
        response:
          "I'm experiencing some technical difficulties. Let me transfer you to our team for immediate assistance.",
        action: "escalate",
      }
    }
  }

  private shouldEscalate(userInput: string): boolean {
    const escalationTriggers = [
      "speak to a person",
      "human agent",
      "transfer me",
      "talk to someone",
      "real person",
      "customer service",
      "manager",
      "supervisor",
    ]

    return escalationTriggers.some((trigger) => userInput.toLowerCase().includes(trigger))
  }

  private shouldSendBookingLink(aiResponse: string, context: CallContext): boolean {
    const bookingIndicators = ["send you a link", "booking link", "secure link", "text you", "sms"]

    return (
      bookingIndicators.some((indicator) => aiResponse.toLowerCase().includes(indicator)) && context.customerInfo?.name
    )
  }

  updateSystemPrompt(newPrompt: string) {
    this.systemPrompt = newPrompt
  }

  getConversationHistory(callSid: string): CallContext | undefined {
    return this.conversationContexts.get(callSid)
  }

  clearConversation(callSid: string) {
    this.conversationContexts.delete(callSid)
  }
}

export const aiAgent = new AIVoiceAgent()
