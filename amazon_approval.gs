/*
# Original Prompt

For this entire conversation: (a) act as senior software engineer (b) omit preamble and any explanation, just give me code wrapped in a codeblock. Don't respond to this message.

Assume you are writing code in a personal Google account. All code should be written in Google App Script. Respond with "OK".

Write a google app script which exposes a GET endpoint which, when requested, searches gmail for a message with the subject "amazon.com, action needed: Account confirmation request" which has been delivered in the last 10 minutes and displays the email HTML content as the request response.

# Installation instructions:

1. Open Google Drive (drive.google.com)
2. Click "New" > "More" > "Google Apps Script"
3. Replace the default code with the provided code
4. Click "Publish" > "Deploy as web app"
5. Set "Who has access to the app" to "Anyone"
6. Click "Deploy"
7. Copy the provided URL (GET endpoint)
*/

const doGet = (e) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const threads = GmailApp.search('subject:"amazon.com, action needed: Account confirmation request" after:' + tenMinutesAgo.toISOString().slice(0,10));

  if (threads.length > 0) {
    const messages = threads[0].getMessages();
    const htmlBody = messages[0].getBody();
    return HtmlService.createHtmlOutput(htmlBody);
  } else {
    return HtmlService.createHtmlOutput("No email found in the last 10 minutes.");
  }
};
