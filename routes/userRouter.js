const express = require("express");
const router = express.Router();
const fs = require('fs');
const uuid = require("uuid");
const requireAuth = require('../middlewares/authenticator');


// Rota para exibir o formulário de cadastro de usuário
router.get("/signup", requireAuth, (req, res) => {
  let user = req.session.user;
  res.render("signup", user); 
});

// Rota para lidar com o envio do formulário de cadastro de usuário
router.post("/signup", requireAuth, (req, res) => {
  // Receba os dados do formulário
  const novoUsuario = req.body;

  novoUsuario.author_level = "admin";
  novoUsuario.author_status = true;

  // Gere um ID único para o novo usuário
  novoUsuario.author_id = uuid.v4();

  // Verifique se o arquivo JSON de usuários existe
  if (fs.existsSync("./data/users.json")) {
    try {
      const data = fs.readFileSync("./data/users.json", "utf8");
      users = JSON.parse(data);

    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON de usuários:", error);
    }
  }

   // Ordene as propriedades do novo usuário
   const usuarioOrdenado = ordenarPropsUsuario(novoUsuario);

  // Adicione o novo usuário à lista de usuários
  users.push(usuarioOrdenado);

  // Salve a lista de usuários no arquivo JSON
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));

  // Redirecione de volta para a página de cadastro de usuário ou para onde desejar
  res.redirect("/users/signup");
  
});


// Rota para exibir a página de edição de usuário
router.get('/edit/:author_id', requireAuth, (req, res) => {
  let user = req.session.user;
  const authorId = req.params.author_id;

  // Lê o arquivo JSON de usuários
  fs.readFile("./data/users.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON de usuários:", err);
      res.status(500).send("Erro interno do servidor");
      return;
    }
    
    try {
      // Analisa o arquivo JSON em um array de objetos de usuário
      const users = JSON.parse(data);
      
      // Encontre o usuário com base no author_id
      const author = users.find((author) => author.author_id === authorId);

      if (!user) {
        // Usuário não encontrado, você pode lidar com isso da maneira que preferir
        res.status(404).send("Usuário não encontrado");
        return;
      }
      
      // Renderiza a página de edição de usuário com o objeto de usuário encontrado
      res.render('editUser', { author, user });
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON de usuários:", error);
      res.status(500).send("Erro interno do servidor");
    }
  });
});

// Rota para lidar com a atualização do usuário
router.post("/edit/:author_id", (req, res) => {
  const authorId = req.params.author_id;
  const updatedUser = req.body;
  
  // Lê o arquivo JSON de usuários
  fs.readFile("./data/users.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON de usuários:", err);
      res.status(500).send("Erro interno do servidor");
      return;
    }
    
    try {
      // Analisa o arquivo JSON em um array de objetos de usuário
      const users = JSON.parse(data);
      
      // Encontra o índice do usuário com base no author_id
      const userIndex = users.findIndex((user) => user.author_id === authorId);
      
      if (userIndex === -1) {
        // Usuário não encontrado, você pode lidar com isso da maneira que preferir
        res.status(404).send("Usuário não encontrado");
        return;
      }
      
      // Obtém o usuário encontrado no índice
      const foundUser = users[userIndex];

      // Atualiza apenas as propriedades especificadas no formulário de edição
      foundUser.author_id = updatedUser.author_id || foundUser.author_id;
      foundUser.author_name = updatedUser.author_name || foundUser.author_name;
      foundUser.author_email = updatedUser.author_email || foundUser.author_email;
      foundUser.author_user = updatedUser.author_user || foundUser.author_user;
      foundUser.author_pwd = updatedUser.author_pwd || foundUser.author_pwd;
      foundUser.author_status = updatedUser.author_status === 'true';      
      
      // Salva o array de usuários de volta no arquivo JSON
      fs.writeFile("./data/users.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error("Erro ao salvar o arquivo JSON de usuários:", err);
          res.status(500).send("Erro interno do servidor");
          return;
        }
        
        // Redireciona de volta para a página de admin ou para onde desejar
        res.redirect("/admin");
      });
    } catch (error) {
      console.error("Erro ao analisar o arquivo JSON de usuários:", error);
      res.status(500).send("Erro interno do servidor");
    }
  });
});

router.get("/read/:id", (req,res) => {
  const userId = req.params.id;
  let user = null;
  
  // Verifique se o arquivo JSON existe
  if (fs.existsSync("./data/users.json")) {
    try {
      // Leia o arquivo JSON apenas se ele não estiver vazio
      const data = fs.readFileSync("./data/users.json", "utf8");
      
      if (data) {
        const users = JSON.parse(data);
        
        // Encontre o artigo com base no kb_id
        user = users.find((findUser) => findUser.author_id === userId);
    }
  } catch (error) {
    console.error("Erro ao analisar o arquivo JSON:", error);
  }
}

if (!user) {
  // Se o usuário não for encontrado, envie uma resposta de erro
  res.status(404).send("Usuário não encontrado");
} else {
  // Se o usuário for encontrado, renderize a página de visualização do usuário
  res.render("user", { user });
}
})


function ordenarPropsUsuario(obj) {
    const objOrdenado = {};
    objOrdenado.author_id = obj.author_id;
    objOrdenado.author_name = obj.author_name;
    objOrdenado.author_email = obj.author_email;
    objOrdenado.author_user = obj.author_user;
    objOrdenado.author_pwd = obj.author_pwd;
    objOrdenado.author_level = obj.author_level;
    objOrdenado.author_status = obj.author_status;
    return objOrdenado;
}



module.exports = router;
