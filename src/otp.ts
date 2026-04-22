// import { ImapFlow } from 'imapflow';
// import { simpleParser } from 'mailparser';
// import { MAIL, MAILAPPKEY, Host } from '../utils/test-data';

// let lastUsedOtp: string | null = null;
// let lastUID: number = 0;


// export async function getOTP(triggerTime: number): Promise<string> {

//   const client = new ImapFlow({
//     host: Host,
//     port: 993,
//     secure: true,
//     auth: {
//       user: MAIL,
//       pass: MAILAPPKEY
//     },
//     logger: false
//   });

//   await client.connect();
//   const lock = await client.getMailboxLock('INBOX');

//   try {
//     const messages: any[] = [];

//     // Fetch emails from inbox
//     for await (let msg of client.fetch('*', {
//       uid: true,
//       envelope: true,
//       source: true,
//       internalDate: true
//     })) {
//       messages.push(msg);
//     }

//     // Consider only last 20 emails for performance
//     const recentMessages = messages.slice(-20);

//     // Apply buffer to handle email delivery delay
//     const bufferTime = triggerTime - 60000; // 2 minutes buffer

//     console.log("Trigger Time :", new Date(triggerTime).toISOString());
//     console.log("Buffer Time  :", new Date(bufferTime).toISOString());

//     const filtered = recentMessages.filter(msg => {
//       const emailTime = new Date(msg.internalDate).getTime();

//       // Ignore emails older than buffer time
//       if (emailTime < bufferTime) return false;

//       // Ignore already processed emails
//       if (msg.uid <= lastUID) return false;

//       const subject = (msg.envelope?.subject || '').toLowerCase();

//       // Filter relevant emails
//       return (
//         subject.includes('otp') ||
//         subject.includes('code') ||
//         subject.includes('forgot') ||
//         subject.includes('password')
//       );
//     });

//     if (!filtered.length) {
//       throw new Error("No OTP email found");
//     }

//     // Get latest email based on UID
//     const latest = filtered.sort((a, b) => b.uid - a.uid)[0];
//     lastUID = latest.uid;

//     const parsed = await simpleParser(latest.source);

//     const body =
//       parsed.text ||
//       parsed.html ||
//       parsed.textAsHtml ||
//       '';

//     // Extract OTP (4 to 6 digits)
//     const otpMatch =
//       body.match(/(?:OTP|code)[^0-9]*(\d{4,6})/i) ||
//       body.match(/\b\d{6}\b/);

//     if (!otpMatch) {
//       throw new Error("OTP not found in email");
//     }

//     const otp = otpMatch[1] || otpMatch[0];
//     lastUsedOtp = otp;

//     return otp;

//   } finally {
//     lock.release();
//     await client.logout();
//   }
// }

// /**
//  * Retry wrapper for OTP fetch
//  * @param triggerTime OTP trigger timestamp
//  * @param retries number of attempts
//  * @param delay delay between retries (ms)
//  */
// export async function getOTPWithRetry(
//   triggerTime: number,
//   retries = 20,
//   delay = 2000
// ): Promise<string> {

//   for (let i = 0; i < retries; i++) {
//     try {
//       const otp = await getOTP(triggerTime);
//       if (otp) return otp;

//     } catch (err: any) {
//       console.log(`Attempt ${i + 1} failed: ${err.message}`);
//     }

//     await new Promise(res => setTimeout(res, delay));
//   }

//   throw new Error("OTP not received after all retries");
// }

import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { MAIL, MAILAPPKEY, Host } from '../utils/test-data'

export async function getOTP(triggerTime: number): Promise<string> {
  const client = new ImapFlow({
    host: Host,
    port: 993,
    secure: true,
    auth: { user: MAIL, pass: MAILAPPKEY },
    logger: false
  })
  await client.connect()
  const lock = await client.getMailboxLock('INBOX')
  try {
    const rawUids = await client.search({ seen: false, since: new Date(triggerTime) }) as number[]
    if (!rawUids || rawUids.length === 0) throw new Error('No recent emails')
    const uids = rawUids.slice(-10)
    let otp: string | null = null
    for await (const msg of client.fetch(uids, { uid: true, envelope: true, source: true }) as any) {
      const from = (msg.envelope?.from?.[0]?.address || '').toLowerCase()
      if (from !== 'b1hub@blazeautomation.com') continue
      const parsed: any = await simpleParser(msg.source)
      const body = parsed.text || parsed.html || ''
      const match = body.match(/\b\d{6}\b/)
      if (match) otp = match[0]
    }
    if (!otp) throw new Error('OTP not found')
    return otp
  } finally {
    lock.release()
    await client.logout()
  }
}

export async function getOTPWithRetry(triggerTime: number, retries = 15, delay = 3000): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const otp = await getOTP(triggerTime)
      if (otp) return otp
    } catch {}
    await new Promise(r => setTimeout(r, delay))
  }
  throw new Error('OTP not received')
}