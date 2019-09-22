# passportjs-auth

This *passportjs-auth* service handles authentication for all of the services behind our [Traefik](https://traefik.io) *traefik-gateway*.
Requests with a URL path marked as protected in *traefik-gateway* are first directed here, where the request can be approved, 
 blocked, or marked as ok for guest access. When a request on a protected route is allowed to pass, *passportjs-auth* directs 
 *traefik-gateway* to add user-related data to special request headers that are accessible in the target service.  

You can use this *passportjs-auth* service as-is to:
* offer OpenId login for users (eg, "Login with Facebook", "Login with GitHub", etc)
* keep session state for users in browsers
* decode JWT tokens on behalf of other services, for third-party servers or scripts to make API calls to your project   
* log in to your app using a password during development mode, so you can work offline and log in without connecting a real account
                                                      
This *passportjs-auth* example server is **not** a full User service. It doesn't actually maintain a user database of its 
 own. (Except for dev-mode local password login.) See the How It Works and Customization sections below. 
    

## Usage  

### Session Secret

Set AUTH_SESSION_SECRET in your .env file at the webstack-micro project root if you haven't already. (See `webstack-micro/env.development.example`)


### Generating dev-mode login

You can run a script within this service to quickly create local password-based credentials, useful when working offline in dev mode. 

```bash

# first arg for email, second arg for password, remaining for displayName
bin/dev.sh run passportjs-auth bin/create-dev-user.js dev@email.loc secret! Devin dee Developer

```


### Configuration 

Most configuration options have been isolated in a single file: `services/passportjs-auth/app/src/config.ts` 

You can control guest routes, session cookies, and other settings here. (See instructions/comments in the file.)

If you change *webstack-micro*'s auth-related routes, you'll also need to update them in `services/passportjs-auth/app/src/api-endpoints.ts`. 

NOTE: Docker Compose is configured to start the service without restarting for changes watching in dev mode. If you're making 
 config changes, you might want to uncomment the dev-mode start command in `docker-compose.development.yml` before bringing up
 your app.  


### OpenId / Oauth 

The example includes OpenIdConnect for Facebook, Github, and Google. You can enable or disable any of them in the *OpenIdProvider* 
 object in `config.ts`.  

Make sure you set up your client id and client secret with that service and set the corresponding shell environment variable, 
 either in .env or using one of the Docker/Kubernetes/Consul/other tools for holding secrets.  

You can add others easily. The [PassportJs library](http://www.passportjs.org/) supports hundreds of providers. To add one:
* follow an existing example in `services/passportjs-auth/app/src/openid-providers` to create a Passport strategy for your 
 provider. This will involve adding a new Passport strategy to your Node package, eg `bin/dev.sh run passportjs-auth yarn install passport-somethingorother`    
    * some might make you work to get the user's email address but it is recommended that you do so. (eg, Twitter has a special
       request form; GitHub requires a second request to fetch it.)  
* add your provider to the *OpenIdProvider* registry in `services/passportjs-auth/app/src/config.ts` 
* add the client id and secret to your .env file (or secrets tool) 
* import the strategy in `services/passportjs-auth/app/src/middleware/openid-controller.ts` and follow an existing example to 
 register its route. 

 
GitHub makes it easy to [set up](https://github.com/settings/applications/new) a client connection. But they don't
 have a feature for dev-mode callbacks, you just need to create multiple applications. 
   

### Using auth data in other services 

Other services can access the following request headers when relevant: 
 
* x-auth-user. Present when user is fully authenticated. (Not a guest.) Its value depends on the provider used to log 
 in. (Eg, `github:ferbs`.) A dev-mode password login will look like `local:abcdef0123456789`.      

* x-auth-email. Email address of the user, if known. It makes for a good lookup key for fetching actual User models
 (eg, in *backend-api*) so long as all of your selected OpenId providers share the user's email. (Suggestion: don't offer any
 providers that do not share user email.)   

* x-auth-guest. Present when a non-authenticated user is accessing a resource marked as OK for guests. The value is generated 
 with a prefix + random token and stored on the user session. 

* x-auth-sessionkey. This is a random token stored in session state for a user. Rather than setting and accessing session data 
 through this service from another service, you might use this value to keep your own session state (eg, using this token as part 
 of a Redis key.) If you decide to use a second session cookie, just make sure the names don't collide. (See SessionConfig.name 
 in `config.ts`) 

* x-auth-data. JSON-serialized string containing any user-related data other services might need. It currently includes displayName
 (see customization options below.)    

OR: 

* x-auth-jwt. JSON-serialized string containing the verified and decoded JWT token if present. 
    * If a token is present, it is assumed the request is an API call from a third-party server and not from a user/browser, so none of the other x-auth-* headers are added.  
    * The token must follow the standard "Authorization: <type> <credentials>" pattern. (Eg, "Authorization: Bearer abc123sometoken23432.moo123") 
 
Note: different frameworks have different ways of exposing request headers. (Eg, Ruby Rack adds an "HTTP_" prefix and upcases them, 
 so accessing user email would look like `request.env['HTTP_X_AUTH_EMAIL']`.)  


     
## Security Notes 

### Session state

Make sure you look through the session-related settings in `session-state.ts`. 

The default for session cookies is a `SameSite=lax` option, but consider setting it to "strict". (And moving WebSockets host back 
 to the same domain, if you're not encountering connection collisions in the front end.) 
 

### CSRF

A csrf token is generated for each session and passed to protected services on the `x-auth-csrf` request header, letting 
 your service do its own token-based checks. Your app might write it into the initial page's HTML or if using a static file
 for your front end, like in the example, fetch it on page initialization. Subsequent requests would include the value, the
 'x-csrf-token' header in the example. For state-changing requests, the controller checks that this 'x-csrf-token' matches 
 the actual 'x-auth-csrf' value.    

You can also look into same-site session cookies. 
 

## Misc notes / tips / suggestions 

### How it works

We configured our *traefik-gateway* to use this *passportjs-auth* service for two types of traffic. When *traefik-gateway* sees
 an incoming http request for a protected resource, it makes a request of its own to `/_auth/verify` on this *passportjs-auth* 
 service. If our `src/middleware/auth-check.ts` middleware responds with a 200 status code, the request will be permitted to
 continue to its target destination, responding with an error code rejects the request.   
 
Additionally, for approved requests, we can set some specific headers on our response, ones that Traefik will copy onto to 
 the original request before it is routed on to its destination service. The x-auth-* headers are whitelisted using the 
 *authResponseHeaders* directive, set to the comma-separated list declared on the INTERNAL_AUTH_HEADERS environment variable.     
     
For example, pretend a user clicks a "Sign in with GitHub" link on your site, authorizes the connection, and then visits a protected
 user dashboard page. *Passportjs-auth* handles the GitHub OpenId connection, sets up Redis-backed session state for the user, 
 and adds headers like "x-auth-email" to the user's request for a dashboard page. The *backend-api* responsible for serving individually 
 tailored content for this dashboard page would use the email address in "x-auth-email" to look up the actual User model. 


### Where to create your actual User model 

This *passportjs-auth* service is not intended to act as a *User Service*. You can turn it into one, and that would be the 
 *pure* microservices way of doing things, where the User Service has its own user database and manages all user-related 
 requests, both internal and external. This approach has its own pros and cons but is something most small-ish teams should 
 defer. 
 
This begs the question, how are new User records created? The demo code is overly simple in this regard and doesn't tackle
 the issue, but most web apps need a User model, using it for database joins most everywhere.  

Your simplest option is to create a new User row in the database the first time a newly authenticated user is encountered. 
 For example, in your app's middleware or in a base controller, look up the User using the *x-auth-email* header. If not present, 
 create it, perhaps populating other fields using the info in x-auth-data (a json string containing oauth-fetched info like displayName.)

It might be tempting to connect to your app's database, but don't, don't do that. Sharing the same database tables across multiple 
 services is a bad (worst) practice, leading to a world of problems and headaches.   
    

### Local password authentication

I couldn't find anything decent in the Node ecosystem for local, password-based login. Stormpath maybe, but it was 
 deprecated after their company was acquired. See notes in `services/passportjs-auth/app/src/middleware/local-password-controller.ts`.

I'm not sure if it's better to add the missing functionality or to to completely replace this service, perhaps with something 
 like Authboss, writtin in Go.                                               

So for now, password-based account creation is done at the command line (see "Generating dev-mode login" above) and its login 
 is hidden when not in dev-mode.  

 
### Misc build-related commands

```bash
# from the webstack-micro project root

# rebuild the image:
bin/dev.sh build passportjs-auth

# yarn add:
bin/dev.sh run passportjs-auth yarn add ___

# recompile typescript source: 
bin/dev.sh run passportjs-auth yarn build
```


### Completely replacing this service

If you want to completely replace this service with a different centralized authentication mechanism, take a look at the full-featured 
 Keycloak (Java/Jboss Docker container) or the small [Google-login-only](https://github.com/thomseddon/traefik-forward-auth). If so, 
 you'll need to reconfigure the front gateway to interact with it, and update how services consume the authentication headers.  
     

## Creation and credits

* Docker container running Node v10
* started with [Microsoft/TypeScript-Node-Starter](https://github.com/Microsoft/TypeScript-Node-Starter); ended up deleting
 most of it, but kept the initial TypeScript/linting setup.  
   


## Warning

Haven't tried running the following code, not even once: 
* verifying/decoding JWT tokens 
* facebook connect
* google connect 
