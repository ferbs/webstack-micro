import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {check, sanitize, validationResult, ValidationError, Result} from "express-validator";
import bcrypt from "bcryptjs";
import {AuthUserPersistence, AuthUser, LoginCallback} from "../passportjs-auth-app";
import {currentUserVisibleData} from "../support/current-user-support";
import {FrontendPageType, frontendPagePath, CurrentUserApiEndpoint, LocalPasswordEndpoint} from "../api-endpoints";
import {signOutCurrentUser} from "./current-user-controller";
import initCsrfCheck from "./csrf";
import {promisedLogin} from "../support/passportjs-support";


interface LocalPasswordOpts extends AuthUserPersistence {
  serverBaseUrl: string;
  onLoginSuccess?: LoginCallback;
}

/**
 * Dev-mode login, for working offline, without having to touch or stub 3rd-party providers
 *
 * I couldn't find anything decent in the Node ecosystem with features similar to Ruby's Devise gem for local password management
 * Found some with partial functionality and had other downsides, like hard-coding to Mongoose/MongoDb.
 *
 * If adding endpoints for a full login system intended for production make sure to:
 *   - add a time delay before checking a password (eg, track/persist count of failures, use that to calculate wait time and/or return a validation error)
 *   - confirmation and reset-password emails; tokens must expire (and if justified, hash token like it is a password)
 *   - remember-me checkbox for user (currently session has hard-coded life)
 *
 * todo: maybe look at stormpath (now deprecated/archived); maybe evaluate Authboss (golang) to replace this service
 *
 *
 * @param opts
 */
export default function setupLocalPasswordController(opts: LocalPasswordOpts) {
  const router = express.Router();
  const { serverBaseUrl, onLoginSuccess } = opts;
  _useLocalPassportStrategy(opts);
  router.use(initCsrfCheck({ serverBaseUrl }));
  router.post(LocalPasswordEndpoint.SignIn, (req: Request, res: Response, next: NextFunction) => {
    const handleSignIn = async () => {
      await signIn(req, res, opts);
      if (onLoginSuccess && req.user) {
        await onLoginSuccess(req.user as AuthUser, req, res);
      }
    };
    handleSignIn().catch(err => next(err));
  });

  // Adds an alias to current-user-controller.ts for sign out
  router.put(CurrentUserApiEndpoint.SignOut, function(req: express.Request, res: express.Response) {
    signOutCurrentUser(req, res);
  });

  // TODO: add full-featured local password support or remove:
  // // note: these are mounted on /auth/local. For the signup page, the browser might show /app/sign_up as the URL, and the form
  // // will POST to /auth/local/sign_up
  // router.post(LocalPasswordEndpoint.SignUp, (req: Request, res: Response, next: NextFunction) => {
  //   signUp(req, res, opts).then(noop).catch(err => next(err))
  // });

  return router;
}

function _useLocalPassportStrategy(opts: LocalPasswordOpts) {
  const { fetchAuthUserByEmail } = opts;

  const fetchVerifiedUser = async (email: string, password: string): Promise<AuthUser | null | false> => {
    if (!email) {
      return null;
    }
    const authUser = await fetchAuthUserByEmail(email.toLowerCase());
    if (!authUser) {
      return null;
    } else if (!authUser.localAuth) { // user has not set up a local password
      return false;
    } else {
      const hash = authUser.localAuth && authUser.localAuth.pwdHash;
      const isVerified = await _verifyPassword(password, hash);
      if (isVerified) {
        return authUser;
      } else {
        return false;
      }
    }
  };


  passport.use(new LocalStrategy({ usernameField: "email", passReqToCallback: false }, (email, password, done) => {
    fetchVerifiedUser(email, password)
      .then((result: AuthUser | false) => done(null, result, !result && { message: "Invalid email or password" }))
      .catch((err: any) => done(err));
  }));
}


async function signIn(req: Request, res: Response, opts: LocalPasswordOpts) {
  check("email", "Email is not valid").isEmail();
  check("password", "Password cannot be blank").isLength({min: 1});
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const pageForForm = _pageForForm(FrontendPageType.SignIn, req, opts);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return _applyValidationErrors(errors, { req, res, redirPath: pageForForm });
  }
  let authUser;
  try {
    authUser = await _promisedLocalLogin(req, res);
  } catch (err) {
    console.log("Unexpected error during login", err);
  }
  if (authUser && authUser.confirmed) {
    if (req.xhr) {
      res.json(currentUserVisibleData(req));
    } else {
      res.redirect(req.params.redirTo || frontendPagePath(FrontendPageType.GuestHome));
    }
  } else if (authUser) { // in the middle of the process
    if (req.xhr) {
      res.json({ errorCode: "EmailNotConfirmed" });
    } else {
      // todo: res.redirect(frontendPagePath(FrontendPageType.ConfirmEmail));
      console.error('Email confirmation system not yet implemented')
    }
  } else {
    const invalid = { errorCode: "InvalidCredentials", message: "Check your email and password and try again." };
    _applyValidationErrors(invalid, { req, res, redirPath: pageForForm });
  }
}

function _promisedLocalLogin(req: Request, res: Response): Promise<AuthUser | void> {
  return new Promise((resolve, reject) => {
    passport.authenticate("local", function(err, authUser) {
      if (err || !authUser) {
        reject(err);
      } else {
        promisedLogin(authUser, req).then(resolve, reject);
      }
    })(req, res, (err: any) => reject(err));
  });
}


function _verifyPassword(cleartext: string, hash: string): Promise<boolean> {
  if (!cleartext || !hash) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(cleartext, hash);
}

// todo: make FrontendPageType optional, use req.headers['referer']? if not present
function _pageForForm(pageType: FrontendPageType, req: Request, opts: LocalPasswordOpts): string {
  return req.params.returnTo || frontendPagePath(pageType);
}


// https://express-validator.github.io/docs/validation-result-api.html#validationresultreq
// mainly [ { msg, param, value } ]
interface ErrorData {
  message: string;
  param?: string; // param name, possibly in weird express-validator format
  field?: string; // param name (when created manually)
  value?: string; // invalid value
}
interface ValidationErrorsPropsSigh {
  redirPath: string;
  req: Request;
  res: Response;
}
function _applyValidationErrors(errors: Result<ValidationError> | ErrorData[] | ErrorData, { redirPath, req, res }: ValidationErrorsPropsSigh): void {
  // @ts-ignore
  let payload = (typeof errors.array === "function" ? errors.array() : errors);
  payload = Array.isArray(payload) ? payload : [ payload ];
  if (req.xhr) {
    res.status(400);
    res.json({
      validationErrors: payload
    });
  } else {
    req.flash("errors", JSON.stringify(payload)); // todo: safe stringify needed?
    res.redirect(redirPath);
  }
}

