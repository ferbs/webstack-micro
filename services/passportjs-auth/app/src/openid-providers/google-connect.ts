import express from "express";
import passport from "passport";
import {Strategy as GoogleStrategy, Profile as GoogleProfile} from "passport-google-oauth20";
import {VerifyCallback as OauthVerificationCallback} from "passport-oauth2";
import {OpenIdProviderProps} from "../middleware/openid-controller";


export default function setupGoogleConnect(opts: OpenIdProviderProps) {
  const {clientId, clientSecret, callbackUrl} = opts;

  const googleStrategy = new GoogleStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackUrl,
    scope: [ 'email' ], // others?
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, done) => {
    _handleGoogleAuthApproval(req, accessToken, refreshToken, profile)
      .then(authUser => done(null, authUser))
      .catch(err => done(err));
  });

  passport.use(googleStrategy);

  async function _handleGoogleAuthApproval(req: express.Request, accessToken: string, refreshToken: string, profile: GoogleProfile): Promise<OauthVerificationCallback> {
    const { email, id, displayName} = (profile || {}) as any;
    if (!email) {
      return Promise.reject("profile.email required to save Google authUser");
    }
    if (!id) {
      return Promise.reject("profile.id required to save Google authUser");
    }
    const authUserId = `google:${id}`;
    console.log(`Received OpenIdConnect approval for authUserId "${authUserId}"`);
    return <any>{
      authUserId,
      confirmed: true,
      accessToken, email, id, displayName,
    };
  }
}
