# traefik-gateway

Will try Traefik v2 upgrade before writing this.  

In either case... 

* based on the official [Traefik image](https://hub.docker.com/_/traefik)

* Configures protected paths to use ForwardAuth
  * v2 link: [Traefik ForwardAuth middleware](https://docs.traefik.io/v2.0/middlewares/forwardauth/) 
  * todo: instructions/explanations 
  
* picks up much of its config in docker-compose

* exposedbydefault set to false, must explicitly mark service

* explain ssl options; links

* gotcha/confusing: A Traefik config mixes its own command names with user-defined names.. "skipAuth" and "webDefault" are segment names we define ourselves. User-defined names  


### Default routes 

We set Traefik's routing rules using the path prefix:  

* Requests to /static/* and /assets/* completely skip authentication and are routed on to *frontend-web* immediately

* Requests to /auth/* are sent to *passportjs-auth* controllers, bypassing Traefik's accept/reject authentication forwarding mechanism

* Requests to any other path are forwarded for an authentication check before being routed to their destination. (Note: you can 
 configure *passportjs-auth* to accept guest routes.) 

