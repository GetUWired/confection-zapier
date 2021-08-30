
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
    description: 'This action will retreive all UUIDs that have a likeness score of at least 50 (default) with the provided UUID. The likeness score can be customized in configuration.'
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
        default: "false",
        helpText: "If set to 'No', Zap exuction will be halted when no related UUIDs are found and any subsequent steps that rely on data from this step will not be run."
      },
    ],
    sample: {
      uuid: "02000201-0e13-4e08-a409-31561ba98a1a",
      created_time: 1630333154,
      ip: {
        1630333154: "11.11.111.111"
      },
      browser: "Chrome 92.0 MacOSX Desktop",
      email: ["test@test.com"],
      related: [
        { uuid: "02000201-0e19-4108-941a-79de9884fb1b", created_time: 1629995099, ip: { 1629995099: "11.11.111.111" }, browser: "Chrome 92.0 MacOSX Desktop", email: ["test@test.com", "test2@test.com"], likeness: 65 }
      ]
    }
  }
};
