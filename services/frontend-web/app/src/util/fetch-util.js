

let csrfToken;
const DefaultFetchOptions = {
  redirect: 'manual',
  credentials: 'same-origin',
};


// {webstack-note} if older browser support is needed, consider using an xhr library instead of fetch
export async function sendJson(url, { payload, ...opts }={}) {
  if (payload && !opts.body) {
    opts.body = JSON.stringify(payload);
    opts.method = opts.method || 'POST';
  }
  opts = Object.assign({
    headers: _requestHeadersForPutPost(),
  }, DefaultFetchOptions, opts);

  return _makeRequest(url, opts);
}


export async function fetchJson(url, opts={}) {
  opts = Object.assign({
    headers: _requestHeadersForGet(),
  }, DefaultFetchOptions, opts);
  return _makeRequest(url, opts);
}
export function setCsrfToken(token) {
  csrfToken = token;
}

async function _makeRequest(url, fetchOpts) {
  const resp = await fetch(url, fetchOpts);

  const contentType = resp.headers.get("content-type");
  if (contentType && contentType.indexOf("/json") > 0) {
    return await resp.json();
  } else if (resp.status !== 200) {
    console.warn('Server is not treating request as XHR. Expecting json response, got:', contentType);
    return {
      status: resp.status,
      // todo: pass along 30x redirect here
    }
  } else {
    const err = Error('ExpectingJson');
    Object.assign(err, { details: { contentType, url } });
    throw err;
  }
}

function _requestHeadersForGet(extra={}) {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': csrfToken || (global.csrfToken),
    ...extra
  };
}
function _requestHeadersForPutPost(extra={}) {
  return _requestHeadersForGet({
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken || (global.csrfToken),
    ...extra
  });
}
