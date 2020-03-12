# backend-api
 
This is a placeholder for your actual web app's back end server. 

The demo/example handles requests relating to the slidecast and background-push demos. It's a Ruby-based Sinatra app, started 
 as a web server using [Puma](https://github.com/puma/puma). 

Its code quality is poor overall, isn't tested, and is intended to be discarded. (After you read the tips below.) 


### Instructions / Tips  

A few points are worth mentioning: 

* user authentication has already been checked, your app should simply check for the presence of the "X-Auth-User" or "X-Auth-Email" 
 request headers. Or "X-Auth-Guest" if you configured *passportjs-auth* for non-user routes permitted to reach the backend. 
   * In your actual app, you would use these headers to find and return a User model. (Eg, in Rails, you would likely
      write a *current_user* method in a base controller.)
    * Ruby Rack prepends "HTTP_" and upcases request headers so the example demos check `request.env['HTTP_X_AUTH_USER']`. (See 
       `services/backend-api/app/lib/support/request_env.rb`, called from `lib/slidecast_controller.rb`) 
    * The slidecast demo permits non-authenticated guests to watch a slidecast. We configure Traefik to route requests starting
       with both `/api/` and `/guest/api/` to *backend-api*. (See `docker-compose.common.yml`.) In our *passportjs-auth* service,
       we include `/guest` as a *GuestPermittedResource*. (See `services/passportjs-auth/app/src/config.ts`) 

* Jobs are sent to background workers over RabbitMQ. See example in **ai_sort_controller.rb**. It enqueues the job with the
 Ruby-based [Bunny](https://github.com/ruby-amqp/bunny) library. You'll find its equivalent for most popular languages. 
   * Should you decide to drop RabbitMQ, you might use a Redis-based queue system like [Sidekiq](https://github.com/mperham/sidekiq)
      or [Celery w/ Redis](https://docs.celeryproject.org/en/latest/getting-started/brokers/redis.html).

* Constants/strings used by multiple services (such as a Redis pubsub channel) are stored as json files in a read-only shared
 volume, mounted at `/usr/local/shared-constants`.
   * This /usr/local location is a bit troublesome to use with TypeScript and Webpack toolchains. (Will perhaps look into symlinks.) 
   * If you don't like the approach, you might instead copy these files into each container as part of a build process. (Or do something else entirely... 
      gRPC .proto / TypeScript interfaces, keep them in some key-value store, other, shrug.) 
       
* As already mentioned, the *background-worker* service uses the same source directory. See notes in services/background-worker/README.md.

* very low test coverage, meant to be removed/disposed, but it contains a couple to help test installation a tiny bit: `rake test` in container 

* When switching out the `app/` directory and Dockerfile, consider taking notes and contributing a guide to help the next person. 
 
 
###  Gotchas

* Little thought or time spent on configuring Puma; or connection pools; not a good example for writing APIs/Sinatra controllers. 

* Might need to remove a lock file if the server exits without cleaning up. Eg `rm -r ./backend-api/tmp/pids`
