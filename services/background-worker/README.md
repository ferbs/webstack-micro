# background-worker

This service doesn't have its own source directory or Dockerfile. It is nearly identical to *backend-api* except it starts a
 RabbitMQ listener rather than an http server and does not expose any routes over http.     

You can compare the setup of the two in Docker Compose. (docker-compose.common.yml)   


Both the *backend-api* and *background-worker* services share the same (rough/disposable) Ruby source. Backend controllers are 
 started using an http server (Puma) while the background workers are started with the RabbitMQ-endorsed sneakers app that
 listens for new jobs.   




### Instructions / Notes

* The RabbitMQ listener is run in the **start_background_workers.rb** file. It uses the [Sneakers](https://github.com/jondot/sneakers) library 
 to manage the queue and background jobs. The example file will require your time/attention. It's mostly configured with defaults in
 the example.  
  
* The Docker Compose file (docker-compose.common.yml) intentionally omits using a `depends_on: - rabbitmq-broker` because
 it has been misbehaving. Whatever Docker's `depends_on` directive waits for (not the health check it seems) triggers long 
 before RabbitMQ is actually ready, making it useless here and very loud in the error log. I manually added a wait in the 
 example service. It polls for a response from the RabbitMQ management api before connecting. (Couldn't find a built-in mechanism 
 for this in the ruby client.) Furthermore, starting container specific commands (eg `bin/dev.sh run background-worker bash`) without 
 a *--no-deps* switch would sometimes start a second broker and crash the first. 
 