const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  fs.readFile('index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading file');
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
}).listen(port);