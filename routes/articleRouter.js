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
    // Recebe os dados do formulário
    const novoArtigo = req.body;
  
    novoArtigo.kb_author_id = req.session.user.author_id;
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
  
    // Carrega os artigos existentes (se houver)
    let articles = [];
    if (fs.existsSync("./data/articles.json")) {
      try {
        const data = fs.readFileSync("./data/articles.json", "utf8");
        articles = JSON.parse(data);
      } catch (error) {
        console.error("Erro ao analisar o arquivo JSON:", error);
      }
    }
    // Adiciona o novo artigo à lista de artigos
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
    
      // Encontra o artigo com base no ID
      const article = articlesData.find((article) => article.kb_id === articleId);
    
      if (!article) {
        return res.status(404).send('Artigo não encontrado');
      }
      res.render('article', { article, user });
});

router.get("/updateArticle/:kb_id", requireAuth, (req, res) => {
  const kbId = req.params.kb_id;
  let user = req.session.user;

  // Verifica se o arquivo JSON existe
  if (fs.existsSync("./data/articles.json")) {
    try {
      // Lê o arquivo JSON apenas se ele não estiver vazio
      const data = fs.readFileSync("./data/articles.json", "utf8");

      if (data) {
        const articles = JSON.parse(data);

        // Encontra o artigo com base no ID
        const articleUpdate = articles.find((article) => article.kb_id === kbId);

        if (articleUpdate) {
          // Verifica se o usuário é o autor do artigo ou se é um administrador
          if (user.author_id === articleUpdate.kb_author_id || user.author_level === 'admin') {
            // Se usuário tem permissão para editar o artigo, renderiza a página de edição
            res.render("updateArticle", { articleUpdate, user });
          } else {
            // Se o usuário não tem permissão para editar o artigo, exibe uma mensagem de erro
            res.status(403).send("Permissão negada");
          }
        } else {
          // Artigo não encontrado, exibe uma mensagem de erro
          res.status(404).send("Artigo não encontrado");
      }
    }
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON:", error);
    }
  }
});

// Define a rota para lidar com a atualização do artigo
router.post("/updateArticle/:kb_id", requireAuth, upload.single('kb_image'), (req, res) => {
  const kbId = req.params.kb_id;
  const updatedArticle = req.body;
  let user = req.session.user

  // Verifica se o arquivo JSON existe
  if (fs.existsSync("./data/articles.json")) {
    try {
      // Lê o arquivo JSON
      const data = fs.readFileSync("./data/articles.json", "utf8");
      let articles = JSON.parse(data);

      // Encontra o artigo a ser atualizado pelo ID
      const foundArticleIndex = articles.findIndex((article) => article.kb_id === kbId);

      if (foundArticleIndex !== -1) {
        const foundArticle = articles[foundArticleIndex];

        if (user.author_id === foundArticle.kb_author_id || user.author_level === 'admin') {
          
          foundArticle.kb_title = updatedArticle.kb_title;
          foundArticle.kb_summary = updatedArticle.kb_summary;
          foundArticle.kb_body = updatedArticle.kb_body;
          foundArticle.kb_keywords = updatedArticle.kb_keywords;
          foundArticle.kb_author_email = updatedArticle.kb_author_email;
          foundArticle.kb_featured = updatedArticle.kb_featured === 'true';
        
        // Verifica se uma nova imagem foi enviada
        if (req.file) {
          foundArticle.kb_image = `../img/${req.file.filename}`;
        }
      }

        // Salva o artigo atualizado de volta à lista
        articles[foundArticleIndex] = foundArticle;

        // Salva os artigos atualizados no arquivo JSON (substituindo o arquivo antigo)
        fs.writeFileSync("./data/articles.json", JSON.stringify(articles, null, 2));
      }
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON:", error);
    }
  }

  // Redireciona de volta para a página de administração
  res.redirect('/admin');
});

router.get("/delete/:kb_id", requireAuth, (req, res) => {
  const kbId = req.params.kb_id;

  // Verifica se o arquivo JSON existe
  if (fs.existsSync("./data/articles.json")) {
    try {
      // Lê o arquivo JSON apenas se ele não estiver vazio
      const data = fs.readFileSync("./data/articles.json", "utf8");

      if (data) {
        let articles = JSON.parse(data);

        // Encontra o índice do artigo a ser excluído
        const articleIndex = articles.findIndex((article) => article.kb_id === kbId);

        if (articleIndex !== -1) {
          // Remove o artigo da lista de artigos
          articles.splice(articleIndex, 1);

          // Salva a lista de artigos atualizada no arquivo JSON (sem o artigo excluído)
          fs.writeFileSync("./data/articles.json", JSON.stringify(articles, null, 2));
        }
      }
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON:", error);
    }
  }

  // Redireciona de volta para a página de administração após a exclusão
  res.redirect('/admin');
});


function ordenarProps(obj) {
  const objOrdenado = {};
  objOrdenado.kb_author = obj.kb_author;
  objOrdenado.kb_author_id = obj.kb_author_id;
  objOrdenado.kb_id = obj.kb_id;
  objOrdenado.kb_title = obj.kb_title;
  objOrdenado.kb_summary = obj.kb_summary;
  objOrdenado.kb_body = obj.kb_body;
  objOrdenado.kb_keywords = obj.kb_keywords;
  objOrdenado.kb_author_email = obj.kb_author_email;
  objOrdenado.kb_published_date = obj.kb_published_date;
  objOrdenado.kb_published = obj.kb_published;
  objOrdenado.kb_liked_count = obj.kb_liked_count;
  objOrdenado.kb_featured = obj.kb_featured;
  objOrdenado.kb_image = obj.kb_image;
  return objOrdenado;
}


module.exports = router;
