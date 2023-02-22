const express = require('express');
const app = express();
const port = 3000;

const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
};
const mysql = require('mysql');

app.get('/', async (req, res) => {
    res.send(`<h1>Hello Full Cycle! Greetings from ${(await runQueryPromise(`SELECT * FROM people`))[0].name}</h1>`);
});

app.listen(port, async () => {
    console.log(`Setting up database...`);
    await runQueryPromise(`CREATE TABLE IF NOT EXISTS people (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(50), PRIMARY KEY (id));`);
    await runQueryPromise(`INSERT INTO people (name) values ('Luis');`);
    console.log(`Setup database`);
    console.log(`Running on port ${port}`);
});

async function runQueryPromise(query) {
    const connection = mysql.createConnection(config);
    const results = await new Promise(resolve => {
        connection.query(query, (_, results) => resolve(results));
    });
    connection.end();
    return results;
}
