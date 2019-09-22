import {promisify} from "util";
import express from "express";
import jwt from 'jsonwebtoken';


const regexBearer = /^Bearer$/i;
const promisedVerify = promisify(jwt.verify).bind(jwt);


// borrowed this from https://github.com/auth0/express-jwt/blob/master/lib/index.js (MIT license)
export function extractJwtFromHeader(req: express.Request): string | void {
  const authHeader = req.headers && req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  let token;
  const parts = authHeader.split(' ');
  if (parts.length == 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (regexBearer.test(scheme)) {
      token = credentials;
    }
  }
  return token;
}


export async function authForJwtRequest(req: express.Request, res: express.Response, token: string, jwtConfig: any): Promise<any> {
  const secret = typeof jwtConfig.secret === 'function' ? await jwtConfig.secret(req) : jwtConfig.secret;
  const payload = await _extractAndVerifyJwtPayload(token, secret, jwtConfig);
  if (payload) {
    res.set("x-auth-jwt", JSON.stringify(payload));
    res.sendStatus(200);
  } else {
    res.status(403).json('InvalidAuthorizationToken')
  }
}

async function _extractAndVerifyJwtPayload(token: string, secret: string, jwtConfig: any) {
  const opts = Object.assign({}, jwtConfig.options || {}, { complete: false });
  const payload = await promisedVerify(token, secret, opts);
  return payload;
}
