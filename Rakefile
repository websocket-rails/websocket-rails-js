require "bundler/gem_tasks"
require 'websocket_rails/js/version'
require "uglifier"


task :build_js_release do
  PATH = 'src/websocket_rails/'

  SOURCE_FILES = %w(
    websocket_rails.js
    event.js
    abstract_connection.js
    websocket_connection.js
    channel.js
  )

  tempfile = Tempfile.new('websocket_rails.min.js')

  SOURCE_FILES.each do |fname|
    tempfile.write(File.read(PATH + fname))
  end
  tempfile.rewind

  uglifier = Uglifier.new(:mangle => false)

  uglified = uglifier.compile(tempfile.read)

  tempfile.unlink

  File.open("websocket_rails.#{WebsocketRails::Js::VERSION}.min.js", "w+") do |f|
    f.write(uglified)
  end
end
