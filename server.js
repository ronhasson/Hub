var fs = require('fs');
var os = require('os');
var ifaces = os.networkInterfaces();

var expr = require('express')();
var httpr = require('http').Server(expr);
var http = require('http');
var io = require('socket.io')(httpr);

var qr = require('qr-image');

const port = 64242;

expr.get('/', function(req, res) {
    res.sendFile(__dirname + '/remotePages/remoteMainPage.html');
});

io.on('connection', function(socket) {
    console.log(socket.request.connection.remoteAddress + ' connected');

    socket.on('enter', function(username) {
      addUser(username);
    });

    socket.on('changeColor', function(color) {
        console.log('color: ' + color);
        document.getElementById("particles-js").style.backgroundColor = color;
    });

    socket.on('secretColor', function(state) {
        console.log('secret color');

        document.getElementById("particles-js").className = (state) ? "rainbow" : "notselectable";
    });

    socket.on('buttonPress', function(button) {
    getInput(button);
    });
    socket.on('slideEvent', function(dir) {
    getInput(dir);
    });
});
/*var server = expr.listen(port,function(){
    console.log("We have started our server on port "+port);
});*/

httpr.listen(port, function() {
    console.log('listening on ' + port);
    //getIP();
    //generateQRforIP();
});

function closeServer() {
    //alert("closing server");
    httpr.close();
}

function getIP() {
    var address = "192.168.1.1";
    Object.keys(ifaces).forEach(function(ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function(iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
            } else {
                // this interface has only one ipv4 adress
                address = (address == "192.168.1.1") ? iface.address : address;
                console.log(ifname, iface.address);
            }
            ++alias;
        });
    });
    console.log(address);
    return address;
}

function updateIPtext(id) {
    document.getElementById(id).innerHTML = "http://" + getIP() + ":" + port;
}

function generateQRforIP(id) {
    var text = "http://" + getIP() + ":" + port;
    //var text = "text bla bla"
    var code = qr.image(text, {
        type: 'png',
        ec_level: 'Q',
        parse_url: true,
        margin: 1
    }); //.pipe(file('qr.png'));
    //var code = qr.image('http://blog.nodejitsu.com', { type: 'png', ec_level: 'Q', parse_url: true,  margin: 1 }).pipe(process.stdout);
    console.log(code)
    var output = code.pipe(fs.createWriteStream(__dirname + '\\qr.png'));

    setTimeout(function() {
        document.getElementById(id).src = __dirname + "\\qr.png";
    }, 400);
    //code.pipe(output);
}
