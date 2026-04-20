import imaps from 'imap-simple';

// import { ImapFlow as imaps } from 'imapflow';
import { simpleParser } from 'mailparser';
import { MAIL, MAILAPPKEY,Host } from '../utils/test-data';

const config = {
    imap: {
       user: MAIL,
    password: MAILAPPKEY,
      host: Host,
      port: 993,
      tls: true,
      authTimeout: 10000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  };




let lastUsedOtp: string | null = null;
let lastUID: number | null = null;

//  MAIN FUNCTION
export async function getOTP(triggerTime: number): Promise<string> {
  const connection = await imaps.connect(config);

  try {
    await connection.openBox('INBOX');

    console.log(" Fetching emails...");

    // Add buffer to avoid missing delayed emails
    const sinceDate = new Date(triggerTime - 60000); // 1 min buffer

    const searchCriteria = [['SINCE', sinceDate, 'b1hub@blazeautomation.com']];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    console.log("Total messages fetched:", messages.length);

    if (!messages.length) {
      throw new Error("No emails found");
    }

    //  Take last 20 emails for safety
    const recentMessages = messages.slice(-20);

    // Filter relevant OTP emails
    const filtered = recentMessages.filter((msg: any) => {
      const uid = msg.attributes.uid;

      //  Skip already processed emails
      if (lastUID && uid <= lastUID) return false;

      const header = msg.parts.find((p: any) => p.which === 'HEADER');
      const subject = header?.body?.subject?.[0]?.toLowerCase() || '';

      return (
        subject.includes('otp') ||
        subject.includes('code') ||
        subject.includes('forgot')
      );
    });

    console.log(" OTP candidate emails:", filtered.length);

    if (!filtered.length) {
      throw new Error("No OTP email found yet");
    }

    // Sort latest first
    const latest = filtered.sort(
      (a: any, b: any) => b.attributes.uid - a.attributes.uid
    )[0];

    //  Save last processed UID
    lastUID = latest.attributes.uid;

    const fullBodyPart = latest.parts.find((p: any) => p.which === '');

    if (!fullBodyPart) {
      throw new Error("Email body not found");
    }

    const parsed = await simpleParser(fullBodyPart.body);

    const body =
      parsed.text ||
      parsed.html ||
      parsed.textAsHtml ||
      '';

    console.log(" Email preview:", body.substring(0, 200));

    // Strong OTP regex
    const otpMatch =
      body.match(/(?:OTP|code)[^0-9]*(\d{4,6})/i) ||
      body.match(/\b\d{6}\b/);

    if (!otpMatch) {
      throw new Error("OTP not found in email");
    }

    const otp = otpMatch[1] || otpMatch[0];

    //  Allow duplicate OTP (some systems resend same OTP)
    if (otp === lastUsedOtp) {
      console.log("Same OTP received again, accepting...");
    }

    lastUsedOtp = otp;

    console.log(" OTP Extracted:", otp);

    return otp;

  } finally {
    connection.end();
  }
}

// RETRY WRAPPER (SMART RETRY)
export async function getOTPWithRetry(
  triggerTime: number,
  retries = 6,
  baseDelay = 4000
): Promise<string> {

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}...`);

      const otp = await getOTP(triggerTime);

      if (otp) return otp;

    } catch (err: any) {
      console.log("Retry reason:", err.message);
    }

    // Progressive delay (4s → 8s → 12s...)
    const waitTime = baseDelay * (i + 1);
    console.log(`Waiting ${waitTime / 1000}s before retry...`);

    await new Promise(res => setTimeout(res, waitTime));
  }

  throw new Error("OTP not received after retries");
}