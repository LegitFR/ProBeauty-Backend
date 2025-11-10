import nodemailer from 'nodemailer';

import { envConfig } from '@/configs/env';

const EMAIL_TIMEOUT = 15000; // 15 seconds timeout

const sendEmail = async (email: string, subject: string, htmlContent: string): Promise<void> => {
  const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = envConfig;

  try {
    // Use explicit SMTP configuration for better production reliability
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
      },
      connectionTimeout: 10000, // 10 seconds to establish connection
      socketTimeout: 15000, // 15 seconds for socket inactivity
      pool: true, // Use pooled connections
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5,
    });

    const mailOptions = {
      from: `"ProBeauty" <${EMAIL_USERNAME}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    // Add timeout wrapper to prevent indefinite hanging
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), EMAIL_TIMEOUT);
    });

    await Promise.race([emailPromise, timeoutPromise]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email sending failed:', errorMessage);
    throw new Error('Email could not be sent: ' + errorMessage);
  }
};

export default sendEmail;
