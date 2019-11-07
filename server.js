var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var obj = {
    "widget": {
        "window": {
            "title": "Sample Konfabulator Widget",
            "name": "main_window",
            "width": 500,
            "height": 500
        },
        "image": {
            "src": "Images/Sun.png",
            "name": "sun1",
            "hOffset": 250,
            "vOffset": 250,
            "alignment": "center"
        },
        "text": {
            "data": "Click Here",
            "size": 36,
            "style": "bold",
            "name": "text1",
            "hOffset": 250,
            "vOffset": 100,
            "alignment": "center",
            "onMouseUp": "sun1.opacity = (sun1.opacity / 100) * 90;"
        }
    }
};

var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('App is running on port: ', port);
});

app.get("/api/contacts", function(req, res) {
    res.status(200).json(obj);
});
