'use strict';

var http = require('http');
var express = require('express');
var path = require('path');
var THREE = require('three');
var OIMO = require('oimo');

var app = express();

app.use("/", express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile('test.html', {root : __dirname});
});

app.get('/three.module.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/three/build/three.module.js');
});

app.get('/oimo.module.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/oimo/build/oimo.module.js');
});

// app.get('/demo.js', function(req, res) {
//     res.sendFile(__dirname + '/oimoJS/examples/js/demo.js');
// });

app.get('/OrbitControls.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/three/examples/jsm/controls/OrbitControls.js');
});

// app.get('/demo.css', function(req, res) {
//     res.sendFile(__dirname + '/oimoJS/examples/css/demo.css');
// });

app.get('/GLTFLoader.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
});

app.listen(53158, () => console.log('The server is up and running...'));