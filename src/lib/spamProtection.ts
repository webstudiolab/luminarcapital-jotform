// Validates reCAPTCHA token with Google
export async function validateRecaptcha(
  token: string,
  expectedAction: string,
): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not configured')
    return false
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      },
    )

    const data = await response.json()

    // reCAPTCHA v3 returns a score from 0.0 to 1.0
    // 0.0 = very likely a bot, 1.0 = very likely a human
    const isValid =
      data.success === true &&
      data.score >= 0.5 && // Threshold - adjust if needed (0.3 = lenient, 0.7 = strict)
      data.action === expectedAction

    if (!isValid) {
      console.warn('reCAPTCHA validation failed:', {
        success: data.success,
        score: data.score,
        action: data.action,
        expectedAction,
      })
    }

    return isValid
  } catch (error) {
    console.error('reCAPTCHA validation error:', error)
    return false
  }
}

// Validates honeypot field (should be empty)
export function validateHoneypot(honeypotValue: string | undefined): boolean {
  // If honeypot field has any value, it's a bot
  return !honeypotValue || honeypotValue.trim() === ''
}

// Validates submission timing (bot check)
export function validateTimestamp(timestamp: number): boolean {
  const now = Date.now()
  const elapsed = now - timestamp

  // Form must take at least 3 seconds to complete
  // But not more than 30 minutes (1800000ms)
  return elapsed >= 3000 && elapsed <= 1800000
}

// Combined spam validation
export interface SpamValidationResult {
  isValid: boolean
  reason?: string
}

export async function validateSpam(
  recaptchaToken: string,
  honeypot: string | undefined,
  timestamp: number,
  action: string = 'contact_form',
): Promise<SpamValidationResult> {
  // Check honeypot first (fastest)
  if (!validateHoneypot(honeypot)) {
    return { isValid: false, reason: 'Honeypot field filled' }
  }

  // Check timestamp
  if (!validateTimestamp(timestamp)) {
    return { isValid: false, reason: 'Suspicious timing' }
  }

  // Check reCAPTCHA (network call)
  const recaptchaValid = await validateRecaptcha(recaptchaToken, action)
  if (!recaptchaValid) {
    return { isValid: false, reason: 'reCAPTCHA validation failed' }
  }

  return { isValid: true }
}
