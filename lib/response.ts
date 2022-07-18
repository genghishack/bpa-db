export function success(body: any) {
  return buildResponse(200, body);
}

export function failure(body: any) {
  return buildResponse(500, body);
}

export function buildResponse(
  statusCode: number,
  body: any
) {
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
