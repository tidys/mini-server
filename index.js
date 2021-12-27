#! /usr/bin/env node
let express = require('express');
let App = express();
const Os = require('os');
// App.all('*', (req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });
const dir = process.cwd();
App.use(express.static(dir));

function queryIpList () {
    // update ip address
    let ifaces = Os.networkInterfaces();
    let _ips = [];
    for (let ifname in ifaces) {
        ifaces[ifname].forEach((iface) => {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            if ('IPv4' === iface.family && iface.internal === false) {
                _ips.push(iface.address);
            }
        });
    }
    if (process.platform === 'win32') {
        _ips = _ips.filter((_ip) => {
            return /^(?!169\.254)/.test(_ip);
        });
    }
    return _ips;
}

let server = App.listen(9962, () => {
    let { address, port } = server.address();
    address = queryIpList()[0];
    console.log(`server dir: ${dir}`)
    const ips = [address, '127.0.0.1', 'localhost'];
    ips.forEach(ip => {
        console.log(`mini-server running: http://${ip}:${port}`);
    })
});

