'use strict';

var http = require('http');
var express = require('express');
var path = require('path');
var THREE = require('three');
var OIMO = require('oimo');

var app = express();
app.use(express.static('public'));
console.log
app.get('/', (req, res) => {
    res.sendFile('index.html', {root : __dirname});
});

app.get('/three.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/three/build/three.js');
});

app.get('/oimo.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/oimo/build/oimo.js');
});

app.get('/demo.js', function(req, res) {
    res.sendFile(__dirname + '/oimoJS/examples/js/demo.js');
});

app.get('/orbitControls.js', function(req, res) {
    res.sendFile(__dirname + '/oimoJS/examples/js/controls/OrbitControls.js');
});

app.get('/demo.css', function(req, res) {
    res.sendFile(__dirname + '/oimoJS/examples/css/demo.css');
});

app.listen(53158, () => console.log('The server is up and running...'));