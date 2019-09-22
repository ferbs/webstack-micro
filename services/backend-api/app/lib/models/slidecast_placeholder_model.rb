require 'time'
require 'support/token_generator'
require 'support/shared_constants_support'


# NOTE: using Redis only because the example doesn't presume to know which database you'll actually use. (Redis is not a good choice for this.)
module ModelPlaceholder

  def fetch_current_slide_ndx(slidecast_id)
    redis.get(current_slide_redis_key(slidecast_id) || '-1').to_i
  end

  def fetch_markdown_for_slide(slidecast_id, ndx)
    return nil if !slidecast_id || !ndx
    redis.hget(slidecast_markdown_redis_key(slidecast_id), ndx)
  end

  def fetch_header_info(slidecast_id)
    safe_parse_json(redis.get(slidecast_header_redis_key(slidecast_id)), {})
  end

  def upsert_header_info(slidecast_id, title)
    redis_key = slidecast_header_redis_key(slidecast_id)
    header_info = {
      'title' => (title || 'My Slides')[0..64]
    }
    header_info['expiresAt'] = (Time.now + demo_slide_ttl_secs).strftime('%s%L').to_i
    redis.set(redis_key, header_info.to_json)
    redis.expire(redis_key, demo_slide_ttl_secs)
    header_info
  end

  def save_slides(slidecast_id, slides)
    return nil if !slidecast_id || !slides
    hkey = slidecast_markdown_redis_key(slidecast_id)
    redis.del hkey
    redis.pipelined do
      slides.each_index { |ndx| redis.hset(hkey, ndx, slides[ndx]) }
    end
    redis.expire(hkey, demo_slide_ttl_secs)
    save_current_slide_ndx(slidecast_id, -1)
  end

  def save_current_slide_ndx(slidecast_id, ndx)
    return nil if !slidecast_id || !ndx
    rkey = current_slide_redis_key(slidecast_id)
    redis.multi do
      redis.set(rkey, ndx.to_s)
      redis.expire(rkey, demo_slide_ttl_secs)
    end
  end

  def fetch_full_slidecast(slidecast_id) # slides, title, slides, expiresAt
    res = fetch_header_info(slidecast_id)
    if res && res['title']
      res['slidecastId'] = slidecast_id
      slides = redis.hgetall slidecast_markdown_redis_key(slidecast_id) || {}
      res['slides'] = Hash[slides.sort].values
      res['nowShowing'] = (fetch_current_slide_ndx(slidecast_id) || '-1').to_i
    end
    res
  end

  # holds slidecast_id associated with auth_id. Demo permits 1 slidecast per auth user
  def ensure_slidecast_id_for_user(auth_id)
    slidecast_id = fetch_slidecast_id_for_user(auth_id)
    unless slidecast_id
      slidecast_id = TokenGenerator.human(6)
      redis.set(solo_slidecast_id_for_user_redis_key(auth_id), slidecast_id)
    end
    slidecast_id
  end

  def fetch_slidecast_id_for_user(auth_id)
    redis.get solo_slidecast_id_for_user_redis_key(auth_id)
  end

  def delete_solo_slidecast_for_user(slidecast_id, auth_id)
    redis.multi do
      redis.del slidecast_markdown_redis_key(slidecast_id)
      redis.del slidecast_header_redis_key(slidecast_id)
      redis.del current_slide_redis_key(slidecast_id)
      redis.del solo_slidecast_id_for_user_redis_key(auth_id)
    end

  end

  def slidecast_markdown_redis_key(slidecast_id)
    return nil unless slidecast_id
    "#{redis_prefix}:#{slidecast_id}:markdown"
  end

  def slidecast_header_redis_key(slidecast_id)
    return nil unless slidecast_id
    "#{redis_prefix}:#{slidecast_id}:header"
  end

  def current_slide_redis_key(slidecast_id)
    return nil unless slidecast_id
    "#{redis_prefix}:#{slidecast_id}:cursor"
  end

  def solo_slidecast_id_for_user_redis_key(auth_id)
    return nil unless auth_id
    "#{redis_prefix}:user:#{auth_id}:solo"
  end

  def redis_prefix
    SharedConstantsSupport.app_namespace_prefixes['Slidecast']
  end


  def demo_slide_ttl_secs
    @demo_slide_ttl_secs ||= 60 * 60 * 36
  end

  def safe_parse_json(json_string, defaultVal=nil)
    return defaultVal unless json_string
    res = JSON.parse(json_string) rescue nil
    res || defaultVal
  end

end