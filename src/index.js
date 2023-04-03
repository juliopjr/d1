const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username == username);

  if(!user) {
    return response.status(400).json({error: "Username not found."});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username == username);

  if (userExists) {
    return response.status(400).json({error: "Username already exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);

});

app.get('/users', (request, response) => {
  return response.send(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoExists = user.todos.find(todo => todo.id === id);

  if(!todoExists) {
    return response.status(404).json({error: "ID doesn't exists!"});
  }

  todoExists.title = title;
  todoExists.deadline = deadline;

  return response.send(todoExists);


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  if(!todoExists) {
    return response.status(404).json({error: "ID doesn't exists!"});
  }

  todoExists.done = true;

  return response.send(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  const index = user.todos.indexOf(id);
  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;