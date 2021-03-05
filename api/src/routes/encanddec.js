const express = require('express');
const GPGService = require('../services/gpgService');

const router = express.Router();

router.post('/encrypt', async (req, res) => {
  const gpgService = new GPGService();
  const result = await gpgService.encrypt(req.body);
  res.status(result.status).send(result.body);
});

router.post('/decrypt', async (req, res) => {
  const gpgService = new GPGService();
  const result = await gpgService.decrypt(req.body);
  res.status(result.status).send(result.body);
});

module.exports = { enacanddecRouter: router };
