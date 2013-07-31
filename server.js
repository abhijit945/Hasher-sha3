//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8085)
    , crypto = require('./crypto/sha3').CryptoJS
    , words
    , hex;

//Setup Express
var server = express.createServer();
server.configure(function () {
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "axr121530"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function (err, req, res, next) {
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: {
            title: '404 - Not Found', description: '', author: '', analyticssiteid: 'XXXXXXX'
        }, status: 404 });
    } else {
        res.render('500.jade', { locals: {
            title: 'The Server Encountered an Error', description: '', author: '', analyticssiteid: 'XXXXXXX', error: err
        }, status: 500 });
    }
});
server.listen(port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Client Connected');
    socket.on('message', function (data) {
        socket.broadcast.emit('server_message', data);
        socket.emit('server_message', data);
    });
    socket.on('disconnect', function () {
        console.log('Client Disconnected.');
    });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function (req, res) {
    res.render('index.jade', {
        locals: {
            title: 'Hasher', description: 'Hash your Name', author: 'Abhijit Rao', analyticssiteid: 'XXXXXXX'
        }
    });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function (req, res) {
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function (req, res) {
    throw new NotFound;
});

function NotFound(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

console.log('Listening on http://localhost:' + port);
process.stdout.write("Please enter the Username for Hash");

/**
 * Now instead of just passing the value from the console during start
 * we can just have a callback that provides the Hash when a value is
 * entered
 */
process.stdin.on('data', function (chunk) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    words = crypto.SHA3(chunk.toString().trim(), { outputLength: 256 });
    hex = crypto.enc.Hex.stringify(words);
    process.stdout.write("\nYour SHA3 value is: " + hex + "\n");
});
process.stdin.resume();
process.on('SIGINT', function () {
    console.log('Thank You!!');
});

