const express = require("express");
const router = express.Router();
const fs = require("fs");

let articles = []; // Defina a variável articles no escopo do módulo

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

router.get("/", (req, res) => {
  res.render("admin", { articles });
});


module.exports = router;
