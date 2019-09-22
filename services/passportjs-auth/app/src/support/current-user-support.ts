import express from "express";
import {AuthUser} from "../passportjs-auth-app";


export interface CurrentUserLoginData {
  authUserId?: string;
  email?: string;
  displayName?: string;
  csrfToken?: string;
  isGuest?: boolean;
  guestId?: string;
}

export function currentUserVisibleData(req: express.Request): CurrentUserLoginData {
  const authUser = req.user as AuthUser;
  let userData: CurrentUserLoginData;
  if (authUser && authUser.authUserId) {
    const {authUserId, email, displayName} = authUser;
    userData = {authUserId, email, displayName};
  } else {
    userData = {
      authUserId: null,
      isGuest: true,
      guestId: req.session.guestId,
    };
  }
  userData.csrfToken = req.session.csrfToken;
  return userData;
}
