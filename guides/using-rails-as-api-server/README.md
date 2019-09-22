The *webstack-micro* example would have been a Rails --api app if v6 didn't still force you to install nokogiri.

Rough instructions: 

* Modify the example's Dockerfile (which is based on the official [ruby:2.6.4-alpine](https://hub.docker.com/_/ruby) image) to
 install a few more packages:
 
    ```Dockerfile
    RUN apk add --update --no-cache \
      bash \
      build-base \
      tzdata \
      postgresql postgresql-client postgresql-dev libpq \
      sqlite sqlite-dev \
      ruby-nokogiri
    ```    


* gem install rails --version 6.0.0 

(or maybe bundle install if you are keeping the existing Gemfile?)

* Follow the [Rails --api install instructions](https://guides.rubyonrails.org/api_app.html)

* Create *current_user* method that uses "x-auth-email" header to find or create the user.    



