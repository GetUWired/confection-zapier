const perform = (z, bundle) => {
  const options = {
    url: `https://transmission.confection.io/${bundle.authData.account_id}/${bundle.inputData.uuid}/full`,
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

    // You can do any parsing you need for results here before returning them

    return results;
  });
};

module.exports = {
  operation: {
    perform: perform,
    inputFields: [
      {
        key: 'uuid',
        label: 'UUID',
        type: 'string',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
  },
  key: 'get_UUID_details',
  noun: 'UUID',
  display: {
    label: 'Retrieve Full Details of UUID',
    description: 'Retrieve the full details of a specified UUID',
    hidden: false,
    important: true,
  },
};
