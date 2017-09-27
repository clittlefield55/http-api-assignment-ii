const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  switch (request.method) {
    case 'GET':
      if (parsedUrl.pathname === '/') {
        // if homepage, send index
        htmlHandler.getIndex(request, response);
      } else if (parsedUrl.pathname === '/style.css') {
        // if stylesheet, send stylesheet
        htmlHandler.getCSS(request, response);
      } else if (parsedUrl.pathname === '/getUsers') {
        // if get users, send user object back
        jsonHandler.getUsers(request, response);
      } else {
        // if not found, send 404 message
        jsonHandler.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (parsedUrl.pathname === '/getUsers') {
        // if get users, send meta data back with etag
        jsonHandler.getUsersMeta(request, response);
      } else {
        // if not found send 404 without body
        jsonHandler.notFoundMeta(request, response);
      }
      break;
    case 'POST':
      if (parsedUrl.pathname === '/addUser') {
        // if update user, change our user object
        jsonHandler.addUser(request, response, params);
      }
      break;
    default:
      // send 404 in any other case
      jsonHandler.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
