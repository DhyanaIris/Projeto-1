const fs = require('fs');

function updateLikeCount(req, res, next) {
    const articleId = req.params.id; 
  
    let articlesData = [];
    try {
      const data = fs.readFileSync('./data/articles.json', 'utf8');
      articlesData = JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar os artigos:', error);
      return res.status(500).send('Erro interno do servidor');
    }
  
    // Encontra o artigo com base no ID
    const article = articlesData.find((article) => article.kb_id === articleId);
  
    if (!article) {
      return res.status(404).send('Artigo não encontrado');
    }
  
    article.kb_liked_count += 1;
  
    try {
      fs.writeFileSync('./data/articles.json', JSON.stringify(articlesData, null, 2));
    } catch (error) {
      console.error('Erro ao salvar os artigos:', error);
      return res.status(500).send('Erro interno do servidor');
    }

    next();
  }
  
  module.exports = updateLikeCount;
  