# promise-readline

read a file or stdin line by line in promise style.

# Install

```bash
npm install promise-readline --save
```

# Usage

```
// JFK.txt
We choose to go to the moon in this decade and do the other things,
not because they are easy, 
but because they are hard.
```

```javascript
const lineReader = require('promise-readline');

(async () => {
    //for stdin use: let lr = LineReader(process.stdin);
    let lr = lineReader(fs.createReadStream('JFK.txt'));

    await lr.readLine(); // We choose to go to the moon in this decade and do the other things,
    await lr.readLine(); // not because they are easy,
    await lr.readLine(); // but because they are hard.
    await lr.readLine(); // undefined
})()
.catch(console.err);
```