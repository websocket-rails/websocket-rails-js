
/*
WebSocket Interface for the WebSocketRails client.
 */

(function() {
  WebSocketRails.Connection = (function() {
    function Connection(url, dispatcher) {
      this.url = url;
      this.dispatcher = dispatcher;
      this.message_queue = [];
      this.state = 'connecting';
      this.connection_id;
      if (!(this.url.match(/^wss?:\/\//) || this.url.match(/^ws?:\/\//))) {
        if (window.location.protocol === 'https:') {
          this.url = "wss://" + this.url;
        } else {
          this.url = "ws://" + this.url;
        }
      }
      this._conn = new WebSocket(this.url);
      this._conn.onmessage = (function(_this) {
        return function(event) {
          var event_data;
          event_data = JSON.parse(event.data);
          return _this.on_message(event_data);
        };
      })(this);
      this._conn.onclose = (function(_this) {
        return function(event) {
          return _this.on_close(event);
        };
      })(this);
      this._conn.onerror = (function(_this) {
        return function(event) {
          return _this.on_error(event);
        };
      })(this);
    }

    Connection.prototype.on_message = function(event) {
      return this.dispatcher.new_message(event);
    };

    Connection.prototype.on_close = function(event) {
      var data;
      this.dispatcher.state = 'disconnected';
      data = (event != null ? event.data : void 0) ? event.data : event;
      return this.dispatcher.dispatch(new WebSocketRails.Event(['connection_closed', data]));
    };

    Connection.prototype.on_error = function(event) {
      this.dispatcher.state = 'disconnected';
      return this.dispatcher.dispatch(new WebSocketRails.Event(['connection_error', event.data]));
    };

    Connection.prototype.trigger = function(event) {
      if (this.dispatcher.state !== 'connected') {
        return this.message_queue.push(event);
      } else {
        return this.send_event(event);
      }
    };

    Connection.prototype.close = function() {
      return this._conn.close();
    };

    Connection.prototype.setConnectionId = function(connection_id) {
      return this.connection_id = connection_id;
    };

    Connection.prototype.send_event = function(event) {
      return this._conn.send(event.serialize());
    };

    Connection.prototype.flush_queue = function() {
      var event, _i, _len, _ref;
      _ref = this.message_queue;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        this.trigger(event);
      }
      return this.message_queue = [];
    };

    return Connection;

  })();

}).call(this);
