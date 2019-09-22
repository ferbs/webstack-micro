import { sendJson, fetchJson } from '../util/fetch-util';


export async function postAiSortJob(elements) {
  const result = await sendJson('/api/v1/artificial_intelligence/background_sort', {
    payload: {
      jobId: Math.floor(1e16 * Math.random()).toString(36).toLowerCase(),
      elements,
    }
  });
  return result;
}

export async function fetchRecentResult() {
  return await fetchJson('/api/v1/artificial_intelligence/current');
}