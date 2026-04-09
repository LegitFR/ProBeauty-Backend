import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import sendEmail, { type EmailAttachment } from './sendEmail';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const injectData = (template: string, data: Record<string, string>): string => {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
};

export const sendInvitationRequestEmail = async (email: string): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'invitationRequest.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { email });
  await sendEmail(email, 'Invitation Request', htmlContent);
};

export const sendRegistrationOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'registrationOtp.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { name, otp });
  await sendEmail(email, 'Confirm Your Registration', htmlContent);
};

export const sendRegistrationSuccessEmail = async (email: string, name: string): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'successRegistration.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { name });
  await sendEmail(email, 'Registration Confirmed', htmlContent);
};

export const sendResetPasswordOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'resetPasswordOtp.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { name, otp });
  await sendEmail(email, 'Reset Your Password', htmlContent);
};

export const sendResetPasswordSuccessEmail = async (email: string, name: string): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'successResetPassword.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { name });
  await sendEmail(email, 'Password Reset Successfully', htmlContent);
};

export const sendEmailChangeOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'emailChangeOtp.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { name, otp });
  await sendEmail(email, 'Confirm Your New Email Address', htmlContent);
};

export const sendEmailChangeSuccessEmail = async (email: string, name: string): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'emailChangeSuccess.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, { name });
  await sendEmail(email, 'Email Address Updated', htmlContent);
};

interface OrderInvoiceEmailInput {
  email: string;
  customerName: string;
  orderId: string;
  invoiceNumber: string;
  invoiceUrl: string;
  attachment: EmailAttachment;
}

export const sendOrderInvoiceEmail = async ({
  email,
  customerName,
  orderId,
  invoiceNumber,
  invoiceUrl,
  attachment,
}: OrderInvoiceEmailInput): Promise<void> => {
  const templatePath = path.join(__dirname, 'templates', 'orderInvoice.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const htmlContent = injectData(template, {
    customerName,
    orderId,
    invoiceNumber,
    invoiceUrl,
  });

  await sendEmail(email, `Your ProBeauty invoice ${invoiceNumber}`, htmlContent, {
    attachments: [attachment],
  });
};
