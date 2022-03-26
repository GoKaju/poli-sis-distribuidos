const net = require("net");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const filename = "accounts.json";

const server = net.createServer(onClientConnection);

server.listen(port, function () {
  console.log(`Server started on port ${port} `);
});

function onClientConnection(sock) {
  console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);

  sock.on("data", function (data) {
    const dataParsed = JSON.parse(data);
    switch (dataParsed.event) {
      case "createAccount":
        const accountCreated = createAccount(dataParsed);
        if (!accountCreated) {
          sock.write("NO-OK");
          return;
        }
        sock.write("OK");
        break;
      case "getAccount":
        const account = getAccount(dataParsed);
        if (!account) {
          sock.write("NO-OK");
          return;
        }
        console.log(JSON.stringify(account));
        sock.write(`El saldo de su cuenta es $ ${account.amount}`);

      default:
        break;
    }
  });

  sock.on("close", function () {
    console.log(
      `${sock.remoteAddress}:${sock.remotePort} Terminated the connection`
    );
  });

  sock.on("error", function (error) {
    console.error(
      `${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`
    );
  });
}

function createAccount(data) {
  const accountNumber = data.accountNumber;
  const amount = data.amount;
  if (!accountNumber || !amount) {
    return false;
  }
  const accounts = readFromFile();
  accounts.push({
    accountNumber,
    amount,
  });
  return writeToFile(accounts);
}

function getAccount(data) {
  const accountNumber = data.accountNumber;
  if (!accountNumber) {
    return false;
  }
  const accounts = readFromFile();
  const account = accounts.find(
    (account) => account.accountNumber === accountNumber
  );
  return account;
}

function writeToFile(data) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}

function readFromFile() {
  try {
    const data = fs.readFileSync(filename);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
