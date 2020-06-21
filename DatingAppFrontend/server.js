// Importing dependencies
const express = require('express');
var path = require('path');

var PORT = process.env.PORT || 8081;

// Starting Express app
const app = express();

// Set the base path to the HappyNewsFrontEnd dist folder (folder created with cmd: ng build --prod)
app.use(express.static(path.join(__dirname, 'dist/dating-app-project')));

// Any routes will be redirected to the angular app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/dating-app-project/index.html'));
});

// Starting server on PORT
app.listen(PORT, () => {
  console.log('Server started!');
  console.log('on port ' + PORT);
});
