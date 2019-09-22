module AuthHelper
  include Rack::Test::Methods


  def with_auth_header(auth_user=nil)
    header 'X-Auth-User', 'testlocal:someone'
  end

end