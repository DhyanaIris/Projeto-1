const express = require("express");
const router = express.Router();
const authenticator = require("../middlewares/authenticator");

router.get("/", (req, res) => {
  res.render("login");
});

// Usa o middleware de autenticação
router.post("/", authenticator, (req, res) => {
  res.redirect("public/views/admin.ejs");
});

module.exports = router;
