const client = require('./client');

class Bot {
  /**
   * Constructor
   *
   * @param {object} auth - The team's oauth info
   * @param {object} payload - The message payload to use for context
   * @param {object} res - The original incoming response object
   */
  constructor(auth, payload, res) {
    this.token = auth.bot ? auth.bot.bot_access_token : auth.access_token;
    this.client = client.create({ token: this.token });
    this.payload = payload;
    this.res = res;
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
   * Data Response Message
   *
   * @param {object} data - The data to return in the response
   */
  data(data) {
    return this.res.send(data);
  }
}

module.exports = Bot;
