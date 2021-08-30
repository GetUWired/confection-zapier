const moment = require("moment");

//function to set the timestamp of the last time the zap was run. 
//Essentially like storing a cursor in pagination for a dropdown
const cursorFunction = async (z, bundle, timestamp) => {
  var cursor;
  cursor = await z.cursor.get();

  await z.cursor.set(`${timestamp}`);


  return cursor;
}

const perform = (z, bundle) => {

  //function to loop through pages and load all results. 
  //Function is called if initial results warrants fetching more pages. 
  async function loadAllLeads(z, bundle, pages, from, to, page_1) {

    var outputObject = page_1;

    //loop through page count, fetching each page of results and adding to outputObject
    for (counter = 2; counter <= pages; counter++) {
      var request = await fetch(`https://transmission.confection.io/${bundle.authData.account_id}/leads/between/${from}/${to}/page/${counter}`, {
        method: "POST",
        headers: {
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'key': bundle.authData.secret_key
        })
      });
      var data = await request.json();

      outputObject = Object.assign(outputObject, data.collection)

    }
    return outputObject;
  }

  //get current time
  let currentTime = moment().unix();

  //load last time zap ran or set to last 15 min if it hasn't run before
  return cursorFunction(z, bundle, currentTime)
    .then((lastTimestamp) => {

      if (!lastTimestamp)
        lastTimestamp = currentTime - 900;
      //options for request, use zapier endpoint to hit between last time and now.

      const options = {
        url: `https://transmission.confection.io/${bundle.authData.account_id}/leads/between/${lastTimestamp}/${currentTime}`,
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
          let allResultsPromise = loadAllLeads(z, bundle, pageCount, lastTimestamp, currentTime, results.collection);


          return allResultsPromise.then((allResults) => {

            for (const [key, value] of Object.entries(allResults)) {
              var data = value;
              var id = key + value.updated_time;
              data.UUID = key;
              output.push({ id: id, leadData: data });
            }//end of object.entries loop

            return output;
          });
        }
      });//end of initial request
    })
};

module.exports = {
  operation: {
    perform: perform,
    canPaginate: true,
    type: 'polling',
    sample: {
      id: "02000201-0e19-4108-941a-79de9884fb1b1630086386",
      leadData: {
        events: [
          {
            name: "pageviewBatch",
            value: { "url": "https:\/\/zapier.com", "language": "en-US", "device": "desktop", "browser": "Chrome 92.0 MacOSX Desktop" },
            time: 1630086307
          }
        ],
        fields: [
          {
            name: "email",
            value: "test@test.com",
            time: 1630086307
          }
        ],
        updated_time: 1630086386,
        UUID: "02000201-0e19-4108-941a-79de9884fb1b"
      }
    }
  },
  key: 'new_updated_leads',
  noun: 'Lead',
  display: {
    label: 'New or Updated UUID',
    description: "Triggers when any UUID is created or updated. To learn more about how Confection handles UUIDs, visit https://confection.io/main/demo/#uuid.",
    hidden: false,
  },

};