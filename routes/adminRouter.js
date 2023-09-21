const express = require("express");
const router = express.Router();
const fs = require("fs");
const requireAuth = require('../middlewares/authenticator');

let articles = []; // Defina a variável articles no escopo do módulo
let users = [];


// Verifique se o arquivo JSON existe e leia os artigos
if (fs.existsSync("./data/articles.json")) {
  try {
    const data = fs.readFileSync("./data/articles.json", "utf8");
    if (data) {
      articles = JSON.parse(data);
    }
  } catch (error) {
    console.error("Erro ao analisar o arquivo JSON:", error);
  }
}

// Verifique se o arquivo JSON de usuários existe e leia os usuários
if (fs.existsSync("./data/users.json")) {
  try {
    const data = fs.readFileSync("./data/users.json", "utf8");
    if (data) {
      users = JSON.parse(data);
    }
  } catch (error) {
    console.error("Erro ao analisar o arquivo JSON de usuários:", error);
  }
}

router.get("/", requireAuth, (req, res) => {
  let user = req.session.user;
  let filteredArticles = [];

  if (user.author_level === "admin") {
    // Se o usuário for admin, exiba todos os artigos
    filteredArticles = articles;
  } else {
    // Caso contrário, exiba apenas os artigos do usuário logado
    filteredArticles = articles.filter((article) => article.kb_author_email === user.author_email);
  }
  res.render("admin", { articles: filteredArticles, users, user });
});



module.exports = router;
