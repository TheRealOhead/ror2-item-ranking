const http    = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs      = require('fs');
const url     = require('url');

const databasePath = './.data/database.json'
const itemListPath = './items.json';

const allowedFiles = [
    '/',
    '/index.html',
    '/rankings.html',

    '/style.css',

    '/survivor_data.json',
    '/items.json',
    '/magic_bytes.json',
    '/.data/database.json',

    '/common_functions.js',
]

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
};

// Get list of items
let itemList = JSON.parse(fs.readFileSync(itemListPath));

// Check for database file
if (!fs.existsSync(databasePath)) {

    let database = {
        items: {

        },
        totalSubmitions:0
    };

    Object.keys(itemList).forEach(itemName=>{
        database['items'][itemName] = 0;
    })

    fs.writeFileSync(databasePath, JSON.stringify(database));
}



// Create the server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;

    console.log('Path: ' + path)

    // Simple routing for different endpoints
    if (path === '/submit' && req.method === 'POST') {
        let body = '';

        // Collect POST data
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            body = JSON.parse(body);
            let itemName = body.itemName;

            if (!Object.keys(itemList).includes(itemName)) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('No such item: ' + itemName);
                return;
            }


            // Insert data into the database
            let database = JSON.parse(fs.readFileSync(databasePath));
            database['items'][itemName]++;
            fs.writeFileSync(databasePath, JSON.stringify(database));

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Data received and stored');
        });
    } else {

        if (allowedFiles.includes(path) && req.method === 'GET') {

            // Default MIME type to HTML
            let mimeType = mimeTypes[path.substr(path.indexOf('.'))] || mimeTypes['.html'];

            res.writeHead(200, { 'Content-Type': mimeType });

            path = path == '/' ? '/index.html' : path;

            fs.readFile(`.${path}`, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('500: Error loading file');
                } else {
                    res.end(data);
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404: File Not Found');
        }
    }
});

// Start the server
server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

// Graceful shutdown
process.on('SIGINT', () => {
    process.exit(0);
});