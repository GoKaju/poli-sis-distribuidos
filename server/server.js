const net = require('net');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const port =  process.env.PORT || 3000;

const server = net.createServer(onClientConnection);


server.listen(port,function(){
   console.log(`Server started on port ${port} `); 
});

function onClientConnection(sock){

    console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);

    sock.on('data',function(data){
        const dataParsed = JSON.parse(data);

        if(dataParsed.event === 'createAccount'){
           const accountCreated =  createAccount(dataParsed);
           if (!accountCreated) {
            sock.write(`Error in created account ${dataParsed.accountNumber}`);
            return;
           }
            sock.write(`Account ${dataParsed.accountNumber} created with ${dataParsed.amount}`);

        }
    });

    sock.on('close',function(){
        console.log(`${sock.remoteAddress}:${sock.remotePort} Terminated the connection`);
    });

    sock.on('error',function(error){
        console.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`);
    });
};


function createAccount(data){
    const accountNumber = data.accountNumber;
    const amount = data.amount;
    if(!accountNumber || !amount){
        return false;
    }
    return saveInFile({
        accountNumber,
        amount
    });
}

function saveInFile(data){
    try {
        fs.writeFileSync('accounts.json',JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
}