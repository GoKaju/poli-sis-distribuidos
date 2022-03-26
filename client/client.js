const net = require('net');
const readline = require('readline').createInterface({
   input: process.stdin,
   output: process.stdout
 });

const dotenv = require('dotenv');
dotenv.config();
const port =  process.env.SERVER_PORT || 3000;
const host = '127.0.0.1';
const client = new net.Socket();

function init(){
   const data = readDataFromComnsole();

   const client = conectToServer();
   client.write(JSON.stringify(data));
   console.log(`Sending data to server ${JSON.stringify(data)}`);

}
init();



function readDataFromComnsole(){
   const data = {
      event: 'createAccount',
      accountNumber: '',
      amount: ''

   }

    readline.question('Ingresa tu numero de cuenta?', accountNumber => {
      data.accountNumber = accountNumber;
      readline.close();
    });

    readline.question('Ingresa el monto de tu cuenta?', amount => {
      data.amount = amount;
      readline.close();
    });
    return data
}

function conectToServer(){

   client.connect(port,host,function(){
      console.log(`Connected to server on ${host}:${port}`);
      //Connection was established, now send a message to the server.
      client.write(JSON.stringify({
            name: 'Client',
            message: 'Hello Server',
            event: 'message'
      }));
   });
   //Add a data event listener to handle data coming from the server
   client.on('data',function(data){
      console.log(`Server Says : ${data}`); 
   });
   //Add Client Close function
   client.on('close',function(){
      console.log('Connection Closed');
   });
   //Add Error Event Listener
   client.on('error',function(error){
      console.error(`Connection Error ${error}`); 
   });

   return client
}