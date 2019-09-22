root = File.expand_path('./lib', File.dirname(__FILE__))
$: << root

require 'backend_api_controller.rb'
run BackendApiController
