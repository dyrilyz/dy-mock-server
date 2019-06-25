const {BrowserWindow, ipcMain} = require('electron')
const winPromise = []

function createWindow (opt) {
    let conf = {
        width: 950,
        height: 650,
        minWidth: 950,
        minHeight: 650,
        frame: false,
        // transparent: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
    }

    if (opt) {
        Object.assign(conf, opt)
    }

    let win = new BrowserWindow(conf)
    let id = win.id
    winPromise.push({
        id,
        getWin: new Promise(resolve => {
            win.webContents.on('did-finish-load', e => {
                win.show()
                win.webContents.send('window-created', id)
                resolve(win)
            })
        })
    })

    win.on('closed', () => {
        for (const i in winPromise) {
            if (winPromise[i].id === id) {
                winPromise.splice(i, 1)
                win = null
                id = null
                break
            }
        }
    })

    return win
}

function getShowedWinById (id) {
    for (const i in winPromise) {
        if (winPromise[i].id === id) {
            return winPromise[i].getWin
        }
    }
}

function winToWin (fromId, toId, eName, data) {
    return getShowedWinById(fromId).then(() => {
        return getShowedWinById(toId).then(toWin => {
            toWin.webContents.send(eName, data)
        })
    })
}

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

module.exports = {createWindow, getShowedWinById, winToWin}
