

export function buildWebSocketUrl({ host, path, protocol }) {
  const loc = global.location;
  if (loc) {
    protocol = protocol || loc.protocol.replace('http', 'ws');
    host = host || loc.host;
  }
  protocol = protocol || 'ws:';
  if (protocol.charAt(protocol.length - 1) !== ':') {
    protocol = `${protocol}:`;
  }
  path = path || '/';
  return `${protocol}//${host}${path}`;
}
