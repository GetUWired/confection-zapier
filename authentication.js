const testAuth = (z, bundle) => {
  const options = {
    url: `https://transmission.confection.io/${bundle.authData.account_id}/account`,
    method: 'POST',
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
  type: 'custom',
  test: testAuth,
  fields: [
    {
      key: 'description',
      required: false,
      type: 'copy',
      helpText: 'Your API information can be found by going to the API Keys section in your account https://dashboard.confection.io/my-keys/. If you don\'t have an account, visit https://dashboard.confection.io/register to set one up.'
    },
    {
      computed: false,
      key: 'account_id',
      required: true,
      label: 'Account Id',
      type: 'string',
    },
    {
      computed: false,
      key: 'secret_key',
      required: true,
      label: 'Secret Key',
      type: 'string',
    }
  ],
  customConfig: {},
  connectionLabel: 'Confection'
};
