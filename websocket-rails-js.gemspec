# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'websocket_rails/js/version'

Gem::Specification.new do |spec|
  spec.name          = "websocket-rails-js"
  spec.version       = WebsocketRails::Js::VERSION
  spec.authors       = ["Dan Knox", "Rory Low"]
  spec.email         = ["dknox@threedotloft.com"]
  spec.summary       = %q{JavaScript client for websocket-rails.}
  spec.description   = %q{JavaScript client for websocket-rails.}
  spec.homepage      = "http://websocket-rails.github.io"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "rails"

  spec.add_development_dependency "bundler", "~> 1.5"
  spec.add_development_dependency "rake"
end
