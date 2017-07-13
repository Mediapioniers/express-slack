const client = require('./client');

class Bot {
  /**
   * Constructor
   *
   * @param {object} auth - The team's oauth info
   * @param {object} ws - The websocket connection for the RTM messaging
   * @param {object} payload - The message payload to use for context
   */
  constructor(auth, ws, payload) {
    this.token = auth.bot ? auth.bot.bot_access_token : auth.access_token;
    this.client = client.create({ token: this.token });
    this.ws = ws;
    this.payload = payload;
  }

  /**
   * Public Reply
   *
   * @param {object} message - The message to reply with
   * @param {boolean} ephemeral - Flag to make the message ephemeral (default to false)
   */
  reply(message, ephemeral) {
    let {response_url, channel_id, channel} = this.payload;
    if (typeof(message) === 'string') message = { text: message };

    if (ephemeral) {
      if (response_url) return this.send(response_url, message);
      else console.error("Can't send a private message without a response_url");
    }
    else if (channel_id || channel) {
      if (channel) channel_id = channel.id;
      message.channel = channel_id;
      return this.send(message);
    }
  }

  /**
   * Private Reply
   *
   * @param {object} message - The message to reply with
   */
  replyPrivate(message) {
    return this.reply(message, true);
  }

  /**
   * Send Message
   *
   * @param {object} message - The message to post
   */
  say(message) {
    return this.send(message);
  }

  /**
   * Send data to Slack's API
   *
   * @param {string} endPoint - The method name or url (optional - defaults to chat.postMessage)
   * @param {object} args - The JSON payload to send
   * @return {Promise} A promise with the API result
   */
  send(...args) {
    return this.client.send(...args);
  }

  /**
   * Display that the bot is typing
   *
   * @return {Promise} A promise with the RTM result
   */
  typing() {
    let {channel_id, channel} = this.payload;

    if (channel) {
      channel_id = channel.id || channel;
    }

    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({
        "id": (new Date()).getTime(),
        "type": "typing",
        "channel": channel_id
      }), null, (err, result) => {
        if(err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }
}

module.exports = Bot;
