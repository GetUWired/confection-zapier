
const perform = (z, bundle) => {

  var likeness = 50;
  if (bundle.inputData.likeness) {
    if (bundle.inputData.likeness > 50 && bundle.inputData.likeness <= 100) {
      likeness = bundle.inputData.likeness;
    } else if (bundle.inputData.likeness > 100) {
      likeness = 100;
    }
  }
  const options = {
    url: `https://transmission.confection.io/${bundle.authData.account_id}/${bundle.inputData.uuid}/related/${likeness}`,
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: {
      key: bundle.authData.secret_key,
    },
  };

  return z.request(options).then((response) => {
    response.throwForStatus();
    const results = response.json;

    if (results.related.length == 0 && bundle.inputData.stopExecution == "false") {
      throw new z.errors.HaltedError(`No related UUIDs with likeness score greater than or equal to ${likeness} were found.`)
    }

    return results;
  });
};

module.exports = {
  key: 'get_related_uuids_js',
  noun: 'Get_related_uuids.js',
  display: {
    label: 'Get All Related UUIDs',
    description: 'Will retreive all UUIDs that have a likeness score of at least 50 with the provided UUID.'
  },

  operation: {
    perform,
    inputFields: [
      {
        key: 'uuid',
        label: 'UUID',
        type: 'string',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'likeness',
        label: 'Likeness Score',
        type: 'integer',
        required: false,
        list: false,
        altersDynamicFields: false,
        helpText: "Accepts values 50 to 100. 100 meaning only pull back records where we are certain the UUIDs are the same record"
      },
      {
        key: 'stopExecution',
        label: 'Should this step be considered a success if no results are found?',
        type: 'string',
        required: false,
        list: false,
        choices: { true: "Yes", false: "No" },
        altersDynamicFields: false,
        default: "No",
        helpText: "If set to 'No', Zap exuction will be halted when no related UUIDs are found"
      },
    ],

  }
};
