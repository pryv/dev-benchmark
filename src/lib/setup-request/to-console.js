/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
module.exports = function(request, context) {
  const show = {path: request.path, headers: request.headers, method: request.method, body: request.body};
  console.log(show);
  return request;
}