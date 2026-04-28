import { google } from 'googleapis';

// const credentials = {
//   client_id: '852275557912-jlrkpno4ca3j9irdfghj5db3840ofnr512l2g8.apps.googleusercontent.com',
//   client_secret: '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Q3j',
//   refresh_token: "1//0491Bf3MyaCMUCgYIARAAGAdfghjklQSNwF-L9Irw0hJq-r1g4Sk7OPUFM4jc8JU1ofvuUDEhrrU9m6DZRNg4u4BFwLGHAOfrVr-FupYkeQ"
// };

export async function getOTP(triggerTime: number): Promise<string> {
  const auth = new google.auth.OAuth2(credentials.client_id, credentials.client_secret);
  auth.setCredentials({ refresh_token: credentials.refresh_token });
  
  const gmail = google.gmail({ version: 'v1', auth });
  const seconds = Math.floor(triggerTime / 1000) - 10;

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: `from:b1hub@blazeautomation.com after:${seconds}`
  });

  const messageId = res.data.messages?.[0]?.id;
  if (!messageId) throw new Error("OTP email not found.");

  const msg = await gmail.users.messages.get({ userId: 'me', id: messageId });
  const otp = msg.data.snippet?.match(/\d{6}/);

  return otp ? otp[0] : "OTP not found in email";
}

// Temporary test - you can delete this after it works
// getOTP(Date.now() - 300000).then(otp => console.log("Current OTP in inbox:", otp)).catch(err => console.log("Note:", err.message));