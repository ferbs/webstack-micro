# frontend-web

The *webstack-micro* example app makes the popular choice of separating its front and back ends into separate services, where 
 the browser loads static files from *frontend-web* then makes requests against the *backend-api*. 
 
The service uses [Nginx](http://nginx.org/en/) for serving these static files in production mode and a Webpack-based dev server when run
 in development mode.     

  
## Making it your own
 
### Using a better toolchain
 
The example uses [create-react-app](https://create-react-app.dev) to build a single-page app. If you want to stick with React, their 
 documentation offers [recommendations](https://reactjs.org/docs/create-a-new-react-app.html#recommended-toolchains) for
 toolchains, libraries that turn your user interface components into an optimized site. Other popular frameworks 
 like [Vue](https://vuejs.org/) and [Angular](https://angular.io/) also have their own tools and recommendations for toolchains.   
 
You can use any build system you prefer, such as [Webpack](https://webpack.js.org), [Gulp](https://gulpjs.com), etc.

If you expect to have a large number of static pages, consider adding a static site generator to this *frontend-web* service. The speedy 
 [Hugo](https://gohugo.io) is a good option, though it requires adding the *hugo* binary to your Docker container. (Modify 
 `services/frontend-web/Dockerfile` to include *hugo* in the `RUN apk add` directive.) 

If/when you change the toolchain, you'll likely want to update the paths that bypass authentication in *traefik-gateway* and
 similarly, to expand the list of paths that are permitted guest access in *passportjs-auth*. (See their README files.)


### If using React / reusing example code 

The example tries to keep its demo-specific components isolated from potentially reusable code like that relating to WebSockets, authentication, etc. 
 Even this code, however, should be used with caution. I used this *frontend-web* example as an opportunity to play around with 
 an idea for a WebSocket-based reducer (*useServerDispatch*) and to try some libraries I haven't yet had a chance to use (eg, 
 material-ui) with the assumption that it would be a discardable placeholder. Some seems nice though. If I end up using it in
 a real project (w/ improvements and tests) I'll consider updating it here as well.  
 
  
### Authentication

For OpenIdConnect/Oauth login, the UI links users to `/auth/connect/${providerName}`. Upon authentication, they are redirected back to
 the single page app, now as a logged-in user. For OpenIdConnect, there's little to do in your *frontend-web* other than provide 
 nice links/buttons. 
The example code has three providers set up, and you can add or remove their visibility in *frontend-web/app/src/config.js* by 
 commenting/revealing the provider line listed in `OpenIdConnectHrefByProvider`. Before revealing a provider, make sure its
 corresponding controller is set up in *passportjs-auth*. (See its README.) 

Local password-based login is only available in dev mode. The Node ecosystem has poor choices for local auth. Including it 
 in webstack-micro would require either writing a handful of controller endpoints or completely replacing *passportjs-auth* 
 with some other authentication service. (See notes in *passportjs-auth* README.)  
If switching away from React, you can use the local sign in/out API calls in `frontend-web/app/src/auth/auth-api.js`.
 
However the user signs in, session state is managed by *passportjs-auth*. The front-end can fetch current login status and
 a CSRF token with a GET request to `/auth/user/current` and sign out with a PUT to `/auth/user/sign_out`. (See 
 example in auth-api.js.) These requests are handled by code in `passportjs-auth/app/src/middleware/current-user-controller.ts`.


## Misc notes and tips

### Three levels of routing

The *traefik-gateway* service takes a first stab at routing incoming requests, sending anything that doesn't match its high-priority 
 rules (eg, /api/* prefix) to this *frontend-web* service. 
 
We configure `nginx.conf` to serve any path starting `/app/` (or `/` or `/index.html`) to serve our main `services/frontend-web/app/public/index.html` 
 single-page-app, built by create-react-app.
 
Finally, the topmost `App.jsx` React component uses the *@reach/router* library to manage html5 pushState/history in the browser, 
 using the remaining path string after the */app* prefix to render the appropriate view for the user. 
 
 
### Gotcha with shared-constants  

The current example copies the contents of the *shared-constants* mounted volume into the `src` directory before each build
 and server start because *create-react-app* does not support imports outside of src, and does not permit normal Webpack 
 directory aliasing. Consider [ejecting create-react-app](https://create-react-app.dev/docs/available-scripts#npm-run-eject).



## Production

In a full production environment, you might deploy this service as a normal `nginx` static file server, or alternatively, publish
 the resulting `app/public` files to a CDN rather than spinning up this *frontend-web* service. If to a CDN, remember to add 
 any necessary CORS headers.
      
### Trying nginx locally 

One option is to start Docker Compose in production mode on your local system. While it is running, you would need to attach
 to the running container (docker exec it ___ bash) to do rebuilds.      

First, you'll need to run the production build. 
 
Alternatively, you can connect or start frontend-web, kill what's already running (eg, `pkill -f react`) and start nginx yourself.
 For example:
```bash 
# kill the normal dev-mode frontend-web with:
docker kill `docker ps --filter name=frontend -q`
# bash shell as root:
bin/dev.sh run -u root frontend-web bash
# switch to "www" user for the build
su - www
yarn build
exit
# start nginx:
nginx 
```


### Creation notes and credits 

The files below are relative to `webstack-micro/services/frontend-web`.

* created a custom `Dockerfile` based on a standard Node 10 image, adding nginx and bash, plus a shared yarn cache for development mode (see notes in Dockerfile) 

* installed create-react-app and initialized Node package
  * its dev-mode requests supporting hot-module updates were being blocked when logged out (eg, `/sockjs-node`) so added them to the dev-mode whitelist in *passportjs-auth* 

* added the [material-ui] react component library and its font dependency (typeface-roboto) plus much of the [devias-io theme](https://github.com/devias-io/react-material-dashboard) for
 Material UI (free version, MIT license) with its clsx dependency 
 * moved all JSX files from a `.js` extension to `.jsx`   

* wired up authentication-related UI to use *passportjs-auth* api
  * note: using browser `fetch` directly, so this example site does not support IE11 or earlier   
  * switched from theme's use of react-router-dom to @reach/router for better programmatic navigation (saw a notice that the 
  two libs are merging) 
