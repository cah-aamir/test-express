var app = require('express')();
var bodyParser = require('body-parser');
// var Pusher = require('pusher');
const cors = require("cors");
const multipart = require("connect-multiparty");

// const http = require('http').createServer(app);
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    // below are engine.IO options
    pingInterval: 120000,
    pingTimeout: 5000,
    // cookie: false
  });
  io.set('transports', ['websocket']);

var connected = false;
var socketOut;

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const multipartMiddleware = multipart();
const documents = {
    1: 'Stats',
    2: 'Personal Info',
    3: 'Addresses'
};

const users = {};
io.on("connection", socket => {
    // getLocalIp();
    console.log('SOCKET ID: ', socket.id);


    connected = true;
    socketOut = socket;
    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
    };

    socket.on("getDoc", docId => {
        // var androidId = users['android'];
        // if (androidId )io.to(androidId).emit('aamir', 'TARGETTING ID');

        safeJoin(docId);
        console.log("getDoc called, doc: " + documents[docId]);
        socket.emit("document", documents[docId]);
    });

    socket.on("addDoc", doc => {
        documents[doc.id] = doc;
        safeJoin(doc.id);
        io.emit("documents", Object.keys(documents));
        console.log("addDoc called, doc: " + Object.keys(documents));
        socket.emit("document", doc);
    });

    socket.on("editDoc", doc => {
        documents[doc.id] = doc;
        socket.to(doc.id).emit("document", doc);
    });

    socket.on("mapUser", name => {
        users[name] = socket.id;
        console.log("USERS AFTER MAP", users);
        console.log("Username", name, " Socket ID: ", socket.id);
        socket.emit(name, socket.id);
        // var androidId = users['android'];
        // if (androidId )io.to(androidId).emit('aamir', 'TARGETTING ID');
    });

    socket.on("login", name => {
        console.log("USERS LOGIN", name);
        socket.emit(name, socket.id);
        socket.emit('server connected', socket.id);
        // var androidId = users['android'];
        // if (androidId )io.to(androidId).emit('aamir', 'TARGETTING ID');
    });

    socket.on("add user", name => {
        users[name] = socket.id;
        console.log("USERS ADD", name);
        socket.emit(name, socket.id);
        socket.emit('server connected', socket.id);

    });

    socket.on("register android", name => {
        users['android'] = socket.id;
        console.log("On register android", name);
    });

    io.emit("documents", Object.keys(documents));
});

// var pusher = new Pusher({
//     appId: '937107',
//     key: 'd9d92901313d7236b7e4',
//     secret: 'e04ee1787c7e26b07735',
//     cluster: 'us2',
//     encrypted: true
// });

var obj = {
    "colors": [
        {
            "id": 100,
            "color": "black",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [255, 255, 255, 1],
                "hex": "#000"
            }
        },
        {
            "id": 101,
            "color": "white",
            "category": "value",
            "code": {
                "rgba": [0, 0, 0, 1],
                "hex": "#FFF"
            }
        },
        {
            "id": 102,
            "color": "red",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [255, 0, 0, 1],
                "hex": "#FF0"
            }
        },
        {
            "id": 103,
            "color": "blue",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [0, 0, 255, 1],
                "hex": "#00F"
            }
        },
        {
            "id": 104,
            "color": "yellow",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [255, 255, 0, 1],
                "hex": "#FF0"
            }
        },
        {
            "id": 105,
            "color": "green",
            "category": "hue",
            "type": "secondary",
            "code": {
                "rgba": [0, 255, 0, 1],
                "hex": "#0F0"
            }
        },
    ]
};

app.get("/api/contacts", function (req, res) {
    // pusher.trigger('my-channel', 'my-event', {
    //     "message": "hello world"
    // })
    res.json({ message: "CONTACTS FOR YOU" });
});

app.get("/api/colors", function (req, res) {
    res.json(obj);
});

app.get("/api/apex1", function (req, res) {
    res.sendFile('Apex-1.jpg', { root: __dirname });
});
app.get("/api/apex2", function (req, res) {
    res.sendFile('apex-2.jpg', { root: __dirname });
});
app.get("/api/apex3", function (req, res) {
    res.sendFile('apex-3.jpg', { root: __dirname });
});
app.get("/api/apex4", function (req, res) {
    res.sendFile('apex-4.jpg', { root: __dirname });
});

app.get("/.well-known/assetlinks.json", function (req, res) {
    res.sendFile('./.well-known/assetlinks.json', { root: __dirname });
});
app.get("/.well-known/apple-app-site-association", function (req, res) {
    res.sendFile('./.well-known/apple-app-site-association', { root: __dirname });
});

app.get('/emit', (req, res) => {
    console.log('REQUEST', req.body);
    socketOut.emit('document', 'Amazing!!!');
    var androidId = users['android'];
    // if (androidId )io.to(androidId).emit('aamir', 'TARGETTING ID');
    // res.json({ message: "Book added succesfully" })
});

app.get("/vidyo", function (req, res) {
    res.sendFile('vidyo.html', { root: __dirname });
});

// app.get('/vidyo', (req, res) => {
//     res.sendFile('vidyo.html', {root: path.join(__dirname, 'public')});
//   });

server.listen(process.env.PORT || 8080, function () {
    var port = process.env.PORT || 8080
    console.log('App is running on port: ', port);
});
