
/*
WebsocketRails JavaScript Client

Setting up the dispatcher:
  var dispatcher = new WebSocketRails('localhost:3000/websocket');
  dispatcher.on_open = function() {
    // trigger a server event immediately after opening connection
    dispatcher.trigger('new_user',{user_name: 'guest'});
  })

Triggering a new event on the server
  dispatcherer.trigger('event_name',object_to_be_serialized_to_json);

Listening for new events from the server
  dispatcher.bind('event_name', function(data) {
    console.log(data.user_name);
  });

Stop listening for new events from the server
  dispatcher.unbind('event')
 */

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.WebSocketRails = (function() {
    function WebSocketRails(url, use_websockets) {
      this.url = url;
      this.use_websockets = use_websockets != null ? use_websockets : true;
      this.connection_stale = __bind(this.connection_stale, this);
      this.supports_websockets = __bind(this.supports_websockets, this);
      this.dispatch_channel = __bind(this.dispatch_channel, this);
      this.unsubscribe = __bind(this.unsubscribe, this);
      this.subscribe_private = __bind(this.subscribe_private, this);
      this.subscribe = __bind(this.subscribe, this);
      this.dispatch = __bind(this.dispatch, this);
      this.trigger_event = __bind(this.trigger_event, this);
      this.trigger = __bind(this.trigger, this);
      this.bind = __bind(this.bind, this);
      this.connection_established = __bind(this.connection_established, this);
      this.new_message = __bind(this.new_message, this);
      this.reconnect = __bind(this.reconnect, this);
      this.callbacks = {};
      this.channels = {};
      this.queue = {};
      this.connect();
    }

    WebSocketRails.prototype.connect = function() {
      this.state = 'connecting';
      if (!(this.supports_websockets() && this.use_websockets)) {
        this._conn = new WebSocketRails.HttpConnection(this.url, this);
      } else {
        this._conn = new WebSocketRails.WebSocketConnection(this.url, this);
      }
      return this._conn.new_message = this.new_message;
    };

    WebSocketRails.prototype.disconnect = function() {
      if (this._conn) {
        this._conn.close();
        delete this._conn._conn;
        delete this._conn;
      }
      return this.state = 'disconnected';
    };

    WebSocketRails.prototype.reconnect = function() {
      var event, id, old_connection_id, _ref, _ref1;
      old_connection_id = (_ref = this._conn) != null ? _ref.connection_id : void 0;
      this.disconnect();
      this.connect();
      _ref1 = this.queue;
      for (id in _ref1) {
        event = _ref1[id];
        if (event.connection_id === old_connection_id && !event.is_result()) {
          this.trigger_event(event);
        }
      }
      return this.reconnect_channels();
    };

    WebSocketRails.prototype.new_message = function(data) {
      var event, _ref;
      event = new WebSocketRails.Event(data);
      if (event.is_result()) {
        if ((_ref = this.queue[event.id]) != null) {
          _ref.run_callbacks(event.success, event.data);
        }
        this.queue[event.id] = null;
      } else if (event.is_channel()) {
        this.dispatch_channel(event);
      } else {
        this.dispatch(event);
      }
      if (this.state === 'connecting' && event.name === 'client_connected') {
        return this.connection_established(event);
      }
    };

    WebSocketRails.prototype.connection_established = function(event) {
      this.state = 'connected';
      this._conn.setConnectionId(event.connection_id);
      this._conn.flush_queue();
      if (this.on_open != null) {
        return this.on_open(event.data);
      }
    };

    WebSocketRails.prototype.bind = function(event_name, callback) {
      var _base;
      if ((_base = this.callbacks)[event_name] == null) {
        _base[event_name] = [];
      }
      return this.callbacks[event_name].push(callback);
    };

    WebSocketRails.prototype.trigger = function(event_name, data, success_callback, failure_callback) {
      var event;
      event = new WebSocketRails.Event([
        event_name, data, {
          connection_id: this.connection_id
        }
      ], success_callback, failure_callback);
      this.queue[event.id] = event;
      return this._conn.trigger(event);
    };

    WebSocketRails.prototype.trigger_event = function(event) {
      var _base, _name;
      if ((_base = this.queue)[_name = event.id] == null) {
        _base[_name] = event;
      }
      this._conn.trigger(event);
      return event;
    };

    WebSocketRails.prototype.dispatch = function(event) {
      var callback, _i, _len, _ref, _results;
      if (this.callbacks[event.name] == null) {
        return;
      }
      _ref = this.callbacks[event.name];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback(event.data));
      }
      return _results;
    };

    WebSocketRails.prototype.subscribe = function(channel_name, success_callback, failure_callback) {
      var channel;
      if (this.channels[channel_name] == null) {
        channel = new WebSocketRails.Channel(channel_name, this, false, success_callback, failure_callback);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return this.channels[channel_name];
      }
    };

    WebSocketRails.prototype.subscribe_private = function(channel_name, success_callback, failure_callback) {
      var channel;
      if (this.channels[channel_name] == null) {
        channel = new WebSocketRails.Channel(channel_name, this, true, success_callback, failure_callback);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return this.channels[channel_name];
      }
    };

    WebSocketRails.prototype.unsubscribe = function(channel_name) {
      if (this.channels[channel_name] == null) {
        return;
      }
      this.channels[channel_name].destroy();
      return delete this.channels[channel_name];
    };

    WebSocketRails.prototype.dispatch_channel = function(event) {
      if (this.channels[event.channel] == null) {
        return;
      }
      return this.channels[event.channel].dispatch(event.name, event.data);
    };

    WebSocketRails.prototype.supports_websockets = function() {
      return typeof WebSocket === "function" || typeof WebSocket === "object";
    };

    WebSocketRails.prototype.connection_stale = function() {
      return this.state !== 'connected';
    };

    WebSocketRails.prototype.reconnect_channels = function() {
      var callbacks, channel, name, _ref, _results;
      _ref = this.channels;
      _results = [];
      for (name in _ref) {
        channel = _ref[name];
        callbacks = channel._callbacks;
        channel.destroy();
        delete this.channels[name];
        channel = channel.is_private ? this.subscribe_private(name) : this.subscribe(name);
        channel._callbacks = callbacks;
        _results.push(channel);
      }
      return _results;
    };

    return WebSocketRails;

  })();

}).call(this);
