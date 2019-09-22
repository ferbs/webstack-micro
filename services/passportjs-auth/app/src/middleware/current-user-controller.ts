import express from "express";
import {AuthUser} from "../passportjs-auth-app";
import {currentUserVisibleData} from "../support/current-user-support";
import initCsrfCheck from "./csrf";
import {CurrentUserApiEndpoint} from '../api-endpoints';


export interface SetupCurrentUserControllerProps {
  serverBaseUrl: string;
}

export default function setupCurrentUserController({serverBaseUrl}: SetupCurrentUserControllerProps) {
  const router = express.Router();

  // GET /auth/user/current
  router.get(CurrentUserApiEndpoint.UserInfo, function (req: express.Request, res: express.Response) {
    res.json(currentUserVisibleData(req));
  });

  router.use(CurrentUserApiEndpoint.SignOut, initCsrfCheck({serverBaseUrl}));
  // PUT /auth/user/sign_out
  router.all(CurrentUserApiEndpoint.SignOut, function (req: express.Request, res: express.Response) {
    if (req.method !== "POST" && req.method !== "PUT") {
      // NOTE: if you want to permit signing out by just navigating the browser to a signout page (GET) you can remove this
      // guard but it permits flyby sign-outs (tricking a request out of the user that signs them out)
      res.sendStatus(404);
      return;
    }
    signOutCurrentUser(req, res);
  });
  return router;
}


export function signOutCurrentUser(req: express.Request, res: express.Response) {
  req.logout();
  if (req.xhr) {
    res.json({loggedOut: true});
  } else {
    res.redirect(req.params.redirTo || "/");
  }
}