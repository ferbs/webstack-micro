import bcrypt from "bcryptjs";
import cryptoRandomString from "crypto-random-string";
import {AuthUser, Email, LocalAuthData} from "../passportjs-auth-app";
import {BcryptHashSalt} from "../config";


export interface NewLocalAuthUserProps {
  email: Email;
  password: string;
  displayName: string;
  confirmed: boolean;
}

export async function buildNewLocalAuthUser({email, password, displayName, confirmed}: NewLocalAuthUserProps): Promise<AuthUser> {
  const authUserId = `local:${cryptoRandomString({length: 16, type: "hex"})}`;
  const pwdHash = await _hashedPassword(password);
  const localAuth = {pwdHash} as LocalAuthData;
  return <AuthUser>{authUserId, email, displayName, confirmed, localAuth};
}


/**
 * Create and persist local password-login user. Mainly for dev mode.
 * See passportjs-auth/app/bin/create-dev-user.js
 *
 * @param saveAuthUser. callback for persisting AuthUser
 * @param email
 * @param cleartextPassword
 * @param displayName
 */
export interface CreateConfirmedLocalAuthUserProps extends Partial<NewLocalAuthUserProps> {
  saveAuthUser: Function;
  findAuthUserByEmail: Function;
}

// note: this is used in bin/create-dev-user.js
export async function createConfirmedLocalAuthUser(opts: CreateConfirmedLocalAuthUserProps): Promise<AuthUser> {
  const {email, password, displayName, findAuthUserByEmail, saveAuthUser} = opts;
  if (!email || !password) {
    throw new Error("Expecting email and password");
  }
  let authUser = await buildNewLocalAuthUser({
    email, displayName, password,
    confirmed: true
  });
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    console.log(`Found existing account for email "${email}", updating password and display name.`);
    existing.localAuth = authUser.localAuth;
    existing.displayName = displayName;
    existing.confirmed = true;
    authUser = existing;

  }
  await saveAuthUser(authUser);
  return authUser;
}

function _hashedPassword(cleartext: string): Promise<any> {
  return new Promise((resolve: Function, reject: Function) => {
    if (!cleartext) {
      return reject("Expecting a password to hash");
    }
    bcrypt.hash(cleartext, BcryptHashSalt, function (err: any, hash: string) {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}
