import {NextFunction, Request, Response} from "express";


export interface InitCsrfCheckProps {
  serverBaseUrl: string;
}

export default function initCsrfCheck({serverBaseUrl}: InitCsrfCheckProps) {
  return function csrfCheck(req: Request, res: Response, next: NextFunction) {
    // note: session cookies are set with SameSite=strict by default, providing CSRF protection.
    const referer = req.headers["referer"];
    if (req.method === "GET") {
      next();
    } else if (referer && referer.indexOf(serverBaseUrl) === 0) {
      next();
    } else if (req.headers["x-csrf-token"] && req.headers["x-csrf-token"] === req.session.csrfToken) {
      next();
    } else {
      console.log("Blocking cross-site request from", req.headers["referer"], "trying to access", req.url);
      res.sendStatus(403);
    }
  };
}
