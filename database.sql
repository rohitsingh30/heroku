CREATE DATABASE todo_database;

CREATE TABLE todo(todo_id SERIAL PRIMARY KEY,description VARCHAR(255))

CREATE TABLE user_table(user_id SERIAL PRIMARY KEY,email VARCHAR(255),password1 VARCHAR(255),username VARCHAR(255),token VARCHAR(255),following_id VARCHAR(255),followed_by_id VARCHAR(255),post_id VARCHAR(255));
CREATE TABLE post_table(post_id SERIAL PRIMARY KEY,created_by INT,title VARCHAR(255),description VARCHAR(255),created_at timestamp,liked_by  VARCHAR(255),comment_id  VARCHAR(255));
CREATE TABLE comment_table(comment_id SERIAL PRIMARY KEY,post_id INT,comment VARCHAR(255),commented_by VARCHAR(255));

SELECT * FROM user_table;
SELECT * FROM post_table;
SELECT * FROM comment_table;

DROP TABLE user_table;
DROP TABLE post_table;
DROP TABLE comment_table;
