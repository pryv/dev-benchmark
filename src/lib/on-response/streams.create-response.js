

module.exports = function(status, body, context) {
  const id = JSON.parse(body)?.stream?.id;
  if (id == null) return;
  const [base, count] = id.split('-');
  if (count !== '10') availableRoots[count].push(base);
}