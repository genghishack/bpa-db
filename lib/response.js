export function success(body) {
  return buildResponse(200, body);
}

export function failure(body) {
  return buildResponse(500, body);
}

export function buildResponse(statusCode, body) {
  // console.log(body);
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}
