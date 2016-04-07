var globalVariables = {
  botName: 'AllanBot',
  botNameLowerCase: 'allanbot',
  botID: 0,
  botNameLength: 9
};

function set(key, value) {
  globalVariables[key] = value;
}

function get(key) {
  return globalVariables[key];
}

module.exports = {
  set: set,
  get: get
}
