require 'json'


module SharedConstantsSupport
  # "shared-constants" in project root is mounted in service container at /usr/local/shared-constants
  SharedConstantsDir = "/usr/local/shared-constants"
  RedisNamesPath = "#{SharedConstantsDir}/redis-names.json"
  ClientCommandsPath = "#{SharedConstantsDir}/client-commands.json"
  RabbitNamesPath = "#{SharedConstantsDir}/rabbit-names.json"


  def self.ai_sort_client_commands
    self.client_commands['AiSort']
  end

  def self.slidecast_client_commands
    self.client_commands['Slidecast']
  end

  def self.redis_background_push_channel
    self.redis_names['PubSubChannel']['BackgroundPush']
  end

  def self.ai_sort_background_worker_queue
    self.worker_queues['AiSort']
  end


  private

  def self.redis_names
    $redis_names ||= self.load_json(RedisNamesPath)
  end

  def self.client_commands
    $client_commands ||= self.load_json(ClientCommandsPath)
  end

  def self.rabbit_names
    $rabbit_names ||= self.load_json(RabbitNamesPath)
  end

  def self.app_namespace_prefixes
    self.redis_names['NamespacePrefix']
  end

  def self.worker_queues
    self.rabbit_names['WorkerQueue']
  end

  def self.load_json(path)
    json_from_file = File.read(path)
    JSON.parse(json_from_file)
  rescue => ex
    STDERR.puts "SEVERE: failed to load shared-constants file: #{path}"
  end


end

