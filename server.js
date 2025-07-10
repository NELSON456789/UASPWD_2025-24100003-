const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const mysql = require('mysql2');

// Folder public berisi file HTML, CSS, JS
const publicDir = path.join(__dirname, 'public');
const PORT = 3000;

// Koneksi ke database MySQL (phpMyAdmin)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gurules_id'
});

db.connect((err) => {
    if (err) {
        console.error("Koneksi database gagal");
        process.exit();
    }
    console.log("Koneksi ke database berhasil!");
});

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const filePath = req.url === '/' ? '/index.html' : req.url;
        const fullPath = path.join(publicDir, filePath);

        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(404);
                return res.end('File not found');
            }

            const ext = path.extname(fullPath);
            const contentType =
                ext === '.css' ? 'text/css' :
                ext === '.js' ? 'text/javascript' :
                ext === '.html' ? 'text/html' : 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });

    } else if (req.method === 'POST' && req.url === '/contact') {
        let body = '';

        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const parsed = parse(body);
            const { name, email, message } = parsed;

            const sql = 'INSERT INTO contacts (name, email, tutors, message) VALUES (?, ?, ?, ?)';
            db.query(sql, [name, email, tutors, message], (err) => {
                if (err) {
                    console.log("Gagal tersimpan ke DB");
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end("Gagal menyimpan data");
                }

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                return res.end("Data Anda telah tersimpan!");
            });
        });

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));