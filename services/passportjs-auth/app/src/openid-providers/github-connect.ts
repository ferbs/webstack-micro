import express from "express";
import fetch from "node-fetch";
import passport from "passport";
import {Strategy as GitHubStrategy, Profile as GithubProfile} from "passport-github";
import {VerifyCallback as OauthVerificationCallback} from "passport-oauth2";
import {OpenIdProviderProps} from "../middleware/openid-controller";


export default function setupGithubConnect(opts: OpenIdProviderProps) {
  const {clientId, clientSecret, callbackUrl} = opts;

  const githubStrategy = new GitHubStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackUrl,
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, done) => {
    _handleGithubAuthApproval(req, accessToken, refreshToken, profile)
      .then(authUser => done(null, authUser))
      .catch(err => done(err));
  });
  passport.use(githubStrategy);

  async function _handleGithubAuthApproval(req: express.Request, accessToken: string, refreshToken: string, profile: GithubProfile): Promise<OauthVerificationCallback> {
    const {username, displayName} = (profile || {}) as any;
    if (!username) {
      return Promise.reject("profile.username required to save Github authUser");
    }
    const email = await _explicitlyFetchPrimaryEmailFromGithub(accessToken);
    if (!email) {
      console.warn("Failed to fetch email for authenticated user from GitHub. If your app requires an email address, consider treating this as a failed opendid connection");
    }
    const authUserId = `github:${username}`;
    console.log(`Received OpenIdConnect approval for authUserId "${authUserId}"`);
    return <any>{
      authUserId,
      confirmed: true,
      accessToken, email, displayName,
    };
  }
}

// github is leaving the email field blank on first connect, despite "user:email" scope setting, so fetching it in another request
async function _explicitlyFetchPrimaryEmailFromGithub(accessToken: string): Promise<string | void> {
  if (!accessToken) {
    return;
  }
  const emailsResp = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `token ${accessToken}`
    }
  });
  const emails = await emailsResp.json();
  const primary = Array.isArray(emails) && emails.find((emailInfo: any) => emailInfo.primary && emailInfo.verified);
  return primary && primary.email;
}
