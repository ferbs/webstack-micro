
module RequestEnv
  # note: in rails, we might define a "current_user" method, using email address to return the associated user model. Eg: Email.find(request.env['HTTP_X_AUTH_EMAIL']).try(:user)
  def auth_user
    request.env['HTTP_X_AUTH_USER'] # ruby rack prepends HTTP_ and upcases request headers
  end

  def auth_email
    request.env['HTTP_X_AUTH_EMAIL']
  end

  # the expected/correct token value stored in the passportjs-auth session
  def auth_csrf_token
    request.env['HTTP_X_AUTH_CSRF']
  end

  # the token sent by the browser
  def submitted_csrf_token
    request.env['HTTP_X_CSRF_TOKEN'] || params['csrf_token']
  end

  def auth_guest_id
    request.env['HTTP_X_AUTH_GUEST']
  end

  def best_auth_user_id
    auth_user.nil? || auth_user.length == 0 ? auth_guest_id : auth_user
  end

  def csrf_token_confirmed?
    token = submitted_csrf_token
    token && token == auth_csrf_token
  end

  def all_request_headers # without the http_ prefix
    env.inject({}){|acc, (k,v)| acc[$1.downcase] = v if k =~ /^http_(.*)/i; acc}
  end

end

