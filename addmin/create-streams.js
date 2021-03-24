
const Pryv = require('pryv');

const connection = new Pryv.Connection('https://ckmc47hw600052ms1arhh0rlo@iliakebets.pryv.addmin.com/');

async function createStream(n) {
  const baseId = Math.round(Math.random()*100000000)+'';

  const apiCalls = [];
  for (let i = 0; i < n; i++) {
    
    const parentId =  i ? baseId+'c'+(i -1) : null ;
    apiCalls.push(
      {
        'method': 'streams.create',
        'params': { 'id': baseId+'c'+i, 'name': baseId+ 'name'+i , 'parentId': parentId}
      });
  }
  const msg = 'Created ' + n + ' streams in';
  console.time(msg);
  const result = await connection.api(apiCalls);
  //console.log(result);
  console.timeEnd(msg);
}

(async () => {
  for (let i = 0; i < 50; i++) {
    await createStream(i);
  }
})();


