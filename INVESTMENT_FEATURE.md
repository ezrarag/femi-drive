# Investment Feature

## Overview
The investment page allows visitors to invest in Femi Leasing through a secure Stripe-powered payment system. The page features:

- **Animated Design**: Similar to the home page with Framer Motion animations
- **Random Letter Animation**: The "FEMI" logo letters move randomly, inspired by the Mikki Sindhunata website
- **Investment Amount Selection**: Predefined investment tiers from $1,000 to $100,000
- **Stripe Integration**: Secure payment processing with real-time validation
- **Glass Translucent Menu**: Bottom navigation bar with glassmorphism effect

## Features

### Investment Options
- **Premium Investment**: 12-15% annual returns
- **Flexible Financing**: Secure investment with flexible terms
- **Growth Opportunity**: Community-driven investment platform

### Payment Flow
1. User selects investment amount
2. Enters personal information (name, email)
3. Completes payment via Stripe
4. Receives confirmation

### Animations
- **Page Transitions**: Smooth slide animations between investment options
- **Letter Movement**: Random movement of "FEMI" letters every 2 seconds
- **Interactive Elements**: Hover and tap animations on buttons and cards
- **Form Transitions**: Smooth transitions between amount selection and payment form

## Setup

### Environment Variables
Add these to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Stripe Configuration
1. Create a Stripe account at https://dashboard.stripe.com/
2. Get your test API keys from the dashboard
3. Add them to your environment variables
4. For production, replace test keys with live keys

## Navigation
The investment page is accessible through:
- Desktop: Menu dropdown → Invest
- Mobile: Hamburger menu → Invest

## Design Inspiration
The page design is inspired by https://mikkisindhunata.com/works/ with:
- Clean, minimalist layout
- Glassmorphism effects
- Smooth animations
- Professional typography
