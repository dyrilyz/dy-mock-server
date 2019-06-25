const {ipcRenderer} = require('electron')
let wid = ''
let update = false


const vm = avalon.define({
    $id: 'addServerModal',
    id: '',
    name: '',
    cancel () {
        ipcRenderer.send('win-close', wid)
    },
    ok () {
        if (!this.name) {
            alert('实例名称不能为空！')
            return
        }
        ipcRenderer.send('transfer', {
            id: wid,
            to: update ? 'update-server' : 'add-server',
            data: {
                id: this.id,
                name: this.name
            },
            ctrl: 'close'
        })
    },

})

ipcRenderer.on('window-created', (e, id) => {
    wid = id
})

ipcRenderer.on('init-data', (e, obj) => {
    vm.id = obj.id
    vm.name = obj.name
    update = true
})
