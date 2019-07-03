const {dialog} = require('../util')
const {ipcRenderer} = require('electron')
let wid = ''
let update = false

const vm = avalon.define({
    $id: 'addIfcModal',
    id: new Date() * 1,
    method: 'get',
    url: '/api',
    respVal: '{}',
    httpCode: 200,
    cancel() {
        ipcRenderer.send('win-close', wid)
    },
    ok() {
        if (!this.url) {
            dialog('url不能为空！')
            return
        }
        if (!this.httpCode) {
            dialog('http状态码不能为空！')
            return
        }
        ipcRenderer.send('transfer', {
            id: wid,
            to: update ? 'update-ifc' : 'add-ifc',
            data: {
                id: vm.id,
                method: vm.method,
                url: vm.url,
                respVal: vm.respVal || '{}',
                httpCode: vm.httpCode || 200,
            },
            ctrl: 'close'
        })
    },
    keydown(e) {
        if (e.keyCode === 9) {
            e.preventDefault()
            const index = e.target.selectionStart
            const prev = this.respVal.substring(0, index)
            const next = this.respVal.substring(index)
            this.respVal = `${prev}\t${next}`
            e.target.setSelectionRange(index + 1, index + 1)
        }
    }
})

ipcRenderer.on('window-created', (e, id) => {
    wid = id
})

ipcRenderer.on('init-data', (e, obj) => {
    vm.id = obj.id
    vm.method = obj.method
    vm.url = obj.url
    vm.respVal = obj.respVal
    vm.httpCode = obj.httpCode
    update = true
})
