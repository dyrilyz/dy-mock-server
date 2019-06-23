const {ipcRenderer} = require('electron')
let wid = ''

const vm = avalon.define({
    $id: 'addServerModal',
    name: '',
    cancel () {
        ipcRenderer.send('win-close', wid)
    },
    ok () {
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
