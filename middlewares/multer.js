const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img'); // O diretório onde você deseja salvar as imagens
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueFileName = uuid.v4() + ext; // Use um nome único para cada imagem
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });
module.exports = upload;