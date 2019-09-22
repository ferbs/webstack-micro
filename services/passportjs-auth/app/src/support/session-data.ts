import express from "express";
import cryptoRandomString from "crypto-random-string";


export interface AuthSessionData {
  csrfToken: string;
  extraSessionKeyToken: string;
}

export function pluckAuthSessionData(req: express.Request): AuthSessionData {
  _ensureSessionData(req);
  const {csrfToken, extraSessionKeyToken} = req.session;
  return {csrfToken, extraSessionKeyToken};
}

export function applySessionDataToResponseHeaders(req: express.Request, res: express.Response) {
  _ensureSessionData(req);
  res.set("x-auth-csrf", req.session.csrfToken);
  res.set("x-auth-sessionkey", req.session.extraSessionKeyToken);
}

function _ensureSessionData(req: express.Request) {
  req.session.csrfToken = req.session.csrfToken || cryptoRandomString({length: 16, type: "base64"});
  req.session.extraSessionKeyToken = req.session.extraSessionKeyToken || cryptoRandomString({
    length: 16,
    type: "base64"
  });
}