import express from "express";
import passport from "passport";
import {AuthUser} from "../passportjs-auth-app";


export interface PassportOpts {
  fetchAuthUser: (authUserId: string) => Promise<AuthUser | void>;
}


export default function setupPassport(app: express.Application, opts: PassportOpts) {
  const { fetchAuthUser } = opts;
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user.authUserId));

  passport.deserializeUser(function(authUserId: string, cb) {
    fetchAuthUser(authUserId).then((authUser: AuthUser) => {
      cb(null, authUser);
    }).catch((err: any) => {
      cb(err);
    });
  });
}

