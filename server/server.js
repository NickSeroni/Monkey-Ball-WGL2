'use strict';

var http = require('http');
var express = require('express');
var path = require('path');

var app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', {root : __dirname});
});

app.listen(53158, () => console.log('The server is up and running...'));
