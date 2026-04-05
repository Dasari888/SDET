import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { MAIL, MAILAPPKEY } from '../utils/test-data';

// export async function getOTP(): Promise<string> {
//   const config = {
//     imap: {
//        user: 'playtest567@gmail.com',
//     password: 'nsolsbzwjelmklrs',
//       host: 'imap.gmail.com',
//       port: 993,
//       tls: true,
//       authTimeout: 10000,
//       tlsOptions: {
//         rejectUnauthorized: false
//       }
//     }
//   };

//   console.log(" Connecting to Gmail...");

//   const connection = await imaps.connect(config);
//   await connection.openBox('INBOX');

//   //  wait for OTP mail
//   await new Promise(res => setTimeout(res, 5000));

//   const searchCriteria = ['ALL'];

//   const fetchOptions = {
//     bodies: ['HEADER', ''],   // IMPORTANT (full email)
//     markSeen: true
//   };

//   console.log(" Fetching emails...");

//   const messages = await connection.search(searchCriteria, fetchOptions);

//   console.log(" Total messages:", messages.length);

//   if (!messages.length) {
//     throw new Error(" No emails found");
//   }

//   // filter OTP emails
//   const filtered = messages.filter((msg: any) => {
//     const header = msg.parts.find((p: any) => p.which === 'HEADER');
//     const subject = header?.body?.subject?.[0] || '';

//     return subject.toLowerCase().includes('forgot') ||
//            subject.toLowerCase().includes('otp');
//   });

//   console.log(" OTP related emails:", filtered.length);

//   if (!filtered.length) {
//     throw new Error("No OTP email found");
//   }

//   //  get latest email (VERY IMPORTANT)
//   const latest = filtered.sort(
//     (a: any, b: any) =>
//       new Date(b.attributes.date).getTime() -
//       new Date(a.attributes.date).getTime()
//   )[0];

//   //  get full raw email body
//   const fullBodyPart = latest.parts.find((p: any) => p.which === '');

//   if (!fullBodyPart) {
//     throw new Error(" Full email body not found");
//   }

//   const parsed = await simpleParser(fullBodyPart.body);

//   //  combine all possible formats
//   const body =
//     parsed.text ||
//     parsed.html ||
//     parsed.textAsHtml ||
//     '';

//   console.log(" Email preview:", body.substring(0, 200));

//   //  extract OTP (robust)
//   const otpMatch =
//     body.match(/OTP[^0-9]*(\d{4,6})/i) ||
//     body.match(/\b\d{6}\b/);

//   if (!otpMatch) {
//     throw new Error(" OTP not found in email");
//   }

//   const otp = otpMatch[1] || otpMatch[0];

//   console.log(" OTP Extracted:", otp);

//   connection.end();

//   return otp;
// }

// // //  Runner
// // (async () => {
// //   try {
// //     const otp = await getOTP();
// //     console.log(" FINAL OTP:", otp);
// //   } catch (err) {
// //     console.error(" ERROR:", err);
// //   }
// // })();




// export async function getOTPWithRetry(retries = 5, delay = 5000): Promise<string> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const otp = await getOTP();
//       if (otp) return otp;
//     } catch (err) {
//       console.log(`Retry ${i + 1}...`);
//     }
//     await new Promise(res => setTimeout(res, delay));
//   }
//   throw new Error("OTP not received after retries");
// }


 const config = {
    imap: {
       user: 'playtest567@gmail.com',
    password: 'nsolsbzwjelmklrs',
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 10000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  };





// let lastUsedOtp: string | null = null;

// //  MAIN FUNCTION
// export async function getOTP(triggerTime: number): Promise<string> {
//   const connection = await imaps.connect(config);
//   await connection.openBox('INBOX');

//   console.log("Fetching emails...");

//   const searchCriteria = ['ALL'];

//   const fetchOptions = {
//     bodies: ['HEADER', ''], // full email
//     markSeen: false,        // don't mark as read
//   };

//   //Fetch only latest emails 
//   const messages = (await connection.search(searchCriteria, fetchOptions)).slice(-10);

//   console.log(" Total messages fetched:", messages.length);

//   if (!messages.length) {
//     connection.end();
//     throw new Error("No emails found");
//   }

//   //  FILTER: subject + AFTER trigger time
//   const filtered = messages.filter((msg: any) => {
//     const header = msg.parts.find((p: any) => p.which === 'HEADER');
//     const subject = header?.body?.subject?.[0] || '';

//     const emailTime = new Date(msg.attributes.date).getTime();

//     return (
//       (subject.toLowerCase().includes('otp') ||
//        subject.toLowerCase().includes('forgot')) &&
//       emailTime >= triggerTime
//     );
//   });

//   console.log(" OTP related (after trigger):", filtered.length);

//   if (!filtered.length) {
//     connection.end();
//     throw new Error("No fresh OTP email found");
//   }

//   // SORT latest first
//   const latest = filtered.sort(
//     (a: any, b: any) =>
//       new Date(b.attributes.date).getTime() -
//       new Date(a.attributes.date).getTime()
//   )[0];

//   //  Extract full body
//   const fullBodyPart = latest.parts.find((p: any) => p.which === '');

//   if (!fullBodyPart) {
//     connection.end();
//     throw new Error(" Full email body not found");
//   }

//   const parsed = await simpleParser(fullBodyPart.body);

//   const body =
//     parsed.text ||
//     parsed.html ||
//     parsed.textAsHtml ||
//     '';

//   console.log("Email preview:", body.substring(0, 200));

//   //  STRONG OTP REGEX
//   const otpMatch =
//     body.match(/(?:OTP|code)[^0-9]*(\d{4,6})/i) ||
//     body.match(/\b\d{6}\b/);

//   if (!otpMatch) {
//     connection.end();
//     throw new Error(" OTP not found in email");
//   }

//   const otp = otpMatch[1] || otpMatch[0];

//   //  Prevent duplicate OTP usage
//   if (otp === lastUsedOtp) {
//     connection.end();
//     throw new Error(" Duplicate OTP detected, retrying...");
//   }

//   lastUsedOtp = otp;

//   console.log(" OTP Extracted:", otp);

//   connection.end();

//   return otp;
// }



// export async function getOTPWithRetry(
//   triggerTime: number,
//   retries = 6,
//   delay = 5000
// ): Promise<string> {

//   for (let i = 0; i < retries; i++) {
//     try {
//       console.log(` Attempt ${i + 1}...`);

//       const otp = await getOTP(triggerTime);

//       if (otp) return otp;

//     } catch (err: any) {
//       console.log("Retry reason:", err.message);
//     }

//     await new Promise(res => setTimeout(res, delay));
//   }

//   throw new Error(" OTP not received after retries");
// }







let lastUsedOtp: string | null = null;
let lastUID: number | null = null;

// 🔹 MAIN FUNCTION
export async function getOTP(triggerTime: number): Promise<string> {
  const connection = await imaps.connect(config);

  try {
    await connection.openBox('INBOX');

    console.log("📩 Fetching emails...");

    // ⏱️ Add buffer to avoid missing delayed emails
    const sinceDate = new Date(triggerTime - 60000); // 1 min buffer

    const searchCriteria = [['SINCE', sinceDate]];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    console.log("📬 Total messages fetched:", messages.length);

    if (!messages.length) {
      throw new Error("No emails found");
    }

    // 🔹 Take last 20 emails for safety
    const recentMessages = messages.slice(-20);

    // 🔍 Filter relevant OTP emails
    const filtered = recentMessages.filter((msg: any) => {
      const uid = msg.attributes.uid;

      // 🚫 Skip already processed emails
      if (lastUID && uid <= lastUID) return false;

      const header = msg.parts.find((p: any) => p.which === 'HEADER');
      const subject = header?.body?.subject?.[0]?.toLowerCase() || '';

      return (
        subject.includes('otp') ||
        subject.includes('code') ||
        subject.includes('forgot')
      );
    });

    console.log("🎯 OTP candidate emails:", filtered.length);

    if (!filtered.length) {
      throw new Error("No OTP email found yet");
    }

    // 🔹 Sort latest first
    const latest = filtered.sort(
      (a: any, b: any) => b.attributes.uid - a.attributes.uid
    )[0];

    // 🔹 Save last processed UID
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

    console.log("📄 Email preview:", body.substring(0, 200));

    // 🔐 Strong OTP regex
    const otpMatch =
      body.match(/(?:OTP|code)[^0-9]*(\d{4,6})/i) ||
      body.match(/\b\d{6}\b/);

    if (!otpMatch) {
      throw new Error("OTP not found in email");
    }

    const otp = otpMatch[1] || otpMatch[0];

    // ⚠️ Allow duplicate OTP (some systems resend same OTP)
    if (otp === lastUsedOtp) {
      console.log("⚠️ Same OTP received again, accepting...");
    }

    lastUsedOtp = otp;

    console.log("✅ OTP Extracted:", otp);

    return otp;

  } finally {
    connection.end();
  }
}

// 🔁 RETRY WRAPPER (SMART RETRY)
export async function getOTPWithRetry(
  triggerTime: number,
  retries = 6,
  baseDelay = 4000
): Promise<string> {

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempt ${i + 1}...`);

      const otp = await getOTP(triggerTime);

      if (otp) return otp;

    } catch (err: any) {
      console.log("❌ Retry reason:", err.message);
    }

    // ⏳ Progressive delay (4s → 8s → 12s...)
    const waitTime = baseDelay * (i + 1);
    console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);

    await new Promise(res => setTimeout(res, waitTime));
  }

  throw new Error("❌ OTP not received after retries");
}