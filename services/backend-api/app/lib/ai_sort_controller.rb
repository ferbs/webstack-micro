require 'sinatra/base'
require "sinatra/namespace"
require "sinatra/json"
require "sinatra/reloader" if ENV["RUBY_ENV"] == 'development'
require 'json'
require 'logger'
require 'support/token_generator'
require 'support/request_env.rb'
require 'support/redis_support.rb'
require 'support/ai_sort_support.rb'
require 'support/shared_constants_support.rb'
require 'support/rabbitmq_support.rb'


class AiSortController < Sinatra::Base
  register Sinatra::Namespace
  helpers RequestEnv


  configure do
    set :logging, true
    register Sinatra::Reloader if ENV["RUBY_ENV"] == 'development'
  end


  namespace '/api/v1/artificial_intelligence' do

    # POST /api/v1/artificial_intelligence/background_sort with json { elements: ____ }
    post '/background_sort' do
      unless csrf_token_confirmed?
        logger.info "InvalidCsrfToken for auth_user_id #{best_auth_user_id}"
        logger.error "Frontend might not be sending csrf token on first login. (Refresh page and try again?) Haven't had a chance to look into it--that code isn't being used in a real project."
        halt 400, json(errorCode: 'InvalidCsrfToken')
      end
      json_payload = request.body.read
      halt 422, json(errorCode: 'MaxSizeExceeded') unless json_payload.length <= max_body_size
      payload = JSON.parse(json_payload) rescue {}

      job_id, elements = payload.values_at('jobId', 'elements')
      if !elements || !elements.is_a?(Array) || elements.length > max_elements
        res = { errorCode: 'InvalidElementsArray', message: "Expecting payload to include an 'elements' array with #{max_elements} or fewer items" }
      else
        submitted = submit_job_to_worker(auth_user_id: best_auth_user_id, elements: elements, job_id: job_id)
        if submitted
          res = { status: 'working' }
        else
          res = { errorCode: 'DisconnectedFromMessageBroker' }
        end
      end
      res['jobId'] = job_id
      json res
    end

    get '/current' do
      result_json = redis.get(AiSortSupport.latest_user_result_redis_key(best_auth_user_id))
      result = JSON.parse(result_json) if result_json rescue nil
      json(type: SharedConstantsSupport.ai_sort_client_commands['UpdateList'],
           sortedList: result)
    end
  end

  def submit_job_to_worker(payload)
    puts "AiSortController submitting job '#{payload[:job_id]}' to background worker queue '#{worker_queue_name}'"
    rabbitmq_pool.with do |rmq|
      rmq.default_exchange.publish(payload.to_json, routing_key: worker_queue_name)
    end
    true
  end

  def max_body_size
    8000
  end

  def max_elements
    200
  end

  def worker_queue_name
    SharedConstantsSupport.ai_sort_background_worker_queue
  end

  def rabbitmq_pool
    RabbitmqSupport.rabbitmq_channel_pool
  end

  def redis
    RedisSupport.redis_connection
  end

end