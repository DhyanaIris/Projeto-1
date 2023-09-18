const express = require('express');
const router = express.Router();
const loginRouter = require('./loginRouter');
const adminRouter = require('./adminRouter');
const articleRouter = require('./articleRouter');
const searchRouter = require('./searchRouter');
const userRouter = require('./userRouter');

router.use(express.json())
router.use('/login', loginRouter);
router.use('/admin', adminRouter);
router.use('/searchResults', searchRouter);
router.use('/article', articleRouter);
router.use('/users', userRouter);


module.exports = router;