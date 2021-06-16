module.exports = function(request, context) {
  const idx = Math.round(Math.random()*10000000000000);
  console.log(idx);
  request.body = request.body.replaceAll('[<id>]', idx);
  return request;
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  var s1 = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return target.replace(new RegExp(s1, 'g'), replacement);
};