avalon.config({debug: false})

const {dialog} = require('../util')
const {ipcRenderer} = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const confPath = path.resolve(os.homedir(), '.dymock')
const {createServer, closeServer} = require('../../server')

let wid = ''

function readFile(path) {
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

function writeFile(path, data) {
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
    runs: [],
    servers: [],
    ifcArr: [],
    minimize() {
        ipcRenderer.send('win-minimize', wid)
    },
    close() {
        ipcRenderer.send('win-close', wid)
    },
    startSv(id, index) {
        this.runs[index].status = 2
        for (const i in this.servers) {
            if (this.servers[i].id === id) {
                return createServer(JSON.parse(JSON.stringify(this.servers[i]))).catch(e => {
                    this.runs[index].status = 0
                    dialog(e)
                })
            }
        }
    },
    stopSv(id, index) {
        this.runs[index].status = 1
        return closeServer(id).then(() => {
            this.runs[index].status = 0
        })
    },
    addServerModal(item) {
        const data = {id: wid}
        console.log(item)
        if (item) {
            data.conf = {
                eventName: 'init-data',
                data: item
            }
        }
        ipcRenderer.send('add-server-modal', data)
    },
    addIfcModal(item) {
        // if (isRun()) {
        //     alert('请先关闭server')
        //     return
        // }
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
    tabServer(active) {
        this.active = active
        this.ifcArr = this.servers[this.active].ifcArr
    },
    removeIfc(index) {
        if (isRun()) {
            alert('请先关闭server')
            return
        }
        this.ifcArr.splice(index, 1)
        this.servers[this.active].ifcArr = this.ifcArr
        writeFile(confPath, JSON.stringify(vm.servers))
    },
    removeServer(e, index) {
        e.stopPropagation()
        if (isRun()) {
            alert('请先关闭server')
            return
        }
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
    const [id] = [new Date() * 1]
    vm.servers.push({
        id,
        name: data.name,
        port: data.port * 1,
        ifcArr: [],
    })
    vm.runs.push({id, status: 0})
    writeFile(confPath, JSON.stringify(vm.servers))
})

ipcRenderer.on('update-server', (e, data) => {
    for (const i in vm.servers) {
        if (vm.servers[i].id === data.id) {
            data.port = +data.port
            Object.assign(data, {ifcArr: vm.servers[i].ifcArr})
            vm.servers.splice(i, 1, data)
            break
        }
    }
    writeFile(confPath, JSON.stringify(vm.servers))
})

ipcRenderer.on('add-ifc', async (e, data) => {
    vm.servers[vm.active].ifcArr.push(data)
    vm.ifcArr = avalon.mix(true, [], vm.servers[vm.active].ifcArr)

    // 热更新
    if (vm.runs[vm.active].status !== 0) {
        await vm.stopSv(vm.servers[vm.active].id, vm.active)
        await vm.startSv(vm.servers[vm.active].id, vm.active)
    }

    writeFile(confPath, JSON.stringify(vm.servers))
})

ipcRenderer.on('update-ifc', async (e, data) => {
    for (const i in vm.servers[vm.active].ifcArr) {
        if (data.id === vm.servers[vm.active].ifcArr[i].id) {
            vm.servers[vm.active].ifcArr[i].method = data.method
            vm.servers[vm.active].ifcArr[i].url = data.url
            vm.servers[vm.active].ifcArr[i].respVal = data.respVal
            vm.servers[vm.active].ifcArr[i].httpCode = data.httpCode

            // 热更新
            if (vm.runs[vm.active].status !== 0) {
                await vm.stopSv(vm.servers[vm.active].id, vm.active)
                await vm.startSv(vm.servers[vm.active].id, vm.active)
            }

            break
        }
    }
    writeFile(confPath, JSON.stringify(vm.servers))
})

function isRun() {
    for (const i in vm.runs) {
        if (vm.runs[i].id === vm.servers[vm.active].id) {
            return vm.runs[i].status !== 0
        }
    }
    return false
}

function init() {
    readFile(confPath).then(data => {
        vm.servers = JSON.parse(data.toString())
        if (vm.servers.length) {
            vm.ifcArr = vm.servers[vm.active].ifcArr
        }
        vm.servers.forEach(item => {
            /**
             * status:
             *      0: 已关闭
             *      1: 关闭中
             *      2: 已启动
             */
            vm.runs.push({id: item.id, status: 0})
        })
    }, e => {
        const server = {
            id: new Date() * 1,
            name: 'default',
            port: 80,
            ifcArr: []
        }
        writeFile(confPath, JSON.stringify([server]))
        init()
    })
}

init()
