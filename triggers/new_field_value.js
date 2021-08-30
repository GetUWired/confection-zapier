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
      const url = `https://transmission.confection.io/${bundle.authData.account_id}/leads/field/${bundle.inputData.triggerField}/between/${lastTimestamp}/${currentTime}/`
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
              output.push({ id: key, lead_data: data });
            }

            return output;

          });
        }; //end of else
      }); //end of z.request
    });//end of functions.cursor function

}//end of perform

module.exports = {
  key: 'new_field_value',
  noun: 'Lead',

  display: {
    label: 'New Lead',
    description: 'Triggers when a UUID is significant enough to be classified as a lead. You define the field of significance and if a UUID gets a value for this field, the zap will trigger.'
  },

  operation: {
    perform,
    canPaginate: true,
    type: 'polling',

    inputFields: [
      {
        key: 'triggerField',
        type: 'string',
        label: 'Field of Significance',
        helpText:
          "Define a field to be used to indicate that a UUID is significant enough to be a lead. You must enter the form input name which Confection uses as the api name of the field.",
        required: true,
        default: 'email',
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'helpText',
        type: 'copy',
        label: 'Help Text',
        helpText:
          "To learn more about how Confection manages fields, please visit [https://confection.io/quick-start/zapier](https://confection.io/quick-start/zapier)",
      }
    ],

    sample: {
      id: "02000201-0e19-4108-941a-79de9884fb1b-1629143044",
      lead_data: {
        "updated_time": "1629143044",
        "value": "This is the value of the field that triggered the Zap!",
        "history": ["Any historical values for the field will end up here!"],
        "UUID": "02000201-0e19-4108-941a-79de9884fb1b"
      }
    },

  }
};
