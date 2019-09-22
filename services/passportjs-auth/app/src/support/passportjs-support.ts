import express from "express";
import {AuthUser} from "src/passportjs-auth-app";


export function promisedLogin(authUser: AuthUser, req: express.Request) {
  return new Promise((resolve, reject) => {
    req.logIn(authUser, err => {
      if (err) {
        reject(err);
      } else {
        resolve(authUser);
      }
    });
  });
}