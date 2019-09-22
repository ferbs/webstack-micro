
module RedisSupport

  # NOTE: needs a connection pool. See notes in rabbitmq_support.rb)
  # If you actually use Sinatra, you'll prob want to set up Rack middleware to manage it
  def self.redis_connection
    $redis_connection ||= Redis.new(host: 'redis-main')
  end
end

