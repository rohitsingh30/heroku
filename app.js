const express = require('express');
const app = express();
const pool = require('./db');
const jwt = require('jsonwebtoken');

// pool.query('CREATE TABLE todo(todo_id SERIAL PRIMARY KEY,description VARCHAR(255))');

let port = process.env.PORT || 3000

app.use(express.json());

app.post('/api/post', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created...',
                authData
            });
        }
    });
});

app.post('/api/login', (req, res) => {
    // Mock user
    const user = {
        id: 1,
        username: 'brad',
        email: 'brad@gmail.com'
    }

    jwt.sign({ user }, 'secretkey', { expiresIn: '30s' }, (err, token) => {
        res.json({
            token
        });
    });
});

function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}

app.get('/', (req, res) => {
    res.sendFile('./views/index.html', { root: __dirname })
    // res.send('<p>Home</p>');
});

app.get('/all_todo', async (req, res) => {
    try {
        const allTodo = await pool.query('SELECT * FROM todo');
        res.json(allTodo.rows);
    }
    catch (err) {
        console.log(err.message)
    }
});

app.get('/all_todo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const todo = await pool.query('SELECT * FROM todo WHERE todo_id = $1', [id]);
        res.json(todo.rows);
    }
    catch (err) {
        console.log(err.message)
    }
});

app.put('/all_todo/:id', async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    try {
        const updatetodo = await pool.query('UPDATE todo SET description = $1 WHERE todo_id= $2', [description, id]);
        res.json('TODO Updated');
    }
    catch (err) {
        console.log(err.message)
    }
});

app.delete('/all_todo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletetodo = await pool.query('DELETE FROM todo WHERE todo_id= $1', [id]);
        res.json('TODO was deleted');
    }
    catch (err) {
        console.log(err.message)
    }
});


app.post('/todo', async (req, res) => {
    try {
        const { description } = req.body;
        const newTodo = await pool.query('INSERT INTO todo (description) VALUES ($1)', [description]);
        res.json(newTodo.rows[0])
    }
    catch (err) {
        console.log(err.message)
    }
});



app.listen(port, () => {
    console.log('Started')
})
