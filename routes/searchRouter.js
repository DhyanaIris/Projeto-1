const express = require("express");
const router = express.Router();
const fs = require('fs');


router.get("/", (req, res) => {
    const keywords = req.query.keywords; // Obtém as palavras-chave da consulta
    const results = performSearch(keywords); // Realiza a pesquisa
  
    // Renderiza a página de resultados da pesquisa
    res.render('searchResults', { results });
});

// Função para realizar a pesquisa
function performSearch(keywords) {
    // Carregue os dados do arquivo JSON que contém os artigos
    const data = fs.readFileSync('./data/articles.json', 'utf8');
    const articles = JSON.parse(data);

     // Converter as palavras-chave e os textos do artigo para letras minúsculas
    const lowercaseKeywords = keywords.toLowerCase();
  
    // Realize a pesquisa com base nas palavras-chave
    const results = articles.filter((article) => {

    // Converter os campos do artigo para letras minúsculas para comparação
    const lowercaseTitle = article.kb_title.toLowerCase();
    const lowercaseSummary = article.kb_summary.toLowerCase();


      return (
        lowercaseTitle.includes(lowercaseKeywords) ||
      lowercaseSummary.includes(lowercaseKeywords)
      );
    });
  
    return results;
}

module.exports = router;
