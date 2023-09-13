const express = require('express');
const app = express();
const fs = require('fs');
const authenticator = require('./middlewares/authenticator');
const ejs = require('ejs');
const path = require('path');
const uuid = require('uuid');
const updateLikeCount = require('./middlewares/liked_counter');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
// app.use(express.static('views'));
// app.use('/', express.static('index.html'));
// app.use('/login', express.static('login.html'));
// app.use('/createArticle', express.static('createArticle.html'));
// app.use('/admin', express.static('admin.html'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './public/views'));


app.get('/', (req, res) => {
  let likedArticles = [];
  let featuredArticles = [];
  if(fs.existsSync('./data/articles.json')){
    try{
      const data = fs.readFileSync('./data/articles.json', 'utf8');
      likedArticles = JSON.parse(data);
      featuredArticles = JSON.parse(data);

      likedArticles.sort((a, b) => b.kb_liked_count - a.kb_liked_count);
    } catch(error) {
      console.error('Erro ao analisar o arquivo JSON', error);
    }
  }
  res.render('home', {likedArticles, featuredArticles});
})

app.get('/createArticle', (req, res) => {
  res.sendFile(__dirname + '/public/views/createArticle.html')
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/views/login.html')
})

// Usa o middleware de autenticação
app.post('/login', authenticator, (req, res) => { 
  res.redirect('public/views/admin.html'); 
});

app.get('/admin', (req, res) => {
  res.send('Página do Admin');
});

app.listen(3000, function() {
  console.log("Servidor online na porta 3000");
})

function ordenarProps(obj) {
  const objOrdenado = {};
  objOrdenado.kb_id = obj.kb_id;
  objOrdenado.kb_title = obj.kb_title;
  objOrdenado.kb_summary = obj.kb_summary;
  objOrdenado.kb_body = obj.kb_body;
  objOrdenado.kb_keywords = obj.kb_keywords;
  objOrdenado.kb_author_email = obj.kb_author_email;
  objOrdenado.kb_permalink = obj.kb_permalink;
  objOrdenado.kb_published_date = obj.kb_published_date;
  objOrdenado.kb_published = obj.kb_published;
  objOrdenado.kb_suggestion = obj.kb_suggestion;
  objOrdenado.kb_liked_count = obj.kb_liked_count;
  objOrdenado.kb_featured = obj.kb_featured;
  return objOrdenado;
}


app.post('/cadastro', (req, res) => {
  // Receba os dados do formulário
  const novoArtigo = req.body;

  novoArtigo.kb_id = uuid.v4();
  novoArtigo.kb_permalink = novoArtigo.kb_title;
  novoArtigo.kb_liked_count = 0;
  novoArtigo.kb_published_date = new Date().toLocaleDateString();
  novoArtigo.kb_published = true; 
  novoArtigo.kb_suggestion = true; 
  if (req.body.kb_featured === 'true') {
    novoArtigo.kb_featured = true;
  } else {
    novoArtigo.kb_featured = false;
  }

  const artigoOrdenado = ordenarProps(novoArtigo);

  // Carregue os artigos existentes (se houver)
  let articles = [];
  if (fs.existsSync('./data/articles.json')) {
    try {
      const data = fs.readFileSync('./data/articles.json', 'utf8');
      articles = JSON.parse(data);
    } catch (error) {
      console.error('Erro ao analisar o arquivo JSON:', error);
    }
  }
  // Adicione o novo artigo à lista de artigos
  articles.push(artigoOrdenado);

  // Salva a lista de artigos no arquivo JSON
  fs.writeFileSync('./data/articles.json', JSON.stringify(articles,null, 2));

  // Redireciona de volta para pagina de cadastro
  res.redirect('/createArticle');
  });



//Renderiza artigo com base no ID
app.get('/article/:id', (req, res) => {
  const articleId = req.params.id;
  let articlesData = [];

  const data = fs.readFileSync('./data/articles.json', 'utf8');
  articlesData = JSON.parse(data);

  // Encontre o artigo com base no ID
  const article = articlesData.find((article) => article.kb_id === articleId);

  if (!article) {
    return res.status(404).send('Artigo não encontrado');
  }
  res.render('article', { article });
});


// Atualiza o contador de like do artigo
app.post('/article/like/:id', updateLikeCount, (req, res) => {
  const articleId = req.params.id;
  res.redirect(`/article/${articleId}`);
});


// Rodar servidor npx nodemon app.js