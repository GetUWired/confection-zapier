const authentication = require('./authentication');
const newLeadsTrigger = require('./triggers/new_updated_leads.js');
const getUuidDetailsCreate = require('./creates/get_uuid_details.js');

const createGetRelatedUuidsJs = require("./creates/get_related_uuids_js");

const getNewEvent = require("./triggers/new_event");

const getNewFieldValue = require("./triggers/new_field_value");

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  triggers: {
    [newLeadsTrigger.key]: newLeadsTrigger,
    [getNewEvent.key]: getNewEvent,
    [getNewFieldValue.key]: getNewFieldValue
  },
  authentication: authentication,
  creates: {
    [getUuidDetailsCreate.key]: getUuidDetailsCreate,
    [createGetRelatedUuidsJs.key]: createGetRelatedUuidsJs
  },
};
