const crypto = require('crypto');

const password = 'Blaze@4323';
const salt = '908'; 

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

console.log('pass+salt:', sha256(password + salt));
console.log('salt+pass:', sha256(salt + password));
console.log('double:', sha256(sha256(password) + salt));