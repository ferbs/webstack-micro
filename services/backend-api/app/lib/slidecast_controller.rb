require 'sinatra/base'
require "sinatra/namespace"
require "sinatra/json"
require 'json'
require 'models/slidecast_placeholder_model.rb'
require 'support/request_env.rb'
require 'support/shared_constants_support.rb'
require 'support/redis_support.rb'
require "sinatra/reloader" if ENV["RUBY_ENV"] == 'development'


class SlidecastController < Sinatra::Base
  register Sinatra::Namespace


  module ClientCommand
    @commands = SharedConstantsSupport.slidecast_client_commands
    ShowSlide = @commands['ShowSlide']
    End = @commands['End']
    ShowError = @commands['ShowError']
  end

  configure do
    register Sinatra::Reloader if ENV["RUBY_ENV"] == 'development'
    helpers RequestEnv
    helpers ModelPlaceholder
  end

  # todo: error codes to shared-constants

  namespace '/guest/api/v1/slidecasts' do
    # guests permitted to watch slidecasts
    get '/watch_current/:slidecast_id' do
      slidecast_id = params['slidecast_id']
      ndx = fetch_current_slide_ndx(slidecast_id) || -1
      header_info = fetch_header_info(slidecast_id)
      res = {
        type: ClientCommand::ShowSlide,
        title: header_info && header_info['title'],
      }
      if ndx >= 0
        markdown = fetch_markdown_for_slide(slidecast_id, ndx)
        if markdown
          res[:markdown] = markdown
        else
          res[:type] = ClientCommand::ShowError
          res[:errorCode] = 'SlidesNotFound'
        end
      end
      json res
    end

  end

  namespace '/api/v1/slidecasts' do

    get '/solo' do
      halt 403 unless auth_user
      slidecast_id = fetch_slidecast_id_for_user(auth_user)
      if slidecast_id
        res = fetch_full_slidecast(slidecast_id)
      else
        res = { slidecastId: nil }
      end
      json res
    end

    # in this limited demo, each user can only store a single slidecast and it is deleted after demo_slide_ttl_secs (12 hours at time of writing)
    post '/solo' do
      halt 403 unless auth_user
      halt 400 unless csrf_token_confirmed?
      slidecast_id = ensure_slidecast_id_for_user(auth_user)
      request.body.rewind
      posted_json = request.body.read
      if posted_json && posted_json.length > demo_slidecast_max_size
        res = { errorCode: 'MaxSizeExceeded' }
      else
        data = JSON.parse posted_json rescue halt(400, 'Expecting valid JSON')
        if !data || !data['slides']
          res = { errorCode: 'InvalidSlideContent' }
        else
          broadcast_slide(slidecast_id, nil, -1)
          res = upsert_header_info(slidecast_id, data['title'])
          res['slidecastId'] = slidecast_id
          save_slides(slidecast_id, data['slides'])
        end
      end
      json res
    end

    delete '/solo/rm' do
      halt 403 unless auth_user
      halt 400 unless csrf_token_confirmed?
      slidecast_id = fetch_slidecast_id_for_user(auth_user)
      delete_solo_slidecast_for_user(slidecast_id, auth_user) if slidecast_id
      broadcast_slide(slidecast_id, nil, -1)
      json(
        slidecastId: nil,
        title: nil,
        slides: nil)
    end

    put '/broadcast_slide/:ndx' do
      halt 403 unless auth_user
      halt 400 unless csrf_token_confirmed?
      ndx = (params['ndx'] || '-1').to_i rescue -1
      slidecast_id = fetch_slidecast_id_for_user(auth_user)
      markdown = fetch_markdown_for_slide(slidecast_id, ndx) if ndx >= 0
      ndx = -1 unless markdown
      save_current_slide_ndx(slidecast_id, ndx)
      broadcast_slide(slidecast_id, markdown, ndx)
      json( slidecastId: slidecast_id, nowShowing: ndx )
    end

  end

  def redis
    RedisSupport.redis_connection
  end

  def demo_slidecast_max_size
    10000
  end

  def broadcast(slidecast_id, payload)
    redis.publish(background_push_redis_channel, {
      pushToRoom: "slidecast:#{slidecast_id}",
      payload: payload
    }.to_json)
  end

  def broadcast_slide(slidecast_id, markdown, ndx)
    broadcast(slidecast_id, {
      type: ClientCommand::ShowSlide,
      markdown: markdown,
      nowShowing: ndx  # needed?
    })
  end

  def background_push_redis_channel
    SharedConstantsSupport.redis_background_push_channel
  end


end