const {ipcRenderer} = require('electron')
let wid = ''

const vm = avalon.define({
    $id: 'addIfcModal',
    method: 'get',
    url: '',
    respVal: '{}',
    httpCode: 200,
    cancel () {
        ipcRenderer.send('win-close', wid)
    },
    ok () {
        ipcRenderer.send('transfer', {
            id: wid,
            to: 'add-ifc',
            data: {
                method: vm.method,
                url: vm.url || '/',
                respVal: vm.respVal || '{}',
                httpCode: vm.httpCode || 200,
            },
            ctrl: 'close'
        })
    },
})

ipcRenderer.on('window-created', (e, id) => {
    wid = id
})
