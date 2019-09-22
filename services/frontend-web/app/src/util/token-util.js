




export function insecureToken() {
  return Math.floor(1e16 * Math.random()).toString(36).toLowerCase();
}