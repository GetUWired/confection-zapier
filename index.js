const authentication = require('./authentication');
const newLeadsTrigger = require('./triggers/new_leads.js');
const getUuidDetailsCreate = require('./creates/get_uuid_details.js');

const createGetRelatedUuidsJs = require("./creates/get_related_uuids_js");

const getNewEvent = require("./triggers/new_event");

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  triggers: {
    [newLeadsTrigger.key]: newLeadsTrigger,
    [getNewEvent.key]: getNewEvent
  },
  authentication: authentication,
  creates: {
    [getUuidDetailsCreate.key]: getUuidDetailsCreate,
    [createGetRelatedUuidsJs.key]: createGetRelatedUuidsJs
  },
};
