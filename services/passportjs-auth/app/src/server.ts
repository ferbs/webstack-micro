import initExpressApp from "./passportjs-auth-app";
import * as config from './config';

const WebstackHost = process.env.WEBSTACK_HOST;
const Port = process.env.PASSPORTJS_AUTH_PORT;
const WebstackProtocol = process.env.WEBSTACK_PROTOCOL;
const internalAuthHeaders = <string[]>[];
(process.env.INTERNAL_AUTH_HEADERS || '').split(',').forEach(val => {
  val = val.trim();
  val && internalAuthHeaders.push(val);
});

if (!Port) {
  throw new Error("PASSPORTJS_AUTH_PORT environment variable required");
}
if (!WebstackHost) {
  throw new Error("WEBSTACK_HOST environment variable required");
}
if (!internalAuthHeaders) {
  throw new Error(`INTERNAL_AUTH_HEADERS environment variable required. Expecting comma-separted list of headers. (Eg, "X-Auth-User, X-Auth-Email")`);
}
const app = initExpressApp({
  serverBaseUrl: `${WebstackProtocol || "https"}://${WebstackHost}`,
  sessionSecret: config.AuthSessionSecret,
  internalAuthHeaders,
  ...config,
});


/**
 * Start Express server.
 */
const server = app.listen(Port, (err: any) => {
  if (err) {
    console.log("Failed to start passportjs-auth server", err);
  } else {
    console.log(`Passportjs-auth server listening on port ${Port}`);
  }

});

export default server;
