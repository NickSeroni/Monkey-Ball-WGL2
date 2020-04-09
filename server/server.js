'use strict';

var http = require('http');
var express = require('express');
var path = require('path');

var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!!!');
});

app.listen(53158, () => console.log('The server is up and running...'));
