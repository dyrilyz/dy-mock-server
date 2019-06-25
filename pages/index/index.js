const {ipcRenderer} = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const confPath = path.resolve(os.homedir(), '.dymock')
const express = require('express')
const apps = []

let wid = ''

function readFile (path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function writeFile (path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

const vm = avalon.define({
    $id: 'app',
    active: 0,
    servers: [],
    ifcArr: [],
    minimize () {
        ipcRenderer.send('win-minimize', wid)
    },
    close () {
        ipcRenderer.send('win-close', wid)
    },
    startSv (id) {
    },
    stopSv (id) {
    },
    addServerModal (item) {
        const data = {id: wid}
        if (item) {
            data.conf = {
                eventName: 'init-data',
                data: item
            }
        }
        ipcRenderer.send('add-server-modal', data)
    },
    addIfcModal (item) {
        if (!this.servers.length) {
            return
        }
        const data = {id: wid}
        if (item) {
            data.conf = {
                eventName: 'init-data',
                data: item
            }
        }
        ipcRenderer.send('add-ifc-modal', data)
    },
    tabServer (active) {
        this.active = active
        this.ifcArr = this.servers[this.active].ifcArr
    },
    removeIfc (index) {
        this.ifcArr.splice(index, 1)
        this.servers[this.active].ifcArr = this.ifcArr
        writeFile(confPath, JSON.stringify(vm.servers))
    },
    removeServer (e, index) {
        e.stopPropagation()
        this.servers.splice(index, 1)
        if (index < this.active) {
            this.active--
        } else if (index === this.active) {
            if (this.servers[this.active + 1]) {
                this.ifcArr = this.servers[this.active].ifcArr
            } else if (this.active > 0) {
                this.active--
                this.ifcArr = this.servers[this.active].ifcArr
            } else {
                this.ifcArr = []
            }
        }
        writeFile(confPath, JSON.stringify(vm.servers))
    }
})

ipcRenderer.on('window-created', (e, id) => {
    wid = id
})

ipcRenderer.on('add-server', (e, data) => {
    vm.servers.push({
        id: new Date() * 1,
        name: data.name,
        ifcArr: []
    })
    writeFile(confPath, JSON.stringify(vm.servers))
})

ipcRenderer.on('update-server', (e, data) => {
    for (const i in vm.servers) {
        if (vm.servers[i].id === data.id) {
            vm.servers[i].name = data.name
            break
        }
    }
    writeFile(confPath, JSON.stringify(vm.servers))
})

ipcRenderer.on('add-ifc', (e, data) => {
    vm.servers[vm.active].ifcArr.push(data)
    vm.ifcArr = avalon.mix(true, [], vm.servers[vm.active].ifcArr)
    writeFile(confPath, JSON.stringify(vm.servers))
})

ipcRenderer.on('update-ifc', (e, data) => {
    for (const i in vm.servers[vm.active].ifcArr) {
        if (data.id === vm.servers[vm.active].ifcArr[i].id) {
            vm.servers[vm.active].ifcArr[i].method = data.method
            vm.servers[vm.active].ifcArr[i].url = data.url
            vm.servers[vm.active].ifcArr[i].respVal = data.respVal
            vm.servers[vm.active].ifcArr[i].httpCode = data.httpCode
            break
        }
    }
    writeFile(confPath, JSON.stringify(vm.servers))
})

function init () {
    readFile(confPath).then(data => {
        vm.servers = JSON.parse(data.toString())
        if (vm.servers.length) {
            vm.ifcArr = vm.servers[vm.active].ifcArr
        }
    }, e => {
        const server = {
            id: new Date() * 1,
            name: 'default',
            ifcArr: []
        }
        writeFile(confPath, JSON.stringify([server]))
        init()
    })
}

init()
