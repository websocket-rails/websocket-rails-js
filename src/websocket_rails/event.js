
/*
The Event object stores all the relevant event information.
 */

(function() {
  WebSocketRails.Event = (function() {
    function Event(message, success_callback, failure_callback) {
      var options;
      this.success_callback = success_callback;
      this.failure_callback = failure_callback;
      this.name = message[0];
      this.data = message[1];
      options = message[2];
      if (options != null) {
        this.id = options['id'] != null ? options['id'] : ((1 + Math.random()) * 0x10000) | 0;
        this.channel = options.channel;
        this.token = options.token;
        this.connection_id = options.connection_id;
        if (options.success != null) {
          this.result = true;
          this.success = options.success;
        }
      }
    }

    Event.prototype.is_channel = function() {
      return this.channel != null;
    };

    Event.prototype.is_result = function() {
      return typeof this.result !== 'undefined';
    };

    Event.prototype.is_ping = function() {
      return this.name === 'websocket_rails.ping';
    };

    Event.prototype.serialize = function() {
      return JSON.stringify([this.name, this.data, this.meta_data()]);
    };

    Event.prototype.meta_data = function() {
      return {
        id: this.id,
        connection_id: this.connection_id,
        channel: this.channel,
        token: this.token
      };
    };

    Event.prototype.run_callbacks = function(success, result) {
      this.success = success;
      this.result = result;
      if (this.success === true) {
        return typeof this.success_callback === "function" ? this.success_callback(this.result) : void 0;
      } else {
        return typeof this.failure_callback === "function" ? this.failure_callback(this.result) : void 0;
      }
    };

    return Event;

  })();

}).call(this);
