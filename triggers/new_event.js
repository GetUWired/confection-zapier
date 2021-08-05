// triggers on a new new_event with a certain tag
const perform = (z, bundle) => {

  const options = {
    url: `https://transmission.confection.io/${bundle.authData.account_id}/${bundle.inputData.uuid}/events/`,
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
    return [{ id: 1, results: results }];
  });
};

module.exports = {
  key: 'new_event',
  noun: 'Event',

  display: {
    label: 'New Event',
    description: 'Triggers when their is a new event on the provided UUID'
  },

  operation: {
    perform,

    // `inputFields` defines the fields a user could provide
    // Zapier will pass them in as `bundle.inputData` later. They're optional.
    inputFields: [
      {
        key: 'uuid',
        type: 'string',
        label: 'UUID',
        helpText:
          'Provide the UUID to watch for events.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],

    // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
    // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
    // returned records, and have obvious placeholder values that we can show to any user.
    sample: {
      "facebook-analytics-pageview": {
        "value": "https://google.com",
        "created_time": "1612405252",
        "history": []
      },
      "google-analytics-pageview": {
        "value": "https://google.com/search",
        "created_time": "1612405058",
        "history": {
          "1612405029": "https://google.com"
        }
      },
      "id": "20210204-0212-3442-4040-nhYrmqkTS427"
    },

  }
};
