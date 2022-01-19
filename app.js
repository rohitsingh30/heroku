const express = require('express');
const app = express();
const pool = require('./db');
const jwt = require('jsonwebtoken');

let port = process.env.PORT || 3000

app.use(express.json());

// - POST /api/authenticate should perform user authentication and return a JWT token.

app.post('/api/authenticate', async (req, res) => {

    const user = {
        email1: req.body['email'],
        password1: req.body['password'],
    }

    const email2 = req.body['email'];
    const password2 = req.body['password'];
    const newTodo = await pool.query('SELECT * FROM user_table WHERE email = $1', [email2]);
    if (newTodo.rowCount > 0) {
        message1 = newTodo.rows[0]['token'];
    }
    else {
        message1 = 'User Not There. Please Add';
    }
    res.json({
        message: message1,
    });

});

// POST /api/follow/{id} authenticated user would follow user with {id}

app.post('/api/follow/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const id_exists = await pool.query('SELECT * FROM user_table WHERE user_id = $1', [id]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
                const newTodo1 = await pool.query('SELECT * FROM user_table WHERE user_id = $1', [id]);
                const follow_id = newTodo.rows[0].following_id;
                const curr_user_id = newTodo.rows[0].user_id;
                const followed_by_id = newTodo1.rows[0].followed_by_id;
                if (follow_id.includes("#" + id + "#")) {
                    res.json({
                        message: 'Already Following the user',
                    });
                }
                else {
                    const new_follow_id = follow_id + "#" + id + "#";
                    const new_followed_by_id = followed_by_id + "#" + curr_user_id + "#";
                    const updatetodo = await pool.query('UPDATE user_table SET following_id = $1 WHERE token= $2', [new_follow_id, req.token]);
                    const updatetodo1 = await pool.query('UPDATE user_table SET followed_by_id = $1 WHERE user_id= $2', [new_followed_by_id, id]);
                    await pool.query('SELECT * FROM user_table ORDER BY user_id');
                    res.json({
                        message: 'Followed the user',
                    });
                }
            }
        });

    }
    else {
        res.json({
            message: 'User Does not exist',
        });
    }
});

// POST /api/unfollow/{id} authenticated user would unfollow a user with {id}

app.post('/api/unfollow/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const id_exists = await pool.query('SELECT * FROM user_table WHERE user_id = $1', [id]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
                const curr_user_id = newTodo.rows[0].user_id;
                const newTodo1 = await pool.query('SELECT * FROM user_table WHERE user_id = $1', [id]);
                const follow_id = newTodo.rows[0].following_id;
                const followed_by_id = newTodo1.rows[0].followed_by_id;
                if (follow_id.includes("#" + id + "#")) {
                    const new_follow_id = follow_id.replace("#" + id + "#", "");
                    const new_followed_by_id = followed_by_id.replace("#" + curr_user_id + "#", "");
                    const updatetodo = await pool.query('UPDATE user_table SET following_id = $1 WHERE token= $2', [new_follow_id, req.token]);
                    const updatetodo1 = await pool.query('UPDATE user_table SET followed_by_id = $1 WHERE user_id= $2', [new_followed_by_id, id]);
                    await pool.query('SELECT * FROM user_table ORDER BY user_id');
                    res.json({
                        message: 'Unfollowed the user',
                    });
                }
                else {
                    res.json({
                        message: 'Does not Follow the user',
                    });
                }
            }
        });

    }
    else {
        res.json({
            message: 'User Does not exist',
        });
    }
});

// GET /api/user should authenticate the request and return the respective user profile.

app.get('/api/:user', verifyToken, async (req, res) => {
    const { user } = req.params;
    const id_exists = await pool.query('SELECT * FROM user_table WHERE username = $1', [user]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const followed_by_rows = await pool.query('SELECT * FROM user_table WHERE username = $1', [user]);
                const following_rows = await pool.query('SELECT * FROM user_table WHERE username = $1', [user]);

                const followed_by_string = followed_by_rows.rows[0].followed_by_id.split("##").length - 1;
                const following_string = following_rows.rows[0].following_id.split("##").length - 1;

                res.json({
                    username: user,
                    number_of_followers: followed_by_string,
                    number_of_followings: following_string,
                });
            }
        });

    }
    else {
        res.json({
            message: 'User Does not exist',
        });
    }
});

// POST api/posts/ would add a new post created by the authenticated user

app.post('/api/posts', verifyToken, async (req, res) => {

    const title = req.body['title'];
    const description = req.body['description'];
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {

            const created_at = new Date();
            const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
            const curr_user_id = newTodo.rows[0].user_id;
            const newTodo1 = await pool.query('INSERT INTO post_table(created_by,title, description,created_at,liked_by,comment_id) VALUES($1,$2, $3, $4, $5, $6)', [curr_user_id, title, description, created_at, '#', '#']);
            const row_count = await (await pool.query("SELECT * FROM post_table")).rowCount;
            const post_id = await (await pool.query("SELECT * FROM post_table")).rows[row_count - 1].post_id;
            res.json({
                Post_ID: post_id,
                Title: title,
                Description: description,
                Created_Time_UTC: created_at,
            });
        }
    });

});

// DELETE api/posts/{id} would delete post with {id} created by the authenticated user.

app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const id_exists = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {

                const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
                const curr_user_id = newTodo.rows[0].user_id;

                const newTodo1 = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
                const curr_user_id1 = newTodo.rows[0].user_id;

                if (curr_user_id == curr_user_id1) {
                    const newTodo2 = await pool.query('DELETE FROM post_table WHERE post_id = $1', [id]);
                    res.json({
                        message: 'Post Deleted',
                    });
                }
                else {
                    res.sendStatus(403);
                }
            }
        });
    }
    else {
        res.json({
            message: 'Post Does not exist',
        });
    }
});

// POST /api/like/{id} would like the post with {id} by the authenticated user.

app.post('/api/like/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const id_exists = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
                const newTodo1 = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
                const curr_user_id = newTodo.rows[0].user_id;
                const liked_by = newTodo1.rows[0].liked_by;

                if (liked_by.includes("#" + curr_user_id + "#")) {
                    res.json({
                        message: 'Already Liked the post',
                    });
                }
                else {
                    const new_liked_by = liked_by + "#" + curr_user_id + "#";

                    const updatetodo = await pool.query('UPDATE post_table SET liked_by = $1 WHERE post_id= $2', [new_liked_by, id]);
                    res.json({
                        message: 'Liked the post',
                    });
                }
            }
        });

    }
    else {
        res.json({
            message: 'POST Does not exist',
        });
    }
});

// POST /api/unlike/{id} would unlike the post with {id} by the authenticated user.

app.post('/api/unlike/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const id_exists = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
                const newTodo1 = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
                const curr_user_id = newTodo.rows[0].user_id;
                const liked_by = newTodo1.rows[0].liked_by;

                if (!(liked_by.includes("#" + curr_user_id + "#"))) {
                    res.json({
                        message: 'Already Unliked the post',
                    });
                }
                else {
                    const new_liked_by = liked_by.replace("#" + curr_user_id + "#", "");

                    const updatetodo = await pool.query('UPDATE post_table SET liked_by = $1 WHERE post_id= $2', [new_liked_by, id]);
                    res.json({
                        message: 'Unliked the post',
                    });
                }
            }
        });

    }
    else {
        res.json({
            message: 'POST Does not exist',
        });
    }
});

// POST /api/comment/{id} add comment for post with {id} by the authenticated user.

app.post('/api/comment/:id', verifyToken, async (req, res) => {

    const { id } = req.params;
    const comment = req.body['comment'];
    const id_exists = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
    if (id_exists.rowCount > 0) {
        jwt.verify(req.token, 'secretkey', async (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {

                const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [req.token]);
                const curr_user_id = newTodo.rows[0].user_id;

                const newTodo1 = await pool.query('INSERT INTO comment_table (post_id,comment,commented_by) VALUES($1,$2, $3)', [id, comment, curr_user_id]);

                const row_count = await (await pool.query("SELECT * FROM comment_table")).rowCount;

                const comment_id = await (await (await pool.query("SELECT * FROM comment_table")).rows[row_count - 1]).comment_id;

                const newTodo2 = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
                const curr_comment_id = newTodo2.rows[0].comment_id;

                console.log(curr_comment_id)

                const new_comment_id = curr_comment_id + "#" + comment_id + "#";

                const updatetodo = await pool.query('UPDATE post_table SET comment_id = $1 WHERE post_id= $2', [new_comment_id, id]);

                res.json({
                    Comment_ID: comment_id,
                });
            }
        });
    }
    else {
        res.json({
            message: 'POST Does not exist',
        });
    }

});

// GET api/posts/{id} would return a single post with {id} populated with its number of likes and comments

app.get('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const id_exists = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
    if (id_exists.rowCount > 0) {

        const liked_by_rows = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);
        const liked_by_string = liked_by_rows.rows[0].liked_by.split("##").length - 1;
        const comment_id_rows = await pool.query('SELECT * FROM post_table WHERE post_id = $1', [id]);

        var comment_id_string = comment_id_rows.rows[0].comment_id.split("##").slice(1,);

        if (comment_id_string.length > 0) {
            comment_id_string[comment_id_string.length - 1] = comment_id_string[comment_id_string.length - 1].slice(0, comment_id_string[comment_id_string.length - 1].length - 1);
        }

        var actualcomment = [];

        for (let i = 0; i < comment_id_string.length; i++) {
            const comm1 = await (await pool.query('SELECT * FROM comment_table WHERE comment_id = $1', [comment_id_string[i]])).rows[0].comment;
            actualcomment.push(comm1);
        }


        // console.log(actualcomment)

        res.json({
            post_id: id,
            number_of_likes: liked_by_string,
            comments: actualcomment,
        });
    }
    else {
        res.json({
            message: 'Post Does not exist',
        });
    }
});

// GET /api/all_posts would return all posts created by authenticated user sorted by post time

app.get('/api_all_post', async (req, res) => {

    const all_posts = await pool.query('SELECT * FROM post_table ORDER BY created_at DESC');



    const length1 = all_posts.rowCount;

    var array = [];

    for (let i = 0; i < length1; i++) {
        var dict = {};
        dict['ID'] = all_posts.rows[i].post_id;
        dict['Title'] = all_posts.rows[i].title;
        dict['Description'] = all_posts.rows[i].description;
        dict['Created At'] = all_posts.rows[i].created_at;
        const liked_by_string = all_posts.rows[i].liked_by.split("##").length - 1;
        dict['Liked By'] = liked_by_string;

        var comment_id_string1 = all_posts.rows[i].comment_id.split("##").slice(1,);

        if (comment_id_string1.length > 0) {
            comment_id_string1[comment_id_string1.length - 1] = comment_id_string1[comment_id_string1.length - 1].slice(0, comment_id_string1[comment_id_string1.length - 1].length - 1);
        }

        var actualcomment = [];

        for (let i = 0; i < comment_id_string1.length; i++) {
            const comm1 = await (await pool.query('SELECT * FROM comment_table WHERE comment_id = $1', [comment_id_string1[i]])).rows[0].comment;
            actualcomment.push(comm1);
        }

        dict['Comments'] = actualcomment;

        array.push(dict);
    }

    res.json({
        All_Posts: array,
    });
});


// Adding Sample users

app.post('/api/generate_user', async (req, res) => {

    const user = {
        email1: req.body['email'],
        password1: req.body['password'],
        username1: req.body['username'],
    }

    const email2 = req.body['email'];
    const password2 = req.body['password'];
    const username2 = req.body['username'];
    const newTodo = await pool.query('SELECT * FROM user_table WHERE email = $1', [email2]);
    let message1 = '';
    if (newTodo.rowCount > 0) {
        message1 = 'User Exists';
    }
    else {
        let token2 = '';
        jwt.sign({ user }, 'secretkey', { expiresIn: '300000000s' }, (err, token) => {
            token2 = token;
            pool.query('INSERT INTO user_table(email, password1,username,token,following_id,followed_by_id,post_id) VALUES($1, $2, $3, $4, $5,$6,$7)', [email2, password2, username2, token2, '#', '#', '#']);
        });
        message1 = 'User Added';
    }
    res.json({
        All_Post: message1,
    });

});

// Verify Token

async function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        // Get token from array
        const bearerToken = bearerHeader;
        // Set the token
        const newTodo = await pool.query('SELECT * FROM user_table WHERE token = $1', [bearerToken]);
        if (newTodo.rowCount > 0) {
            req.token = bearerToken;
            next();
        }
        else {
            res.sendStatus(403);
        }
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

app.listen(port, () => {
    console.log('Started')
})
