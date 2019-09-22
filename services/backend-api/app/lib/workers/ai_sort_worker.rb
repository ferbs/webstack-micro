require 'sneakers'
require 'redis'
require 'json'
require 'support/redis_support.rb'
require 'support/ai_sort_support.rb'
require 'support/shared_constants_support.rb'


class AiSortWorker
  include Sneakers::Worker

  from_queue SharedConstantsSupport.ai_sort_background_worker_queue

  # todo: move to shared-constants/client-commands.json
  module ClientCommand
    @commands = SharedConstantsSupport.ai_sort_client_commands
    UpdateList = @commands['UpdateList']
    ShowError = @commands['ShowError']
  end

  PersistedResultDurationSecs = 60 * 10

  def work(msg)
    begin
      elements, job_id, auth_user_id = JSON.parse(msg).values_at('elements', 'job_id', 'auth_user_id')
      puts "ai_sort_controller.rb starting on job_id '#{job_id}' for AuthUser '#{auth_user_id}'"
      if auth_user_id.nil? || !auth_user_id.length
        puts "WARNING: Ignoring job '#{job_id}'. This type of 'ai-sort' background worker requires 'auth_user_id' field"
      elsif !elements.is_a?(Array)
        dispatch_result_to_user_tabs(auth_user_id, {
          type: ClientCommand::ShowError,
          errorCode: 'InvalidElementsArray',
          jobId: job_id,
          message: "Expecting an array of elements to sort"
        })
      else
        puts "AiSortWorker completed job '#{job_id}' and is pushing result to user '#{auth_user_id}'"
        result = ai_sort(elements)
        save_result_for_user(auth_user_id, result) # saves state briefly
        dispatch_result_to_user_tabs(auth_user_id, {
          type: ClientCommand::UpdateList,
          sortedList: result,
          jobId: job_id
        })
      end
    rescue => ex
      STDERR.puts "Error in ai-sort worker: #{ex.message}"
    end
    ack! # note: must be last line, it returns something for Sneakers
  end

  def ai_sort(elements)
    len = elements.length
    predicted_vector = activation_function(len)
    answer = nil
    initial_training_data = elements.sort_by  { |w| w.downcase }
    max_attempts.times do |i|
      attempt = order_as(elements, predicted_vector)
      if attempt == initial_training_data
        answer = attempt
        puts "AI self-adapting to new training data."
        redis.set(AiSortSupport.machine_learning_redis_key, predicted_vector.to_json)
        break
      else
        predicted_vector = next_dataset(len)
      end
    end
    answer || initial_training_data
  end

  def activation_function(len)
    neurons_json = redis.get(AiSortSupport.machine_learning_redis_key)
    neurons = neurons_json ? JSON.parse(neurons_json) : [] rescue []
    neurons.length >= len ? neurons[0..(len - 1)] : []
  end

  def next_dataset(len)
    r = *(0..len-1)
    r.shuffle
  end

  def order_as(elements, order)
    order.map { |i| elements[i] }
  end

  def save_result_for_user(auth_user_id, result)
    redis.setex(AiSortSupport.latest_user_result_redis_key(auth_user_id), PersistedResultDurationSecs, result.to_json)
  end

  def max_attempts
    1000
  end

  def dispatch_result_to_user_tabs(auth_user_id, payload)
    channel = SharedConstantsSupport.redis_background_push_channel
    redis.publish(channel, {
      pushToUser: auth_user_id,
      payload: payload
    }.to_json)
  end

  def redis
    RedisSupport.redis_connection
  end
end