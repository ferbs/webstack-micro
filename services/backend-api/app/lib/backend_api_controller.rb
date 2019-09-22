require 'sinatra'
require 'sinatra/base'
require "sinatra/json"
require 'redis'
require 'bunny'
require 'ai_sort_controller.rb'
require 'slidecast_controller'


class BackendApiController < Sinatra::Base

  configure do
    set :server, "puma"
    set :port, 3000
    set :logging, true
  end

  use SlidecastController
  use AiSortController

  get '/api/status' do
    json( alive: true )
  end
end