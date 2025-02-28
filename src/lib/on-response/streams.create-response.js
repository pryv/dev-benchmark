/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */


module.exports = function(status, body, context) {
  const id = JSON.parse(body)?.stream?.id;
  if (id == null) return;
  const [base, count] = id.split('-');
  if (count !== '10') availableRoots[count].push(base);
}