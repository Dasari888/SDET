// import { google } from 'googleapis';npm install googleapis
import * as googleapis from 'googleapis';
const google = googleapis.google;
import path from 'path';

async function getVerificationCode() {
  try {
    const auth = new google.auth.GoogleAuth({
      // Adjust this path if your JSON file is named differently
      keyFile: path.join(__dirname, 'service-account.json'), 
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    
    const gmail = google.gmail({ version: 'v1', auth });

    console.log("Checking for Google Verification email...");

    // userId: 'me' refers to the service account itself
    const res = await gmail.users.messages.list({ userId: 'me' });
    const messages = res.data.messages;

    if (!messages || messages.length === 0) {
      console.log("---------------------------------------------------------");
      console.log("No messages found yet.");
      console.log("1. Did you click 'Add forwarding address' in Gmail settings?");
      console.log("2. Wait 20 seconds and run this script again.");
      console.log("---------------------------------------------------------");
      return;
    }

    const msg = await gmail.users.messages.get({ userId: 'me', id: messages[0].id! });
    
    console.log("\n--- MESSAGE RECEIVED ---");
    console.log("Subject:", msg.data.snippet);
    console.log("------------------------\n");
    console.log("Look for the 9-digit code in the snippet above.");
    console.log("Example: '123456789 is the confirmation code for...'");
    
  } catch (error) {
   if (error instanceof Error) {
    console.error("Error connecting to Google:", error.message);
} else {
    console.error("Error connecting to Google:", error);
}
  }
}

getVerificationCode();