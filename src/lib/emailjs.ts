import emailjs from '@emailjs/browser';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  subject: string;
}

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/**
 * Single boundary for the third-party email transport.
 * Everything above this file speaks `ContactPayload`; nothing above it imports
 * EmailJS. Swapping providers means editing this file only.
 */
export const sendContactMessage = async (payload: ContactPayload): Promise<void> => {
  if (!isEmailConfigured) {
    throw new Error('EmailJS credentials are not configured');
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      from_name: payload.name,
      from_email: payload.email,
      reply_to: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
    PUBLIC_KEY,
  );
};
