const express = require("express");
const router = express.Router();
const fs = require("fs");
const requireAuth = require('../middlewares/authenticator');

let articles = []; // Define a variável articles no escopo do módulo
let users = [];


// Verifica se o arquivo JSON existe e le os artigos
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

// Verifica se o arquivo JSON de usuários existe e le os usuários
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
    // Se o usuário for admin, exibe todos os artigos
    filteredArticles = articles;
  } else {
    // Se não for admin exibe apenas os artigos do usuário logado
    filteredArticles = articles.filter((article) => article.kb_author_email === user.author_email);
  }
  res.render("admin", { articles: filteredArticles, users, user });
});



module.exports = router;
