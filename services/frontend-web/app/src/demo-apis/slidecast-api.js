import { sendJson, fetchJson } from '../util/fetch-util';

// see services/backend-api/app/lib/slidecast_controller.rb

const UserMountPoint = '/api/v1/slidecasts';
const GuestMountPoint = `/guest${UserMountPoint}`;

export async function fetchCurrentSlide(slidecastId) {
  if (!slidecastId) {
    return Promise.reject({ errorCode: 'InvalidSlidecastId' });
  } else {
    return fetchJson(`${GuestMountPoint}/watch_current/${slidecastId}`);
  }
}

// demo permits one presentation per authenticated user
export async function fetchPresentationData() {
  return fetchJson(`${UserMountPoint}/solo`);
}

export async function savePresentation({ title, slides }) {
  return sendJson(`${UserMountPoint}/solo`, {
    payload: { slides, title },
    method: 'POST',
  });
}

export async function displaySlide(indexDesired) {
  if (typeof indexDesired !== 'number') {
    return Promise.reject({ errorCode: 'InvalidParams', message: 'Expecting "ndx" property of a valid slide index', value: indexDesired });
  }
  return sendJson(`${UserMountPoint}/broadcast_slide/${indexDesired}`, {
    method: 'PUT'
  });
}

export async function destroyPresentation() {
  return sendJson(`${UserMountPoint}/solo/rm`, {
    method: 'DELETE'
  });
}