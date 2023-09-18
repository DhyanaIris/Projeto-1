const fs = require('fs');

function loadUsers() {
  try {
    const data = fs.readFileSync('./data/users.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar os usuários:', error);
    return []; // Retorna um array vazio em caso de erro
  }
}

function authenticateUser(username, password) {
  const users = loadUsers();

  // Verifica se as credenciais correspondem a algum usuário no JSON
  const authenticatedUser = users.find(
    (user) => user.author_user === username && user.author_pwd === password
  );

  return authenticatedUser;
}

module.exports = authenticateUser;
