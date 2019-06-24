const {app, BrowserWindow, ipcMain} = require('electron')

ipcMain.on('win-minimize', (e, id) => {
    const win = BrowserWindow.fromId(id)
    if (win) win.minimize()
})

ipcMain.on('win-close', (e, id) => {
    const win = BrowserWindow.fromId(id)
    if (win) win.close()
})

ipcMain.on('top-toggle', (e, flag, id) => {
    const win = BrowserWindow.fromId(id)
    if (win) win.setAlwaysOnTop(flag)
})

// 事件中转(子窗口->父窗口)
ipcMain.on('transfer', (e, data) => {
    const win = BrowserWindow.fromId(data.id)
    if (win) {
        const parent = win.getParentWindow()
        parent && parent.webContents.send(data.to, data.data)
        if (data.ctrl === 'close') {
            win.close()
        }
    }
})

ipcMain.on('add-server-modal', (e, id) => {
    const win = createWindow({
        modal: true,
        parent: BrowserWindow.fromId(id),
        width: 350,
        minWidth: this.width,
        height: 180,
        minHeight: this.height,
        resizable: false
    })
    win.loadFile('pages/add-server/add-server.html')
})

ipcMain.on('add-ifc-modal', (e, id) => {
    const win = createWindow({
        modal: true,
        parent: BrowserWindow.fromId(id),
        width: 500,
        minWidth: this.width,
        height: 550,
        minHeight: this.height,
        resizable: false
    })
    win.loadFile('pages/add-ifc/add-ifc.html')
})

// 创建窗口
function createWindow (obj) {
    let wConf = {
        width: 950,
        height: 650,
        minWidth: 950,
        minHeight: 650,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        },
        transparent: true,
        show: false,
    }

    if (obj) {
        Object.assign(wConf, obj)
    }

    let win = new BrowserWindow(wConf)

    win.on('closed', () => {
        win = null
    })

    win.webContents.on('did-finish-load', e => {
        win.show()
        win.webContents.send('window-created', win.id)
    })

    // win.webContents.openDevTools()

    return win
}

app.on('ready', () => {
    const win = createWindow()
    win.loadFile('pages/index/index.html')
})
