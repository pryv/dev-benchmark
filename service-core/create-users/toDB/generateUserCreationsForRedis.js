
const NUM_USERS = 1;
const CORE_HOSTNAME = '"stcore-obpm-azure-nl-02.pryv.net"';

const USERNAME_PREFIX = 'user-';

for (let i=0; i<NUM_USERS; i++) {
  console.log('HMSET ' + username(i) + ':users appid "dontcare" username "' + username(i) + '" email "' + username(i) + '@bogus.tk" invitationToken "enjoy" referer null language "en" id "random-' + i + '" "registeredTimestamp" "' + Date.now() + '"')
}

for(let i=0; i<NUM_USERS; i++) {
  console.log('SET ' + username(i) + ':server ' + CORE_HOSTNAME);
}

for(let i=0; i<NUM_USERS; i++) {
  console.log('SET ' + username(i) + ':email "' + username(i) + '@bogus.tk"');
}

function username(i) {
  return USERNAME_PREFIX + i;
}