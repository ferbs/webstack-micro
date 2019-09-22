import express from "express";
import passport from "passport";
import {Strategy as FacebookStrategy, Profile as FacebookProfile} from "passport-facebook";
import {VerifyCallback as OauthVerificationCallback} from "passport-oauth2";
import {OpenIdProviderProps} from "../middleware/openid-controller";


export default function setupFacebookConnect(opts: OpenIdProviderProps) {
  const {clientId, clientSecret, callbackUrl} = opts;

  const facebookStrategy = new FacebookStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackUrl,
    profileFields: [ 'email', 'name', 'displayName', 'id' ],
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, done) => {
    _handleFacebookAuthApproval(req, accessToken, refreshToken, profile)
      .then(authUser => done(null, authUser))
      .catch(err => done(err));
  });

  passport.use(facebookStrategy);

  async function _handleFacebookAuthApproval(req: express.Request, accessToken: string, refreshToken: string, profile: FacebookProfile): Promise<OauthVerificationCallback> {
    const { email, id, username, displayName} = (profile || {}) as any;
    if (!email) {
      return Promise.reject("profile.email required to save Facebook authUser");
    }
    const authUserId = `facebook:${username}`;
    console.log(`Received OpenIdConnect approval for authUserId "${authUserId}"`);
    return <any>{
      authUserId,
      confirmed: true,
      accessToken, email, id, username, displayName,
    };
  }
}
