/**
 * OTP Service
 * 
 * In-memory implementation for development.
 * 
 * PRODUCTION NOTE:
 * In production, replace this with a proper SMS provider integration:
 * - Twilio (recommended): https://www.twilio.com/docs/sms
 * - AWS SNS: https://aws.amazon.com/sns/
 * - MessageBird: https://www.messagebird.com/
 * - Or any other SMS gateway
 * 
 * For production, you should:
 * 1. Store OTPs in Redis or database with TTL
 * 2. Integrate with SMS provider API
 * 3. Add rate limiting to prevent abuse
 * 4. Add OTP attempt tracking
 */

interface OTPData {
  phone: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

export class OTPService {
  private otpStore: Map<string, OTPData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly OTP_LENGTH = 6;

  /**
   * Generate a random OTP
   */
  private generateRandomOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate and store OTP for a phone number
   * In production, this should send SMS via Twilio or similar service
   */
  async generateOTP(phone: string): Promise<string> {
    // Clean up expired OTPs
    this.cleanupExpiredOTPs();

    // Check if OTP already exists for this phone
    const existing = this.otpStore.get(phone);
    if (existing && existing.expiresAt > Date.now()) {
      // Return existing OTP for development (in prod, generate new one)
      console.log(`[OTP Service] Returning existing OTP for ${phone} (dev mode)`);
      return existing.otp;
    }

    // Generate new OTP
    const otp = this.generateRandomOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000;

    this.otpStore.set(phone, {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    });

    // In production, send SMS here:
    // await this.sendSMS(phone, `Your OTP is: ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`);
    
    console.log(`[OTP Service] Generated OTP for ${phone}: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);
    console.log(`[OTP Service] PRODUCTION: Send SMS to ${phone} with OTP: ${otp}`);

    return otp;
  }

  /**
   * Verify OTP for a phone number
   */
  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    const otpData = this.otpStore.get(phone);

    if (!otpData) {
      console.log(`[OTP Service] No OTP found for ${phone}`);
      return false;
    }

    // Check if expired
    if (otpData.expiresAt < Date.now()) {
      this.otpStore.delete(phone);
      console.log(`[OTP Service] OTP expired for ${phone}`);
      return false;
    }

    // Check max attempts
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(phone);
      console.log(`[OTP Service] Max attempts reached for ${phone}`);
      return false;
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.otp === otp) {
      // OTP verified successfully, remove it
      this.otpStore.delete(phone);
      console.log(`[OTP Service] OTP verified successfully for ${phone}`);
      return true;
    }

    // Update attempts
    this.otpStore.set(phone, otpData);
    console.log(`[OTP Service] Invalid OTP for ${phone} (attempt ${otpData.attempts}/${this.MAX_ATTEMPTS})`);
    return false;
  }

  /**
   * Remove OTP for a phone number (after successful verification)
   */
  removeOTP(phone: string): void {
    this.otpStore.delete(phone);
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [phone, data] of this.otpStore.entries()) {
      if (data.expiresAt < now) {
        this.otpStore.delete(phone);
      }
    }
  }

  /**
   * Get OTP data for a phone (for testing/debugging)
   */
  getOTPData(phone: string): OTPData | undefined {
    return this.otpStore.get(phone);
  }

  /**
   * Production: Send SMS via Twilio or other provider
   * Uncomment and implement when ready for production
   */
  /*
  private async sendSMS(phone: string, message: string): Promise<void> {
    // Example with Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });
    
    throw new Error('SMS sending not implemented. Configure Twilio or SMS provider.');
  }
  */
}

export const otpService = new OTPService();

