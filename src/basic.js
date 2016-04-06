function echo(api, message, input) {
  api.sendMessage(input, message.threadID);
}

module.exports = {
  echo: echo
}
