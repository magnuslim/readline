const lineReader = require('..');
const fs = require('fs');

(async () => {
    let lr = lineReader(fs.createReadStream(`${__dirname}/JFK.txt`));

    console.log(await lr.readLine()); // We choose to go to the moon in this decade and do the other things,
    console.log(await lr.readLine()); // not because they are easy,
    console.log(await lr.readLine()); // but because they are hard.
    console.log(await lr.readLine()); // undefined
})()
.catch(console.error);