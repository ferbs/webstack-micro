import { sendJson, fetchJson } from '../util/fetch-util';



export async function fetchAuthUser() {
  return fetchJson('/auth/user/current');
}

export async function signOut() {
  return sendJson('/auth/user/sign_out', {
    method: 'PUT'
  });
}


// signIn for dev-mode local password authentication. (API endpoint not present in production)
export async function signIn(email, password) {
  return sendJson('/auth/local/sign_in', {
    payload: { email, password }
  });
}


