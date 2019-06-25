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
        height: 180,
        minHeight: this.height,
        resizable: false
    })
    win.loadFile('pages/add-server/add-server.html')
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

    return win
}

app.on('ready', () => {
    const win = wm.createWindow()
    win.loadFile('pages/index/index.html')
    win.webContents.openDevTools()
})
