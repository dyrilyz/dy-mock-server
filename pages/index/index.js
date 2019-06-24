const {ipcRenderer} = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const confPath = path.resolve(os.homedir(), '.dymock')

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
    addServerModal (name) {
        const data = {id: wid}
        if (name) {
            data.conf = {
                eventName: 'init-data',
                data: {name}
            }
        }
        ipcRenderer.send('add-server-modal', data)
    },
    addIfcModal () {
        ipcRenderer.send('add-ifc-modal', wid)
    },
    tabServer (active) {
        this.active = active
        this.ifcArr = this.servers[this.active].ifcArr
    },
    removeIfc (index) {
        this.ifcArr.splice(index, 1)
        this.servers[this.active].ifcArr = this.ifcArr
        writeFile(confPath, JSON.stringify(vm.servers))
    }
})

ipcRenderer.on('window-created', (e, id) => {
    wid = id
})

ipcRenderer.on('add-server', (e, data) => {
    vm.servers.push({name: data.name, ifcArr: []})
    writeFile(confPath, JSON.stringify(vm.servers))
})
ipcRenderer.on('add-ifc', (e, data) => {
    vm.servers[vm.active].ifcArr.push(data)
    vm.ifcArr = avalon.mix(true, [], vm.servers[vm.active].ifcArr)
    // vm.ifcArr = vm.servers[vm.active].ifcArr
    writeFile(confPath, JSON.stringify(vm.servers))
})

function init () {
    readFile(confPath).then(data => {
        vm.servers = JSON.parse(data.toString())
        vm.ifcArr = vm.servers[vm.active].ifcArr
    }, e => {
        writeFile(confPath, '[]')
        init()
    })
}

init()
