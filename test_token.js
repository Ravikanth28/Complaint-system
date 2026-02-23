const jwt = require('jsonwebtoken');
const secret = 'your-super-secret-key-change-it';
const payload = {
    userId: '2bfee694-d409-47ee-9ffb-f3026de0facd',
    email: 'ravikanth@gmail.com',
    role: 'USER',
    name: 'Ravikanth'
};
const token = jwt.sign(payload, secret);
console.log(token);
