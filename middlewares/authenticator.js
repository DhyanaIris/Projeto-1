const fs = require('fs');


function requireAuth(req, res, next) {
  if (!req.session.user) {
    // Se a sessão de usuário não estiver definida, redirecione para a página de login
    res.redirect('/login');
  } else {
    // Se o usuário estiver autenticado, continue para a próxima rota ou middleware
    next();
  }
}

module.exports = requireAuth;
