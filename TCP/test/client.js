const { TcpClient } = require('../dist/client/app');

let client = new TcpClient();

client.on('data', (data) => {
    console.log(data);
});

client.on('error', (err) => {
    console.log(err, '--000--');
});

client.on('reboot', ({ rebootTimes, isReboot }) => {
    console.log('reboot', '重启次数：', rebootTimes, '是否开启重启：', isReboot);
});
