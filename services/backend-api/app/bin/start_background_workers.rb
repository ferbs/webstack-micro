#!/usr/bin/env ruby
require 'bundler/setup'
root = File.expand_path('../lib', File.dirname(__FILE__))
$: << root
require 'sneakers/runner'
require 'logger'
require 'workers/ai_sort_worker'
require 'json'

# I don't see a graceful way for the Bunny lib to wait for the broker to start. So using http request for liveliness check:
def await_live_rabbitmq_broker(opts)
  user, pass, management_host, max_tries, interval_secs = opts.values_at(:user, :pass, :management_host, :max_tries, :interval_secs)
  alive = false
  cmd = "wget -O - http://#{user}:#{pass}@#{management_host}/api/whoami"
  max_tries.times do
    puts "Background-worker checking RabbitMQ Broker liveliness with a request to http://#{management_host}/api/whoami"
    resp_json = %x(#{cmd}) rescue nil
    resp_data = JSON.parse(resp_json) rescue nil
    if resp_data && resp_data['name'] == user
      puts "RabbitMQ Broker is awake! #{resp_json}"
      alive = true
      break
    else
      puts "RabbitMQ Broker not yet awake. Will try again in #{interval_secs} seconds."
      sleep interval_secs
    end
  end
  alive
end

user = ENV['RABBITMQ_DEFAULT_USER'] || 'guest'
pass = ENV['RABBITMQ_DEFAULT_PASS'] || 'guest'

max_tries = 30
interval_secs = 5

if await_live_rabbitmq_broker(user: user,
                              pass: pass,
                              management_host: "rabbitmq-broker:15672",
                              max_tries: max_tries,
                              interval_secs: interval_secs)
  connection = Bunny.new("amqp://rabbitmq-broker:5672",
                         vhost: '/',
                         heartbeat: 30,
                         network_recovery_interval: 8.0, # seconds?
                         # logger: Sneakers::logger
                         user: user,
                         pass: pass)
  # note: see Sneakers.configure defaults in gem: sneakers-2.11.0/lib/sneakers/configuration.rb
  Sneakers.configure(connection: connection,
                     start_worker_delay: 0.8)
  Sneakers.logger.level = Logger::WARN

  r = Sneakers::Runner.new([ AiSortWorker ])
  r.run
else
  STDERR.puts "Background worker unable to connect to worker in #{max_tries * interval_secs} seconds. Note: expecting user '#{user}' is able to make http request to RabbitMQ management API: http://rabbitmq-broker:15672/api/whoami"
end
