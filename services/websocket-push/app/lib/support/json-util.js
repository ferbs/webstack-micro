

function parseJson(msg) {
  let data;
  try {
    data = JSON.parse(msg);
  } catch (err) {
    console.warn(`Could not parse json message`, msg);
  }
  return data;
}

module.exports = {
  parseJson
};