
const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Access Denied')
  }
  const token = req.headers.authorization.split(' ')[1]
  if (!token) {
    return res.status(401).send('Access Denied');
  }
  try {
    req.currentUser = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Name " + req.currentUser._name);
    console.log("Email " + req.currentUser._email);
    console.log("UID " + req.currentUser._uid);
  } catch {
    return res.status(401).send('Invalid Token');
  }


  next()

}

module.exports = auth