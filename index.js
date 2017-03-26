var fs = require('fs');
var http = require('http');

var config = JSON.parse(
    fs.readFileSync('config.json')
    );

var client = require('dnsimple')({
        accessToken: config.TOKEN
    });

const ACCOUNT = config.ACCOUNT;
const DOMAIN = config.DOMAIN;


http.get({
    host: 'icanhazip.com',
    port: 80,
    path: '/',
    agent: false
}, (res) => {
    let body = '';

    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        console.log('Ip Address retrieved: '+body);
        const ipAddress = body;

        getARecord(ACCOUNT, DOMAIN).then((record) => {
            if(record.content != ipAddress)
                client.zones.updateZoneRecord(ACCOUNT, DOMAIN, record.id, { content : ipAddress } ).then(() => {
                    console.log("Updated " + record.id + " to address " + ipAddress);
                }).catch((err) => {
                    console.log("Error updating record: " + err.message + err.description);
                });
            else
                console.log("IP address is already set to " + ipAddress);
        }).catch();
    });
});

var getARecord = function(act,dmn) {
    return new Promise(function(resolve,reject){
        client.zones.allZoneRecords(act, dmn).then((records) => {
            var record = records.find((item) => {
                return item.type == 'A';
            })
            console.log('A Record: ' + record.id )
            resolve(record);
        }).catch((err) => {
            reject("Error listing records: " + err.message);
        });
    });
}
