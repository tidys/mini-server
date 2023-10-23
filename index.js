#! /usr/bin/env node
let express = require('express');
let App = express();
const Os = require('os');
const Fs = require('fs');
const Path = require('path');
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

function queryIpList() {
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
  return _ips[0];
}

const Port = 9962;
const ips = [queryIpList(), '127.0.0.1', 'localhost'];

function printUrl(file) {
  ips.forEach(ip => {
    let url = `http://${ip}:${Port}`;
    if (file) {
      url += `/${file}`;
    }
    console.log(url);
  })
  console.log();
}
const options = {}
// TODO: 支持https，暂未验证
const https = false;
if (https) {
  options.key = Fs.readFileSync(Path.join(__dirname, 'certificate/private.pem'));
  options.cert = Fs.readFileSync(Path.join(__dirname, 'certificate/certificate.pem'));
}
const server = https.createServer(options, App);
server.listen(Port, () => {
  console.log(`mini-server running, server dir: ${dir}`);
  printUrl();
  const files = Fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.endsWith('.html')) {
      printUrl(file);
    }
  })
})