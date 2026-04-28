const { google } = require('googleapis');
const path = require('path');

async function getVerificationCode() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'service-account.json'), 
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    const gmail = google.gmail({ version: 'v1', auth });

    console.log("Checking for Google Verification email...");
    const res = await gmail.users.messages.list({ userId: 'me' });
    
    if (!res.data.messages || res.data.messages.length === 0) {
      console.log("No messages found. Ensure you clicked 'Add Forwarding Address' in Gmail.");
      return;
    }

    const msg = await gmail.users.messages.get({ userId: 'me', id: res.data.messages[0].id });
    console.log("\n--- VERIFICATION SNIPPET ---");
    console.log(msg.data.snippet);
    console.log("----------------------------\n");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
getVerificationCode();