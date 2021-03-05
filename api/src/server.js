const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const cfg = require('../config');

const { enacanddecRouter } = require('./routes/encanddec');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json());

app.use('/gpg', enacanddecRouter);

module.exports = app;
