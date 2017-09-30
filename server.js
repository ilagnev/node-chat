const http = require('http');
const chatServer = require('./libs/chat-server');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
let cache = {};

const server = http.createServer();

// listen request event and response with file from 'public' dir
// or return 404 page
server.on('request', (req, res) => {
    const filePath = './public/' + (req.url == '/' ? 'index.html' : req.url);
    //console.log('request: ' + req.url + '\n' + 'path: ' + filePath + '\n');

    fs.exists(filePath, exist => {
        exist ? sendFile(res, filePath) : send404(res);
    });
});
function sendFile(res, filePath) {
    if (0 && cache[filePath]) {// check cache
        res.writeHead(200, {'Content-type': cache[filePath].mime});
        res.end(cache[filePath].content);
    } else {
        let fileCacheObj = {
            content: ''
        };

        // determine mime type
        fileCacheObj.mime = mime.getType(filePath);
        res.writeHead(200, {'Content-Type': fileCacheObj.mime});

        const fileStream = fs.createReadStream(filePath);
        fileStream.on('data', (chunk) => {
            fileCacheObj.content += chunk;
        });
        // append to cache
        fileStream.on('end', () => {
            //console.log(filePath + ': fully red, add to cache\n');
            cache[filePath] = fileCacheObj;
        });
        // handle error?
        fileStream.on('error', (err) => {
            console.error(err);
        });

        fileStream.pipe(res);
    }
}
function send404(res){
    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.end('error 404: file not found');
}

// listen sockets
chatServer.listen(server);

// start static server
server.listen(3000, () => {
    console.log('sever started: localhost:3000');
});
