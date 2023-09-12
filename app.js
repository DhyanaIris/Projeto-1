const express = require('express');
const app = express();
const fs = require('fs');
const authenticator = require('./middlewares/authenticator');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
// app.use(express.static('views'));
// app.use('/', express.static('index.html'));
// app.use('/login', express.static('login.html'));
// app.use('/createArticle', express.static('createArticle.html'));
// app.use('/admin', express.static('admin.html'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/home.html')
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


app.post('/cadastro', (req, res) => {
  // Receba os dados do formulário
  const novoArtigo = req.body;

  novoArtigo.kb_liked_count = 0;
  novoArtigo.kb_published = true; 
  novoArtigo.kb_suggestion = true; 
  novoArtigo.kb_featured = true;

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
  articles.push(novoArtigo);
  // Salva a lista de artigos no arquivo JSON
  fs.writeFileSync('./data/articles.json', JSON.stringify(articles,null, 2));

  // Redireciona de volta para pagina de cadastro
  res.redirect('/createArticle');
  });

// Rodar servidor npx nodemon app.js

