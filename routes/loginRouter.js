const express = require("express");
const router = express.Router();
const fs = require('fs');

const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", login, (req,res) =>{
  res.redirect("/admin");
})

router.get("/logout", (req,res) => {
   // Destrói a sessão do usuário
   req.session = null;
   res.redirect('/login');
})

// Autenticação
function login(req, res, next) {
  const { username, password } = req.body;
  // Verifica se o usuário e a senha correspondem a um usuário no JSON
  const user = users.find((user) => user.author_user === username && user.author_pwd === password);
  if (user && user.author_status === "on") {
    // Autenticação bem-sucedida, armazena na sessão
    req.session.authenticated = true;
    req.session.user = user;
    next();
  } else {
    // Credenciais inválidas, redireciona para a página de login
    res.redirect('/login?error=1');
  }
}

module.exports = router;
