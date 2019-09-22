require 'connection_pool'

module RabbitmqSupport

  def self.rabbitmq_channel_pool
    # note: size should correspond with the # of threads (thought I saw somewhere that Puma defaults to 4 maybe?)
    $bunny_channel_pool ||= ConnectionPool.new(size: 4) do |conn|
      self.bunny_connection.create_channel
    end
  end

  def self.bunny_connection
    if !$bunny || !$bunny.closed? || !$bunny.closing?
      $bunny = Bunny.new(host: 'rabbitmq-broker',
                         user: ENV['RABBITMQ_DEFAULT_USER'],
                         pass: ENV['RABBITMQ_DEFAULT_PASS'])
      $bunny.start
    end
  rescue => ex
    # this connection error handling is weak; maybe Bunny offers related features/help?
    STDERR.puts "Failed to connect to rabbitmq-broker: #{ex.message}"
    $bunny = nil
  end

end