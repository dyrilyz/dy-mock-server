const http = require('http')
const express = require('express')
const apps = []

function createServer (conf) {
    const app = express()
    app.all('*', function (req, res, next) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', 'Content-Type,token');
        res.set('Access-Control-Allow-Methods', '*');
        res.set('Content-Type', 'application/json;charset=utf-8');
        next();
    });
    conf.ifcArr.forEach((item, index) => {
        const {method, url, respVal, httpCode} = item
        // console.log(method, url, respVal, httpCode)
        let result = ''
        const str = 'result = ' + respVal.replace(/\s+/g, '')
        eval(str)
        app[method](url, (req, resp) => {
            if (httpCode * 1 === 200) {
                resp.send(result)
            } else {
                resp.sendStatus(httpCode * 1)
            }
        })
    })

    const server = http.createServer(app)
    const sockets = [];

    server.listen(conf.port, () => {
        apps.push({id: conf.id, server, sockets})
    })

    server.on("connection", socket => {
        sockets.push(socket);
        socket.once("close", () => {
            sockets.splice(sockets.indexOf(socket), 1);
        });
    });

    return new Promise((resolve, reject) => {
        server.on('error', () => {
            reject(`${conf.port}端口已被占用！`)
        });
    })
}

function closeServer (id) {
    return new Promise(resolve => {
        for (const i in apps) {
            if (apps[i].id === id) {
                const {server, sockets} = apps[i]
                sockets.forEach(socket => {
                    socket.destroy();
                });
                server.close()
                server.on('close', () => resolve())
                apps.splice(i, 1)
                break
            }
        }
    })
}

module.exports = {
    createServer,
    closeServer
}
