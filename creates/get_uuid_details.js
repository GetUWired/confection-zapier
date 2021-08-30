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
    sample: {
      uuid: "02000201-0e13-4e08-a409-31561ba98a1a",
      created_time: 1630333154,
      ip: {
        1630333154: "11.11.111.111"
      },
      browser: "Chrome 92.0 MacOSX Desktop",
      email: ["test@test.com"],
      fields: [
        {
          name: "A field name",
          value: "A field value",
          time: 1630333185
        },
        {
          name: "Another field name",
          value: "Another field value",
          time: 1630333185
        }
      ],
      events: [
        {
          name: "loadtime",
          value: 5.553,
          time: 1630333185
        },
        {
          name: "pageviewBatch",
          value: '{"url":"https:\/\/app.letsgoconvert.com\/nevis-mango-festival\/","language":"en-US","device":"desktop","browser":"Chrome 92.0 MacOSX Desktop"}',
          time: 1630333185
        }
      ],
    },
  },
  key: 'get_UUID_details',
  noun: 'UUID',
  display: {
    label: 'Retrieve Full Details of UUID',
    description: 'This action will retrieve the full details of a specified UUID.',
    hidden: false,
    important: true,
  },
};
