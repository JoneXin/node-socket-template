const { TlsClient } = require('../dist/client/app');

const tlsClient = new TlsClient(12341);

tlsClient.on('data', (data) => {
    console.log(data);
});

tlsClient.on('error', (err) => {
    console.log(err, '--000--');
});

tlsClient.on('reboot', ({ rebootTimes, isReboot }) => {
    console.log('reboot', '重启次数：', rebootTimes, '是否开启重启：', isReboot);
});
