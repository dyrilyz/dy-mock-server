function dialog (msg, time) {
    if (dialog.$style) {
        dialog.$style.remove()
    }
    if (dialog.$dom) {
        dialog.$dom.remove()
    }
    const timeout = time || 3000
    const [$dom, $style] = [
        createDom(msg),
        createStyle(timeout),
    ]
    document.head.appendChild($style)
    document.body.appendChild($dom)
    let {width, height} = window.getComputedStyle($dom)
    width = width.replace('px','')
    height = height.replace('px','')
    $dom.style.marginLeft = `-${width / 2}px`
    $dom.style.left = '50%'

    dialog.$dom = $dom
    dialog.$style = $style
    setTimeout(() => {
        $style.remove()
        $dom.remove()
    }, timeout)
}

function createStyle (timeout) {
    const $style = document.createElement('style')
    $style.innerText = `
        .dia-log {
            display: block;
            padding: 5px 10px;
            position: fixed;
            max-width: 80%;
            opacity: 0;
            background-color: #0009;
            color: #fff;
            word-break: break-all;
            border-radius: 5px;
            animation: diaLog ${timeout}ms;
        }
        
        @keyframes diaLog {
            0%,100% {
                bottom: -100%;
                opacity: 0;
            }
        
            15%,80% {
                bottom: 30px;
                opacity: 1;
            }
        }
    `.replace(/\s{2,}/g, '').replace(/{/g, ' {').replace(/}/g, '} ')
    return $style
}

function createDom (msg) {
    const $dom = document.createElement('div')
    $dom.classList.add('dia-log')
    $dom.innerHTML = msg
    return $dom
}

module.exports = {dialog}
