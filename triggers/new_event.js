const moment = require("moment");
const functions = require("../functions");

const perform = (z, bundle) => {

  let currentTime = moment().unix();

  //load last time zap ran or set to last 15 min if it hasn't run before
  return functions.cursor(z, bundle, currentTime)
    .then((lastTimestamp) => {

      if (!lastTimestamp)
        lastTimestamp = currentTime - 900;
      //options for request, use zapier endpoint to hit between last time and now.
      const url = `https://transmission.confection.io/${bundle.authData.account_id}/leads/event/${bundle.inputData.eventName}/between/${lastTimestamp}/${currentTime}/`
      //url = url + `/between/${lastTimestamp}/${currentTime}`;
      const options = {
        url: url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: {
          key: bundle.authData.secret_key,
        },
      };

      //Main request to retrieve data
      return z.request(options).then((response) => {
        response.throwForStatus();
        const results = response.json;

        //if no results returned, return an empty array
        if (results.results_number == 0)
          return []
        else {
          let pageCount = Math.ceil(results.results_number / 50); //determine number of pages
          var output = []; //define final output

          //load all pages or return first page if just 1 page of results
          let allResultsPromise = functions.pagination(z, bundle, pageCount, results.collection, url);

          return allResultsPromise.then((allResults) => {

            for (const [key, value] of Object.entries(allResults)) {
              var data = value;
              data.UUID = key;
              var id = key + "-" + data.updated_time
              output.push({ id: id, event_data: data });
            }

            return output;

          });
        }; //end of else
      }); //end of z.request
    });//end of functions.cursor function

}//end of perform

module.exports = {
  key: 'new_event',
  noun: 'Event',

  display: {
    label: 'New Event',
    description: 'Triggers when any UUID receives a value for a defined event name. The latest value as well a history of all values ever received for that event name will be returned.'
  },

  operation: {
    perform,
    canPaginate: true,
    type: 'polling',
    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    inputFields: [
      {
        key: 'eventName',
        type: 'string',
        label: 'Event Name',
        helpText:
          "Provide the event name to watch. All accounts have 'loadtime' & 'pageviewBatch' events by default.",
        required: true,
        placeholder: 'pageviewBatch',
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'helpText',
        type: 'copy',
        label: 'Help Text',
        helpText:
          "To learn more about sending custom events, please visit [https://confection.io/quick-start/zapier](https://confection.io/quick-start/zapier)",
      }
    ],

    sample: {
      "id": "02000201-0e19-4108-941a-79de9884fb1b-1629143044",
      "event_data": {
        "updated_time": "1629143044",
        "value":
          { "url": "https:\/\/zapier.com", "language": "en-US", "device": "desktop", "browser": "Chrome 92.0 MacOSX Desktop" },
        "history": {
          "1":
            { "url": "https:\/\/zapier.com", "language": "en-US", "device": "desktop", "browser": "Chrome 92.0 MacOSX Desktop" }
        },
        "UUID": "02000201-0e19-4108-941a-79de9884fb1b"
      }

    },
  }
};
