const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcrypt')

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
async function login(req, res, next) {
  const { username, password } = req.body;
  // Verifica se o usuário e a senha correspondem a um usuário no JSON
  const user = users.find((user) => user.author_user === username);
  if (user && user.author_status === "on") {

    const passwordMatch = await bcrypt.compare(password, user.author_pwd);

    if (passwordMatch) {
      // Senha válida, autenticação bem-sucedida, armazena na sessão
      req.session.authenticated = true;
      req.session.user = user;
      next();
    }
  } else {
    // Credenciais inválidas, redireciona para a página de login
    res.redirect('/login?error=1');
  }
}

module.exports = router;
