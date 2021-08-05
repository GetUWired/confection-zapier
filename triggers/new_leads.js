const moment = require("moment");

//function to set the timestamp of the last time the zap was run. 
//Essentially like storing a cursor in pagination for a dropdown
const cursorFunction = async (z, bundle, timestamp) => {
  var cursor;
  cursor = await z.cursor.get();

  await z.cursor.set(`${timestamp}`);


  return cursor;
}

const getCustomField = (z, bundle) => {
  if (bundle.inputData.triggerField == "Use Custom Option")
    return [
      {
        key: 'customTriggerField',
        type: 'string',
        label: 'What field should we look out for?',
        helpText: 'For configuration assistance please see help docs.',
        required: true,
        list: false
      }
    ]
  else
    return []
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

            //main logic to search for if UUID is meaningful
            switch (bundle.inputData.triggerField) {
              case ('Use Custom Option'):

                for (const [key, value] of Object.entries(allResults)) {
                  if (value.fields.length > 0) {
                    var i = 0;
                    for (i; i < value.fields.length; i++) {
                      if (value.fields[i].name.toLowerCase() == bundle.inputData.customTriggerField.toLowerCase() && value.fields[i].value) {
                        var data = value;
                        data.UUID = key;
                        output.push({ id: key, leadData: data, "Custom Trigger Field Value": value.fields[i].value });
                        break; //break out of for loop if a lead meets the criteria
                      }
                    }//end of field check

                  }
                }//end of object.entries loop
                break;

              default: //default is email
                for (const [key, value] of Object.entries(allResults)) {
                  if (value.email) {
                    var data = value;
                    data.UUID = key;
                    output.push({ id: key, leadData: data });
                  }
                }
            }
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
    inputFields: [
      {
        key: 'triggerField',
        type: 'string',
        label: 'Field of significance',
        helpText:
          'Select the field of significance to look out for. The Zap will fire if a UUID has a value for this field.',
        default: 'Email',
        choices: ['Email', 'Use Custom Option'],
        required: false,
        list: false,
        altersDynamicFields: true,
      },
      getCustomField,
    ],

  },
  key: 'new_leads',
  noun: 'Lead',
  display: {
    label: 'New Lead',
    description:
      'Triggers when a UUID is significant enough to be classified as a lead.',
    hidden: false,
    important: true,
  },

};
