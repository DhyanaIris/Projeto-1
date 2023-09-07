const express = require('express');
const app = express();
const authenticator = require('./middlewares/authenticator');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', express.static('index.html'));
app.use('/login', express.static('login.html'));
app.use('/admin', express.static('admin.html'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html')
})

// Usa o middleware de autenticação
app.post('/login', authenticator, (req, res) => { 
  res.redirect('/admin'); 
});

app.get('/admin', (req, res) => {
  res.send('Página do Admin');
});

app.listen(3000, function() {
  console.log("Servidor online na porta 3000");
})