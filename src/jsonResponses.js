const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

// The GET version of recieveing users
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSON(request, response, 200, responseJSON);
};

// The HEAD version of recieveing users
const getUsersMeta = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSONMeta(request, response, 200);
};

const addUser = (request, response, params) => {
  const responseJSON = {
    message: 'Created successfully',
    id: 'create',
  };

  if (!params.name || !params.age) {
    responseJSON.message = 'Name and age are both required.';
    responseJSON.id = 'badRequest';
    return respondJSON(request, response, 400, responseJSON);
  }

  const newUser = {
    name: params.name,
    age: params.age,
  };


  if (users[params.name]) {
    responseJSON.message = '';
    responseJSON.id = 'updated';
    users[params.name] = newUser;

    etag = crypto.createHash('sha1').update(JSON.stringify(users));
    digest = etag.digest('hex');

    return respondJSON(request, response, 204, responseJSON);
  }

  users[params.name] = newUser;

  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');

  return respondJSON(request, response, 201, responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSON(request, response, 404);

module.exports = {
  getUsers,
  getUsersMeta,
  addUser,
  notFound,
  notFoundMeta,
};

