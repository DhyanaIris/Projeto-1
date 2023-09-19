const express = require('express');
const session = require('cookie-session');
const app = express();
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const routes = require('./routes')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "secret-key",
  resave: true,
  saveUninitialized: true,
  cookie: {
      maxAge: 24 * 60 * 60 * 1000
  },
}));

app.use('/', routes)
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
  let user = req.session.user;

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
  res.render('home', {likedArticles, featuredArticles, user});
})


app.listen(3000, function() {
  console.log("Servidor online na porta 3000");
})




// Rodar servidor npx nodemon app.js