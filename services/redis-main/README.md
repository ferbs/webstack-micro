# redis-main 

This container is based on the official [Redis Docker image](https://hub.docker.com/_/redis/).

Its `redis.conf` uses the default/example config file `http://download.redis.io/redis-stable/redis.conf` but binds to any
 address.
 

If you run Redis yourself in production (rather than use a hosted service in your datacenter) make sure you follow their
 [security guidelines](https://redis.io/topics/security).



## Misc notes

* You can use the redis-cli from inside a container. Eg:  

    # connect to a running passportjs-auth container
    docker exec -it `docker ps --filter name=passportjs -q` bash
    
    # list keys for local dev login accounts: 
    redis-cli -h redis-main keys auth:auid:local:*
