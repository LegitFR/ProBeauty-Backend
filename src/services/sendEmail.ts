import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

import { envConfig } from '@/configs/env';

const EMAIL_TIMEOUT = 15000; // 15 seconds timeout

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface SendEmailOptions {
  attachments?: EmailAttachment[];
}

// Singleton transporter — created once and reused across all email calls.
// Re-creating a pooled transporter per call defeats the purpose of pooling
// and can cause SMTP connection/auth failures under load.
const createTransporter = () => {
  const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = envConfig;

  // Gmail App Passwords are displayed with spaces (xxxx xxxx xxxx xxxx)
  // but must be used without spaces in SMTP auth.
  const cleanPassword = EMAIL_PASSWORD.replace(/\s/g, '');

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for port 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: {
      user: EMAIL_USERNAME,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: true,
    },
    pool: true,
    maxConnections: 5,
    rateDelta: 1000,
    rateLimit: 5,
  });
};

const transporter = createTransporter();

/**
 * Verifies the SMTP connection and credentials.
 * Call this on server startup to catch misconfiguration early.
 */
export const verifyEmailTransporter = async (): Promise<void> => {
  await transporter.verify();
};

const sendEmail = async (
  email: string,
  subject: string,
  htmlContent: string,
  options: SendEmailOptions = {}
): Promise<void> => {
  const { EMAIL_USERNAME } = envConfig;

  const mailOptions: Mail.Options = {
    from: `"ProBeauty" <${EMAIL_USERNAME}>`,
    to: email,
    subject,
    html: htmlContent,
    attachments: options.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    })),
  };

  // Timeout wrapper to prevent indefinite hanging on SMTP stall
  const emailPromise = transporter.sendMail(mailOptions);
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), EMAIL_TIMEOUT);
  });

  try {
    await Promise.race([emailPromise, timeoutPromise]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email sending failed:', errorMessage);
    throw new Error('Email could not be sent: ' + errorMessage);
  }
};

export default sendEmail;
