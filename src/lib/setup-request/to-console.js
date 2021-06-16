module.exports = function(request, context) {
  const show = {path: request.path, headers: request.headers, method: request.method, body: request.body};
  console.log(show);
  return request;
}