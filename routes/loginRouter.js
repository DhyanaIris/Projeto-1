const express = require("express");
const router = express.Router();
const authenticator = require("../middlewares/authenticator");

router.get("/", (req, res) => {
  res.render("login");
});

router.post('/', (req, res) => {
  const { username, password } = req.body;

  const authenticatedUser = authenticator(username, password);

  if (authenticatedUser) {
    // Autenticação bem-sucedida, armazene algum indicativo na sessão
    req.session.authenticated = true;
    req.session.user = authenticatedUser; // Armazene informações do usuário na sessão
    
  } else {
    // Credenciais inválidas, redirecione para a página de login com um erro
    res.redirect('/login?error=1');
  }
});


module.exports = router;
