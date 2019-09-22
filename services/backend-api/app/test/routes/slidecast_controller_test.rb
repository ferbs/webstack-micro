require File.expand_path '../../test_helper.rb', __FILE__
require 'slidecast_controller.rb'
require 'auth_helper'
require 'support/redis_support.rb'

include Rack::Test::Methods
include AuthHelper

def app
  ::SlidecastController.new
end


describe "fetching slidecast" do
  # if for real, use a full MockRedis library or connect to a Redis test db
  class MockRedis
    def get(key)
      nil
    end
  end

  it "should require authentication" do
    get '/api/v1/slidecasts/solo'
    assert last_response.status == 403
  end


  it "should return empty slidecastId when not yet created" do
    with_auth_header
    RedisSupport.stub(:redis_connection, MockRedis.new) do
      get '/api/v1/slidecasts/solo'
    end
    assert last_response.ok?
    response = JSON.parse(last_response.body)
    assert response.has_key?('slidecastId')
    assert_nil(response['slidecastId'])
  end
end

