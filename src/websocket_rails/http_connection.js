
/*
 HTTP Interface for the WebSocketRails client.
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  WebSocketRails.HttpConnection = (function(_super) {
    __extends(HttpConnection, _super);

    HttpConnection.prototype.connection_type = 'http';

    HttpConnection.prototype._httpFactories = function() {
      return [
        function() {
          return new XDomainRequest();
        }, function() {
          return new XMLHttpRequest();
        }, function() {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, function() {
          return new ActiveXObject("Msxml3.XMLHTTP");
        }, function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }
      ];
    };

    function HttpConnection(url, dispatcher) {
      var e;
      this.dispatcher = dispatcher;
      HttpConnection.__super__.constructor.apply(this, arguments);
      this._url = "http://" + url;
      this._conn = this._createXMLHttpObject();
      this.last_pos = 0;
      try {
        this._conn.onreadystatechange = (function(_this) {
          return function() {
            return _this._parse_stream();
          };
        })(this);
        this._conn.addEventListener("load", this.on_close, false);
      } catch (_error) {
        e = _error;
        this._conn.onprogress = (function(_this) {
          return function() {
            return _this._parse_stream();
          };
        })(this);
        this._conn.onload = this.on_close;
        this._conn.readyState = 3;
      }
      this._conn.open("GET", this._url, true);
      this._conn.send();
    }

    HttpConnection.prototype.close = function() {
      return this._conn.abort();
    };

    HttpConnection.prototype.send_event = function(event) {
      HttpConnection.__super__.send_event.apply(this, arguments);
      return this._post_data(event.serialize());
    };

    HttpConnection.prototype._post_data = function(payload) {
      return $.ajax(this._url, {
        type: 'POST',
        data: {
          client_id: this.connection_id,
          data: payload
        },
        success: function() {}
      });
    };

    HttpConnection.prototype._createXMLHttpObject = function() {
      var e, factories, factory, xmlhttp, _i, _len;
      xmlhttp = false;
      factories = this._httpFactories();
      for (_i = 0, _len = factories.length; _i < _len; _i++) {
        factory = factories[_i];
        try {
          xmlhttp = factory();
        } catch (_error) {
          e = _error;
          continue;
        }
        break;
      }
      return xmlhttp;
    };

    HttpConnection.prototype._parse_stream = function() {
      var data, e, event_data;
      if (this._conn.readyState === 3) {
        data = this._conn.responseText.substring(this.last_pos);
        this.last_pos = this._conn.responseText.length;
        data = data.replace(/\]\]\[\[/g, "],[");
        try {
          event_data = JSON.parse(data);
          return this.on_message(event_data);
        } catch (_error) {
          e = _error;
        }
      }
    };

    return HttpConnection;

  })(WebSocketRails.AbstractConnection);

}).call(this);
