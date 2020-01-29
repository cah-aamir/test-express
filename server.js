var express = require('express');
var bodyParser = require('body-parser');
var Pusher = require('pusher');
const cors = require("cors");
const multipart = require("connect-multiparty");
const http = require('http').Server(app);
const io = require('socket.io')(http);

var connected = false;
var socketOut;
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// setInterval(()=> {
//     if (connected) socketOut.emit('document', 'Amazing!!!');
// }, 3000)

const multipartMiddleware = multipart();
const documents = {
    1: 'Stats',
    2: 'Personal Info',
    3: 'Addresses'
};

const users = {};
io.on("connection", socket => {
    getLocalIp();
    console.log('SOCKET ID: ', socket.id)
    connected = true;
    socketOut = socket;
    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
    };

    socket.on("getDoc", docId => {
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
        socket.emit(name, socket.id);
    });

    socket.on("login", name => {
        console.log("USERS LOGIN", name);
        socket.emit(name, socket.id);
    });

    socket.on("add user", name => {
        console.log("USERS ADD", name);
        socket.emit(name, socket.id);
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
            "color": "black",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [255, 255, 255, 1],
                "hex": "#000"
            }
        },
        {
            "color": "white",
            "category": "value",
            "code": {
                "rgba": [0, 0, 0, 1],
                "hex": "#FFF"
            }
        },
        {
            "color": "red",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [255, 0, 0, 1],
                "hex": "#FF0"
            }
        },
        {
            "color": "blue",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [0, 0, 255, 1],
                "hex": "#00F"
            }
        },
        {
            "color": "yellow",
            "category": "hue",
            "type": "primary",
            "code": {
                "rgba": [255, 255, 0, 1],
                "hex": "#FF0"
            }
        },
        {
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

// app.get("/api/contacts", function (req, res) {
//     // pusher.trigger('my-channel', 'my-event', {
//     //     "message": "hello world"
//     // });

//     pusher.trigger('events-channel', 'new-like', {
//         "message": "hello books"
//     });
//     res.status(200).json(obj);
// });

// app.post('/update', multipartMiddleware, (req, res) => {
//     console.log('REQUEST', req.body);
//     trigger(req.body.userName);
//     res.json({ message: "Book added succesfully" })
// })

// function trigger(channelName) {
//     setInterval(() => {
//         pusher.trigger('events-channel-' + channelName, 'new-like', {
//             "message": "hello " + channelName
//         });
//     }, 5000);
// }

app.get('/emit', (req, res) => {
    console.log('REQUEST', req.body);
    socketOut.emit('document', 'Amazing!!!');
    res.json({ message: "Book added succesfully" })
})

http.listen(4444);

var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('App is running on port: ', port);
});





function getLocalIp() {
    const os = require('os');

    for(let addresses of Object.values(os.networkInterfaces())) {
        for(let add of addresses) {
            if(add.address.startsWith('192.168.')) {
                console.log('IP ADDRESS ----->>', add.address);
            }
        }
    }
}
