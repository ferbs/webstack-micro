require 'support/shared_constants_support.rb'


module AiSortSupport

  def self.silly_app_prefix
    SharedConstantsSupport.app_namespace_prefixes['SillyApp']
  end

  def self.latest_user_result_redis_key(auth_user_id)
    "#{self.silly_app_prefix}}:current:#{auth_user_id}"
  end

  def self.machine_learning_redis_key
    "#{self.silly_app_prefix}}:deep_knowledge"
  end
end
