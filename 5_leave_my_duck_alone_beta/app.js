var http = require('http');
var fs = require('fs');
var path = require('path');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(request, response) {
    var filePath = '.' + request.url;
    
    var urls = request.url.match('^[^?]*');
    if (urls.length) {
    	filePath = '.' + urls[0];
    }

    if (filePath == './') {
        filePath = './index.html';
    }
    
    //console.log("Request : " + filePath);

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});


// Chargement de socket.io
var io = require('socket.io').listen(server);

var listUsers = [];

function getIndex(socket) {
	var l = listUsers.length;
	for (var i=0 ; i<l ; i++) {
		if (listUsers['socket_desktop'] == socket || listUsers['socket_mobile'] == socket) {
			return i;
		}
	}
	return -1;
}

function getIndexByID(ID) {
	var l = listUsers.length;
	for (var i=0 ; i<l ; i++) {
		if (listUsers[i]['ID'] == ID) {
			return i;
		}
	}
	return -1;
}

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
	//console.log(socket);
	socket.emit('connect_ok', true);

	socket.on('is_desktop', function() {
		console.log("is_desktop");
		// First time
		var ID = Math.random().toString(16).slice(5);
		console.log('Generated ID = ' + ID);

		listUsers.push({
			"socket_desktop": socket,
			"socket_mobile": null,
			"ID": ID
		});

		socket.emit('generated_id', ID);
	});

	socket.on('is_mobile', function(ID) {
		var i = getIndexByID(ID);

		console.log('Mobile detected, ID = ' + ID + ', index found in array = ' + i);

		if (i != -1) {
			if (listUsers[i]["socket_mobile"] == null) {
				listUsers[i]["socket_mobile"] = socket;
			}

			if (listUsers[i]["socket_desktop"]) {
				console.log('Game can start!');

				listUsers[i]["socket_desktop"].emit('all_ok', true);
				socket.emit('all_ok', true);
			} else {
				socket.emit('all_ok', false);
			}
		} else {
			socket.emit('all_ok', false);
		}
	});

	socket.on('mobile_leave', function(ID) {
		var i = getIndexByID(ID);

		console.log('Mobile leave, ID = ' + ID + ', index found in array = ' + i);

		if (i != -1) {
			console.log('Delete mobile socket for ID = ' + listUsers[i]['ID']);
			listUsers[i]["socket_mobile"] = null;
		}
	});

	socket.on('message', function(message) {
		if (!message.ID) { return; }

		var i = getIndexByID(message.ID);
		if (i == -1) { return; }

		if (socket == listUsers[i]["socket_mobile"]) {
			// Message sent by the mobile device

			listUsers[i]["socket_desktop"].emit('message', message);

		} else if (socket == listUsers[i]["socket_desktop"]) {
			// Message sent by the desktop
			
		} else {
			return;
		}
	});

	socket.on('fire', function(ID) {
		var i = getIndexByID(ID);

		console.log('Fire, ID = ' + ID + ', index found in array = ' + i);

		if (i != -1) {
			if (listUsers[i]["socket_desktop"]) {
				listUsers[i]["socket_desktop"].emit('fire');
			}
		}
	});

	socket.on('disconnect', function() {
		var i = getIndex(socket);

		console.log('Got disconnect! Index found in array = ' + i);

		if (i != -1) {
			if (socket == listUsers[i]["socket_mobile"]) {
				// Remove only the mobile socket
				console.log('Delete mobile socket for ID = ' + listUsers[i]['ID']);
				listUsers[i]["socket_mobile"] = null;
			} else {
				console.log('Delete ID = ' + listUsers[i]['ID']);
				listUsers.splice(i, 1);
			}
		}
	});
});

server.listen(8080);
