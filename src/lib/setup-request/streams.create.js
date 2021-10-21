
global.availableRoots = {};
for (let i = 0; i < 10; i++)  availableRoots[''+i] = [];

module.exports = function(request, context) {
  let idx = Math.round(Math.random()*10000000000000) + '-0';
  let parentId = null;

  // find a parentId
  for (let i = 0; i < 10; i++) {
    if (availableRoots['' + i].length > 0) {
      const rootId = availableRoots['' + i].pop();
      parentId = rootId + '-' + i;
      idx = rootId + '-' + (i + 1);
      break;
    }
  }

  request.body = request.body.replaceAll('[<id>]', idx);
  if (parentId == null) {
    request.body = request.body.replaceAll('"[<parentId>]"', 'null');
  } else {
    request.body = request.body.replaceAll('[<parentId>]', parentId);
  }
 
  return request;
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  var s1 = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return target.replace(new RegExp(s1, 'g'), replacement);
};