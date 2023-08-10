/*
# Description

# Installation

1. Open Google Apps Script Editor
   - Visit the [Google Apps Script](https://script.google.com/home) homepage.
   - Click on `New Project` to start a new script.

2. Paste the Provided Code
   - Replace the current code in the editor with your provided code, ensuring correct indentation.

3. Save the Project
   - Click on the disk icon at the top left corner or select `File > Save`.
   - Give your project a relevant name like `UpdateCalendarEvents`.

4. Enable Google Calendar API
   - Visit the [Google Cloud Console](https://console.cloud.google.com).
   - Make sure you're in the correct project (the project ID should match what you noted earlier).
   - Navigate to `APIs & Services > Library`.
   - Search for `Google Calendar API` and enable it.

5. Set up Trigger
   - Back in the Google Apps Script editor, navigate to `Triggers` on the sidebar
   - Click on `create new trigger`
   - In `Choose which function to run`, select your function: `updateFutureEventsGuestsCanModify`.
   - In `Select event source`, choose `Time-driven`.
   - In `Select type of time based trigger`, select `Hours timer`.
   - In `Select hour interval`, choose `Every 6 hours`.
   - Under `Failure notification settings`, select your preference (suggested: `Daily`).
   - Click `Save`.

6. Authorize the Script
   - When prompted to authorize the script, click on `Review Permissions`.
   - Select your Google account and click `Allow`.

7. Done
   - Your script is now deployed as a time-driven trigger, running your function every 6 hours. Be sure to check your Logger Logs (`View > Logs`) periodically to verify that the script is operating as expected.

*/

var GUEST_EMAIL = 'partner@gmail.com';

function updateFutureEventsGuestsCanModify() {
  var calendar = CalendarApp.getDefaultCalendar();
  var calendarId = calendar.getId();
  var now = (new Date()).toISOString();

  var nextPageToken;
  var events;

  Logger.log("using default calendar: " + calendar.getName())

  do {
    events = Calendar.Events.list(calendarId, {
      timeMin: now,
      pageToken: nextPageToken,
      // maximum result size
      maxResults: 2500
    });

    for (var i = 0; i < events.items.length; i++) {
      var apiEvent = events.items[i];
      var attendees = apiEvent.getAttendees() || []

      if(apiEvent.organizer === undefined) {
        Logger.log('Undefined organizer for event: ' + apiEvent.summary);
        continue;
      } else {
        if (!apiEvent.organizer.self) {
          Logger.log('Event not updated: ' + apiEvent.summary + ', Current user is not the owner');
          continue;
        }
      }

      // Check if the guestEmail is in the attendee list
      var guestFound = attendees.some(function(attendee) {
        return attendee.email === GUEST_EMAIL;
      });

      if (!guestFound) {
        Logger.log('Event not updated: ' + apiEvent.summary + ', "' + GUEST_EMAIL + '" not found in the guest list');
        continue;
      }

      if (apiEvent.guestsCanModify) {
        Logger.log('Event not updated: ' + apiEvent.summary + ', Guests can already modify this event');
        continue;
      }

      apiEvent.guestsCanModify = true;
      Calendar.Events.update(apiEvent, calendarId, apiEvent.id);
      Logger.log('Updated event: ' + apiEvent.summary + ', Guests can now modify this event');
    }

    nextPageToken = events.nextPageToken;
  } while (nextPageToken);
}
