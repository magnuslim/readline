const LineReader = require('./src/line_reader');
const Stream = require('stream');

module.exports = (stream, encoding = 'utf-8') => {
    if(!stream instanceof Stream.Readable) throw new Error('expect stream to be instance of Stream.Readable');
    return new LineReader(stream, encoding);
}