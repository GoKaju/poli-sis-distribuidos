const net = require("net");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dotenv = require("dotenv");
const { connect } = require("http2");
const { exit } = require("process");
dotenv.config();

menu();

function menu() {
  console.log("Seleccione una opcion");
  readline.question(
    "1. Crear cuenta \n2. Consultar cuenta \n3. Salir \n",
    (option) => {
      switch (option) {
        case "1":
          readDataFromConsole();
          break;
        case "2":
          readline.question(
            "Ingresa el numero de cuenta? \n",
            (accountNumber) => {
              const data = {
                event: "getAccount",
                accountNumber: accountNumber,
              };
              writeToServer(data);
            }
          );
          break;
        case "3":
          readline.close();
          process.exit();
        default:
          menu();
          break;
      }
    }
  );
}

function readDataFromConsole() {
  const data = {
    event: "createAccount",
    accountNumber: "",
    amount: "",
  };

  readline.question("Ingresa tu numero de cuenta? \n", (accountNumber) => {
    data.accountNumber = accountNumber;
    readline.question("Ingresa el monto de tu cuenta? \n", async (amount) => {
      data.amount = amount;
      await writeToServer(data);
      readline.question("desea ingresar otra cuenta? si/no \n", (resp) => {
        if (resp.toLowerCase() === "si") {
          readDataFromConsole();
        } else {
          menu();
        }
      });
    });
  });

  return data;
}

async function writeToServer(data) {
  return new Promise((resolve, reject) => {
    const client = connectToServer();
    client.write(JSON.stringify(data));

    client.on("data", (data) => {
      client.end(() => {
        resolve(true);
      });
    });
  });
}

function connectToServer() {
  const port = process.env.SERVER_PORT || 3000;
  const host = "127.0.0.1";
  const client = new net.Socket();

  client.connect(port, host, function () {
    console.log(`Connected to server on ${host}:${port}`);
    //Connection was established, now send a message to the server.
  });
  //Add a data event listener to handle data coming from the server
  client.on("data", function (data) {
    console.log(`Server Says : ${data}`);
  });

  //Add Error Event Listener
  client.on("error", function (error) {
    console.error(`Connection Error ${error}`);
  });

  return client;
}
