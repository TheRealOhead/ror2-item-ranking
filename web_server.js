const http    = require('http');
const fs      = require('fs');
const url     = require('url');

const databasePath = './database.json'
const itemListPath = './items.json';

const allowedFiles = [
    '/',
    '/index.html',
    '/rankings.html',

    '/style.css',
    '/mobile_style.css',

    '/survivor_data.json',
    '/items.json',
    '/magic_bytes.json',
    '/database.json',

    '/common_functions.js',

    '/Bombardier.ttf',
]

// Allow background images
for (let i = 0; i < 12; i++) {
    allowedFiles.push(`/images/${i}.png`);
}

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.ttf': 'font/ttf',
};

// Get list of items
let itemList = JSON.parse(fs.readFileSync(itemListPath));

// Check for database file
if (!fs.existsSync(databasePath)) {

    let database = {
        items: {

        },
        survivors: {

        },
        loadoutPerSurvivor: {

        }
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

    console.log(`Path "${path}" requested by "${req.socket.remoteAddress}"`);

    // Simple routing for different endpoints
    if (path === '/submit' && req.method === 'POST') {
        

        //req.socket.remoteAddress;



        let body = '';

        // Collect POST data
        req.on('data', chunk => {
            body += chunk.toString();
        });


        req.on('end', () => {
            body = JSON.parse(body);
            
            console.log(body);
            
            let itemName = body.itemName;

            if (!Object.keys(itemList).includes(itemName)) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('No such item: ' + itemName);
                return;
            }


            // Insert data into the database
            let database = JSON.parse(fs.readFileSync(databasePath));
            let loadout = [...new Set(body.loadout)]; // MUL-T and Captain can have two of the same ability, don't wanna count it twice
            // Write default values
            database['survivors'][body.survivor] = database['survivors'][body.survivor] || {};
            database['loadoutPerSurvivor'][body.survivor] = database['loadoutPerSurvivor'][body.survivor] || {};
            loadout.forEach(ability=>{
                database['loadoutPerSurvivor'][body.survivor][ability] = database['loadoutPerSurvivor'][body.survivor][ability] || {};
            })
            // Write values
            database['items'][itemName]++; // Total
            database['survivors'][body.survivor][itemName] = database['survivors'][body.survivor][itemName] + 1 || 1; // Per survivor
            loadout.forEach(ability=>{ // Per survivor ability
                database['loadoutPerSurvivor'][body.survivor][ability][itemName] = database['loadoutPerSurvivor'][body.survivor][ability][itemName] + 1 || 1;
            })
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
server.listen(80, () => {
    console.log('Server is listening on port 80');
});

// Graceful shutdown
process.on('SIGINT', () => {
    process.exit(0);
});