const fs = require("fs");
const crypto = require('crypto');
const {stringify} = require('csv');
let generateUUID = () => {
    const uuidList = [];
    for (let i = 0; i < 1_000_000; i++) {
        uuidList.push({
            "uuid": crypto.randomUUID(),
        });
    }

    stringify(uuidList, { header: true}, (err, output) => {
        fs.writeFile('payloads/socketioUUID.csv', output, (err) => {});
    });
}

console.log("Generating UUID csv file...")
generateUUID();
console.log("Done generating UUID csv file!")
