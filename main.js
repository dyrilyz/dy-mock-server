const {app, BrowserWindow, ipcMain} = require('electron')
const wm = require('./window-manager')

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

ipcMain.on('add-server-modal', (e, obj) => {
    const win = wm.createWindow({
        modal: true,
        parent: BrowserWindow.fromId(obj.id),
        width: 350,
        minWidth: this.width,
        height: 250,
        minHeight: this.height,
        resizable: false
    })
    win.loadFile('pages/add-server/add-server.html')
    // win.webContents.openDevTools()
    if (obj.conf) {
        wm.winToWin(obj.id, win.id, obj.conf.eventName, obj.conf.data)
    }
})

ipcMain.on('add-ifc-modal', (e, obj) => {
    const win = wm.createWindow({
        modal: true,
        parent: BrowserWindow.fromId(obj.id),
        width: 500,
        minWidth: this.width,
        height: 550,
        minHeight: this.height,
        resizable: false
    })
    win.loadFile('pages/add-ifc/add-ifc.html')
    if (obj.conf) {
        wm.winToWin(obj.id, win.id, obj.conf.eventName, obj.conf.data)
    }
})

app.on('ready', () => {
    const win = wm.createWindow()
    // win.webContents.openDevTools()
    win.loadFile('pages/index/index.html')
})
