const net = require("net");

class TcpClient {
  client;
}

const client = net.createConnection({ port: 9009, host: "127.0.0.1" }, () =>
  init()
);

const init = () => {
  console.log("init client");
};

client.on("data", messageHandler);
client.on("error", errorHandler);
client.on("end", connEndHander);

const messageHandler = (msg) => {
  try {
    const { cmd, data } = JSON.parse(msg);
    // 根据cmd处理业务逻辑
  } catch (_) {
    console.err(_);
  }
};

const errorHandler = (err) => {
  console.error(err);
};

const connEndHander = () => {
  console.warn("链接断开");
};
