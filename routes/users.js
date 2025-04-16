const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([{id: 1, name: '用户1'}, {id: 2, name: '用户2'}]);
});

module.exports = router;