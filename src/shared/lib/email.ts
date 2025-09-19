import "server-only";
import { Resend } from "resend";
import { getEnv } from "@/shared/env";

/**
 * Email operation types supported by the utility
 */
export type EmailOperationType = 
  | "otp-signin" 
  | "otp-email-verification" 
  | "otp-password-reset"
  | "email-change-verification"
  | "email-change-confirmation"
  | "password-change-notification"
  | "account-deletion-confirmation";

/**
 * Base parameters for all email operations
 */
interface BaseEmailParams {
  /** Recipient email address */
  to: string;
  /** Type of email operation */
  type: EmailOperationType;
  /** Additional context data for the email */
  data?: Record<string, unknown>;
}

/**
 * Parameters for OTP-based email operations
 */
interface OTPEmailParams extends BaseEmailParams {
  type: "otp-signin" | "otp-email-verification" | "otp-password-reset";
  data: {
    /** One-time password code */
    otp: string;
    /** Optional expiration time in minutes (default: 5) */
    expirationMinutes?: number;
  };
}

/**
 * Parameters for email change verification
 */
interface EmailChangeVerificationParams extends BaseEmailParams {
  type: "email-change-verification";
  data: {
    /** Current email address */
    currentEmail: string;
    /** New email address to verify */
    newEmail: string;
    /** Verification URL */
    verificationUrl: string;
    /** Verification token */
    token: string;
  };
}

/**
 * Parameters for email change confirmation
 */
interface EmailChangeConfirmationParams extends BaseEmailParams {
  type: "email-change-confirmation";
  data: {
    /** Previous email address */
    previousEmail: string;
    /** New email address */
    newEmail: string;
    /** Timestamp of the change */
    changedAt: Date;
  };
}

/**
 * Parameters for security notification emails
 */
interface SecurityNotificationParams extends BaseEmailParams {
  type: "password-change-notification" | "account-deletion-confirmation";
  data: {
    /** User's name or username */
    userName?: string;
    /** Timestamp of the action */
    timestamp: Date;
    /** IP address where action was performed */
    ipAddress?: string;
    /** User agent information */
    userAgent?: string;
  };
}

/**
 * Union type for all email parameters
 */
export type EmailParams = 
  | OTPEmailParams 
  | EmailChangeVerificationParams 
  | EmailChangeConfirmationParams 
  | SecurityNotificationParams;

/**
 * Email delivery result
 */
export interface EmailResult {
  /** Whether the email was sent successfully */
  success: boolean;
  /** Email ID from the provider (if successful) */
  emailId?: string;
  /** Error message (if failed) */
  error?: string;
  /** Additional metadata */
  metadata?: {
    provider: string;
    timestamp: Date;
    recipient: string;
    type: EmailOperationType;
  };
}

/**
 * Email template configuration
 */
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Logger interface for email operations
 */
interface EmailLogger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
}

/**
 * Simple console-based logger implementation
 * In production, this should be replaced with a proper logging service
 */
const logger: EmailLogger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(`[EMAIL-INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[EMAIL-ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[EMAIL-WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
};

/**
 * Email template generators
 */
class EmailTemplates {
  private static getBaseStyles(): string {
    return `
      <style>
        .email-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .email-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .email-content {
          line-height: 1.6;
          color: #374151;
        }
        .otp-code {
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .security-info {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 16px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    `;
  }

  static generateOTPEmail(params: OTPEmailParams): EmailTemplate {
    const { otp, expirationMinutes = 5 } = params.data;
    const actionText = {
      'otp-signin': 'sign in to your account',
      'otp-email-verification': 'verify your email address',
      'otp-password-reset': 'reset your password'
    }[params.type];

    const subject = {
      'otp-signin': 'Sign in to your account',
      'otp-email-verification': 'Verify your email address',
      'otp-password-reset': 'Reset your password'
    }[params.type];

    const html = `
      ${this.getBaseStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Your Verification Code</h1>
        </div>
        <div class="email-content">
          <p>Use this code to ${actionText}:</p>
          <div class="otp-code">${otp}</div>
          <p><strong>This code will expire in ${expirationMinutes} minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const text = `
      Your verification code: ${otp}
      
      Use this code to ${actionText}.
      This code will expire in ${expirationMinutes} minutes.
      
      If you didn't request this code, please ignore this email.
    `;

    return { subject, html, text };
  }

  static generateEmailChangeVerification(params: EmailChangeVerificationParams): EmailTemplate {
    const { currentEmail, newEmail, verificationUrl } = params.data;

    const subject = 'Approve Email Address Change';

    const html = `
      ${this.getBaseStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Email Change Request</h1>
        </div>
        <div class="email-content">
          <p>We received a request to change your email address from <strong>${currentEmail}</strong> to <strong>${newEmail}</strong>.</p>
          <p>To approve this change, please click the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Approve Email Change</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          <div class="security-info">
            <p><strong>Security Notice:</strong> This verification email was sent to your current email address for security purposes. If you didn't request this change, please ignore this email and consider changing your password.</p>
          </div>
        </div>
        <div class="footer">
          <p>This link will expire in 24 hours for security reasons.</p>
        </div>
      </div>
    `;

    const text = `
      Email Change Request
      
      We received a request to change your email address from ${currentEmail} to ${newEmail}.
      
      To approve this change, please visit: ${verificationUrl}
      
      If you didn't request this change, please ignore this email and consider changing your password.
      
      This link will expire in 24 hours for security reasons.
    `;

    return { subject, html, text };
  }

  static generateEmailChangeConfirmation(params: EmailChangeConfirmationParams): EmailTemplate {
    const { previousEmail, newEmail, changedAt } = params.data;

    const subject = 'Email Address Successfully Changed';

    const html = `
      ${this.getBaseStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Email Address Changed</h1>
        </div>
        <div class="email-content">
          <p>Your email address has been successfully changed.</p>
          <p><strong>Previous email:</strong> ${previousEmail}</p>
          <p><strong>New email:</strong> ${newEmail}</p>
          <p><strong>Changed on:</strong> ${changedAt.toLocaleString()}</p>
          <div class="security-info">
            <p><strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately and consider changing your password.</p>
          </div>
        </div>
        <div class="footer">
          <p>This is a security notification. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const text = `
      Email Address Changed
      
      Your email address has been successfully changed.
      
      Previous email: ${previousEmail}
      New email: ${newEmail}
      Changed on: ${changedAt.toLocaleString()}
      
      If you didn't make this change, please contact our support team immediately.
    `;

    return { subject, html, text };
  }

  static generateSecurityNotification(params: SecurityNotificationParams): EmailTemplate {
    const { userName, timestamp, ipAddress, userAgent } = params.data;
    
    const isPasswordChange = params.type === 'password-change-notification';
    const action = isPasswordChange ? 'Password Changed' : 'Account Deleted';
    const actionText = isPasswordChange ? 'password was changed' : 'account was deleted';

    const subject = `Security Alert: ${action}`;

    const html = `
      ${this.getBaseStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Security Alert</h1>
        </div>
        <div class="email-content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>
          <p>Your ${actionText} on ${timestamp.toLocaleString()}.</p>
          ${ipAddress || userAgent ? `
            <div class="security-info">
              <p><strong>Security Details:</strong></p>
              ${ipAddress ? `<p>IP Address: ${ipAddress}</p>` : ''}
              ${userAgent ? `<p>Device: ${userAgent}</p>` : ''}
            </div>
          ` : ''}
          <p>If you didn't perform this action, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>This is a security notification. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const text = `
      Security Alert: ${action}
      
      Hello${userName ? ` ${userName}` : ''},
      
      Your ${actionText} on ${timestamp.toLocaleString()}.
      
      ${ipAddress ? `IP Address: ${ipAddress}\n` : ''}
      ${userAgent ? `Device: ${userAgent}\n` : ''}
      
      If you didn't perform this action, please contact our support team immediately.
    `;

    return { subject, html, text };
  }
}

/**
 * Centralized email utility class
 */
class EmailService {
  private resend: Resend;
  private env: ReturnType<typeof getEnv>;

  constructor() {
    this.env = getEnv();
    this.resend = new Resend(this.env.RESEND_API_KEY!);
  }

  /**
   * Validates email parameters for security
   */
  private validateParams(params: EmailParams): void {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.to)) {
      throw new Error('Invalid email address format');
    }

    // Validate required data based on type
    switch (params.type) {
      case 'otp-signin':
      case 'otp-email-verification':
      case 'otp-password-reset':
        if (!params.data?.otp || typeof params.data.otp !== 'string') {
          throw new Error('OTP is required for OTP-based emails');
        }
        if (params.data.otp.length < 4 || params.data.otp.length > 8) {
          throw new Error('OTP must be between 4 and 8 characters');
        }
        break;
      
      case 'email-change-verification':
        const changeData = params.data as EmailChangeVerificationParams['data'];
        if (!changeData?.verificationUrl || !changeData?.newEmail || !changeData?.currentEmail) {
          throw new Error('Verification URL, new email, and current email are required');
        }
        break;
    }
  }

  /**
   * Generates email template based on operation type
   */
  private generateTemplate(params: EmailParams): EmailTemplate {
    switch (params.type) {
      case 'otp-signin':
      case 'otp-email-verification':
      case 'otp-password-reset':
        return EmailTemplates.generateOTPEmail(params as OTPEmailParams);
      
      case 'email-change-verification':
        return EmailTemplates.generateEmailChangeVerification(params as EmailChangeVerificationParams);
      
      case 'email-change-confirmation':
        return EmailTemplates.generateEmailChangeConfirmation(params as EmailChangeConfirmationParams);
      
      case 'password-change-notification':
      case 'account-deletion-confirmation':
        return EmailTemplates.generateSecurityNotification(params as SecurityNotificationParams);
      
      default:
        throw new Error(`Unsupported email type: ${(params as EmailParams).type}`);
    }
  }

  /**
   * Sends an email with comprehensive error handling and logging
   * 
   * @param params - Email parameters including type, recipient, and data
   * @returns Promise<EmailResult> - Result of the email operation
   * 
   * @example
   * ```typescript
   * // Send OTP email
   * const result = await emailService.sendEmail({
   *   to: 'user@example.com',
   *   type: 'otp-email-verification',
   *   data: { otp: '123456' }
   * });
   * 
   * // Send email change verification
   * const result = await emailService.sendEmail({
   *   to: 'current@example.com',
   *   type: 'email-change-verification',
   *   data: {
   *     currentEmail: 'current@example.com',
   *     newEmail: 'new@example.com',
   *     verificationUrl: 'https://app.com/verify?token=abc123',
   *     token: 'abc123'
   *   }
   * });
   * ```
   */
  async sendEmail(params: EmailParams): Promise<EmailResult> {
    const startTime = Date.now();
    const metadata = {
      provider: 'resend',
      timestamp: new Date(),
      recipient: params.to,
      type: params.type,
    };

    try {
      // Log email attempt
      logger.info('Attempting to send email', {
        type: params.type,
        recipient: params.to,
        timestamp: metadata.timestamp.toISOString(),
      });

      // Validate parameters
      this.validateParams(params);

      // Generate email template
      const template = this.generateTemplate(params);

      // Send email via Resend
      const response = await this.resend.emails.send({
        from: this.env.EMAIL_FROM!,
        to: params.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      const duration = Date.now() - startTime;

      // Log successful delivery
      logger.info('Email sent successfully', {
        type: params.type,
        recipient: params.to,
        emailId: response.data?.id,
        duration: `${duration}ms`,
      });

      return {
        success: true,
        emailId: response.data?.id,
        metadata,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Log error
      logger.error('Failed to send email', {
        type: params.type,
        recipient: params.to,
        error: errorMessage,
        duration: `${duration}ms`,
      });

      return {
        success: false,
        error: errorMessage,
        metadata,
      };
    }
  }

  /**
   * Sends multiple emails with batch processing
   * 
   * @param emailList - Array of email parameters
   * @param options - Batch processing options
   * @returns Promise<EmailResult[]> - Results for each email
   */
  async sendBatchEmails(
    emailList: EmailParams[],
    options: { concurrency?: number; delayMs?: number } = {}
  ): Promise<EmailResult[]> {
    const { concurrency = 5, delayMs = 100 } = options;
    const results: EmailResult[] = [];

    logger.info('Starting batch email send', {
      totalEmails: emailList.length,
      concurrency,
      delayMs,
    });

    // Process emails in batches
    for (let i = 0; i < emailList.length; i += concurrency) {
      const batch = emailList.slice(i, i + concurrency);
      
      const batchPromises = batch.map(params => this.sendEmail(params));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + concurrency < emailList.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info('Batch email send completed', {
      totalEmails: emailList.length,
      successCount,
      failureCount,
    });

    return results;
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

/**
 * Gets the singleton email service instance
 * 
 * @returns EmailService instance
 */
export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

/**
 * Convenience function for sending a single email
 * 
 * @param params - Email parameters
 * @returns Promise<EmailResult> - Result of the email operation
 * 
 * @example
 * ```typescript
 * import { sendEmail } from '@/shared/lib/email';
 * 
 * // Send OTP for email verification
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   type: 'otp-email-verification',
 *   data: { otp: '123456', expirationMinutes: 10 }
 * });
 * 
 * if (result.success) {
 *   console.log('Email sent successfully:', result.emailId);
 * } else {
 *   console.error('Failed to send email:', result.error);
 * }
 * ```
 */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  const emailService = getEmailService();
  return emailService.sendEmail(params);
}

/**
 * Convenience function for sending multiple emails
 * 
 * @param emailList - Array of email parameters
 * @param options - Batch processing options
 * @returns Promise<EmailResult[]> - Results for each email
 */
export async function sendBatchEmails(
  emailList: EmailParams[],
  options?: { concurrency?: number; delayMs?: number }
): Promise<EmailResult[]> {
  const emailService = getEmailService();
  return emailService.sendBatchEmails(emailList, options);
}

// Re-export types for external use (avoiding conflicts)
export type {
  OTPEmailParams,
  EmailChangeVerificationParams,
  EmailChangeConfirmationParams,
  SecurityNotificationParams,
};