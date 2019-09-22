ENV['RACK_ENV'] = 'test'
require 'minitest/autorun'
require 'rack/test'
require 'minitest/spec'

project_root = File.expand_path('..', File.dirname(__FILE__))
lib_root = "#{project_root}/lib"
test_support = "#{project_root}/test/test_support"
$: << lib_root
$: << test_support
