const {ipcRenderer} = require('electron')
let wid = ''

const vm = avalon.define({
    $id: 'addServerModal',
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
            to: 'add-server',
            data: {name: this.name},
            ctrl: 'close'
        })
    },

})

ipcRenderer.on('window-created', (e, id) => {
    wid = id
})

ipcRenderer.on('init-data', (e, obj) => {
    vm.name = obj.name
})
