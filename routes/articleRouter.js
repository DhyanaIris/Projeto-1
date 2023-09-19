const express = require("express");
const router = express.Router();
const fs = require('fs');
const uuid = require("uuid");
const upload = require('../middlewares/multer')
const updateLikeCount = require('../middlewares/liked_counter');
const requireAuth = require('../middlewares/authenticator');


router.get("/createArticle", requireAuth, (req, res) => {
  let user = req.session.user;
  res.render("createArticle", { req, user });
});

router.post("/createArticle", requireAuth, upload.single('kb_image'),(req, res) => {
    // Receba os dados do formulário
    const novoArtigo = req.body;
  
    novoArtigo.kb_author = req.session.user.author_name;
    novoArtigo.kb_id = uuid.v4();
    novoArtigo.kb_liked_count = 0;
    novoArtigo.kb_published_date = new Date().toLocaleDateString();
    novoArtigo.kb_published = true;
    if (req.body.kb_featured === "true") {
      novoArtigo.kb_featured = true;
    } else {
      novoArtigo.kb_featured = false;
    }

    //Verifica se tem uma imagem para salvar
    if (req.file) {
      novoArtigo.kb_image = `../img/${req.file.filename}`;
    }
  
    const artigoOrdenado = ordenarProps(novoArtigo);
  
    // Carregue os artigos existentes (se houver)
    let articles = [];
    if (fs.existsSync("./data/articles.json")) {
      try {
        const data = fs.readFileSync("./data/articles.json", "utf8");
        articles = JSON.parse(data);
      } catch (error) {
        console.error("Erro ao analisar o arquivo JSON:", error);
      }
    }
    // Adicione o novo artigo à lista de artigos
    articles.push(artigoOrdenado);
  
    // Salva a lista de artigos no arquivo JSON
    fs.writeFileSync("./data/articles.json", JSON.stringify(articles, null, 2));
  
    // Redireciona de volta para pagina de cadastro
    res.redirect("/article/createArticle");
  });
  
  // Atualiza o contador de like do artigo
  router.post('/like/:id', updateLikeCount, (req, res) => {
    const articleId = req.params.id;
    res.redirect(`/article/${articleId}`);
  });
  
router.get('/:id', (req, res) => {
      const articleId = req.params.id;
      let articlesData = [];
      let user = req.session.user;
    
      const data = fs.readFileSync('./data/articles.json', 'utf8');
      articlesData = JSON.parse(data);
    
      // Encontre o artigo com base no ID
      const article = articlesData.find((article) => article.kb_id === articleId);
    
      if (!article) {
        return res.status(404).send('Artigo não encontrado');
      }
      res.render('article', { article, user });
});

router.get("/updateArticle/:kb_id", requireAuth, (req, res) => {
  const kbId = req.params.kb_id;
  let articleUpdate = null;
  let user = req.session.user;

  // Verifique se o arquivo JSON existe
  if (fs.existsSync("./data/articles.json")) {
    try {
      // Leia o arquivo JSON apenas se ele não estiver vazio
      const data = fs.readFileSync("./data/articles.json", "utf8");

      if (data) {
        const articles = JSON.parse(data);

        // Encontre o artigo com base no kb_id
        articleUpdate = articles.find((article) => article.kb_id === kbId);
      }
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON:", error);
    }
  }

  // Renderize a página de atualização do artigo com as informações atuais
  res.render("updateArticle", { articleUpdate, user });
});

// Defina a rota para lidar com a atualização do artigo
router.post("/updateArticle/:kb_id", requireAuth, upload.single('kb_image'), (req, res) => {
  const kbId = req.params.kb_id;
  const updatedArticle = req.body;

  // Verifique se o arquivo JSON existe
  if (fs.existsSync("./data/articles.json")) {
    try {
      // Leia o arquivo JSON
      const data = fs.readFileSync("./data/articles.json", "utf8");
      let articles = JSON.parse(data);

      // Encontre o artigo a ser atualizado pelo kb_id
      const foundArticleIndex = articles.findIndex((article) => article.kb_id === kbId);

      if (foundArticleIndex !== -1) {
        const foundArticle = articles[foundArticleIndex];

        // Atualize as propriedades do artigo com base nos dados recebidos
        foundArticle.kb_title = updatedArticle.kb_title;
        foundArticle.kb_summary = updatedArticle.kb_summary;
        foundArticle.kb_body = updatedArticle.kb_body;
        foundArticle.kb_keywords = updatedArticle.kb_keywords;
        foundArticle.kb_author_email = updatedArticle.kb_author_email;
        foundArticle.kb_featured = updatedArticle.kb_featured === 'true';
        
        // Verifique se uma nova imagem foi enviada
        if (req.file) {
          foundArticle.kb_image = `../img/${req.file.filename}`;
        }

        // Salve o artigo atualizado de volta à lista
        articles[foundArticleIndex] = foundArticle;

        // Salve os artigos atualizados no arquivo JSON (substituindo o arquivo antigo)
        fs.writeFileSync("./data/articles.json", JSON.stringify(articles, null, 2));
      }
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON:", error);
    }
  }

  // Redirecione de volta para a página de administração ou para a página de leitura do artigo atualizado
  res.redirect('/admin');
});

router.get("/delete/:kb_id", requireAuth, (req, res) => {
  const kbId = req.params.kb_id;

  // Verifique se o arquivo JSON existe
  if (fs.existsSync("./data/articles.json")) {
    try {
      // Leia o arquivo JSON apenas se ele não estiver vazio
      const data = fs.readFileSync("./data/articles.json", "utf8");

      if (data) {
        let articles = JSON.parse(data);

        // Encontre o índice do artigo a ser excluído
        const articleIndex = articles.findIndex((article) => article.kb_id === kbId);

        if (articleIndex !== -1) {
          // Remova o artigo da lista de artigos
          articles.splice(articleIndex, 1);

          // Salve a lista de artigos atualizada no arquivo JSON (sem o artigo excluído)
          fs.writeFileSync("./data/articles.json", JSON.stringify(articles, null, 2));
        }
      }
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON:", error);
    }
  }

  // Redirecione de volta para a página de administração após a exclusão
  res.redirect('/admin');
});


function ordenarProps(obj) {
  const objOrdenado = {};
  objOrdenado.kb_id = obj.kb_id;
  objOrdenado.kb_title = obj.kb_title;
  objOrdenado.kb_summary = obj.kb_summary;
  objOrdenado.kb_body = obj.kb_body;
  objOrdenado.kb_keywords = obj.kb_keywords;
  objOrdenado.kb_author_email = obj.kb_author_email;
  objOrdenado.kb_published_date = obj.kb_published_date;
  objOrdenado.kb_published = obj.kb_published;
  objOrdenado.kb_author = obj.kb_author;
  objOrdenado.kb_liked_count = obj.kb_liked_count;
  objOrdenado.kb_featured = obj.kb_featured;
  objOrdenado.kb_image = obj.kb_image;
  return objOrdenado;
}


module.exports = router;
