function authenticator(req, res, next) {
  const { username, password } = req.body;
  
  if(username === 'admin' && password === 'admin') {
    next();
  } else {
    res.redirect('/index?error=1');
  }
}

module.exports = authenticator;