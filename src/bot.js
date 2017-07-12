const client = require('./client'),
      fs = require('fs'),
      path = require('path');

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
    if (message instanceof Error) message = { text: message.toString() };
    if (typeof(message) === 'string') message = { text: message };

    if (ephemeral) {
      if (response_url) return this.send(response_url, message);
      else console.error("Can't send a private message without a response_url");
    }
    else if (channel_id || channel) {
      if (channel) channel_id = channel.id || channel;
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
   * Upload a file as a response to an received message
   * Send a buffer, the file contents or a filepath
   *
   * @param {object} file - The file buffer or filepath to upload
   */
  replyFile(file) {
    let {channel_id, channel} = this.payload;

    if (typeof file === "string") {
      if (!fs.existsSync(file)) {
        file = {
          content: file
        }
      } else {
        file = {
          file: file
        }
      }
    } else if (file instanceof Buffer) {
      file = {
        file: file
      }
    }

    if (!file.filename) {
      file.filename = typeof file.file === "string" ? path.basename(file.file) : (new Date()).getTime()
    }
    if (channel) {
      channel_id = channel.id || channel;
    }
    file.channels = channel_id;

    return this.client.send('files.upload', file);
  }

  /**
   * Data Response Message
   *
   * @param {object} data - The data to return in the response
   */
  data(data) {
    return this.res.send(data);
  }

  /**
   * Get an uploaded file from a provided Slack URL
   *
   * @param {string} url - The private url to download the file from
   */
  getFile(url) {
    return this.client.get(url);
  }
}

module.exports = Bot;
