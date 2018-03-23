var restify = require('restify');
var config = require('./config.json');
const bodyParser = require('body-parser');
var unirest = require("unirest");

/* 
sendNeo - POST API to send NEO assets to the required address.
Asset ID and quantity can be changed in the config file.
*/

function sendNeo(req, res, next) {
    
    if (!req.method === 'POST') {
        return next();
    }
    try{
        var userAddress = req.body.userAddress;
        if(userAddress != null){
            validateAddress(userAddress).then(function(isvalid){
                if(isvalid){
                    console.log("Sending neo..");
                    unirest.post(config.baseurl)
                    .headers({"cache-control": "no-cache"})
                    .send("{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"sendtoaddress\",\n  \"params\": [\""+config.neo_asset_id+"\", \""+userAddress+"\", "+config.neo_quant+"],\n  \"id\": 1\n}")
                    .end(function (response) {
                        res.json(response.body);
                    });
                }
                else{
                    res.json({'status':'failed','message':'Please provide a valid address'});
                }
            },function(err){
                res.json({'status':'failed','message':'Please provide a valid address'});
            });
        }else{
            res.json({'status':'failed','message':'Please provide an address'});
        }
    } catch (err) {
        console.log(err);  
    }
    next();

}
/*
Verify if the address matches the address pattern of the NEO blockchain.
@address - the address to be validated
*/
function validateAddress(address){

    return new Promise((resolve, reject) => {
        unirest.post(config.baseurl)
        .headers({"cache-control": "no-cache"})
        .send("{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"validateaddress\",\n  \"params\": [\""+address+"\"],\n  \"id\": 1\n}")
        .end(function (response) {
            if(response.body.result) {
                resolve(response.body.result.isvalid)
            }
            else{
                reject(false)
            }
        })
    });

}


var server = restify.createServer();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.post('/sendNeo/', sendNeo);

// server.listen(8080, function() {
//     console.log('%s listening at %s', server.name, server.url);
//   });

server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
