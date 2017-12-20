module.exports = class {
	constructor(stream, encoding) {
		this._stream = stream;
		this._stream.pause();
		this._encoding = encoding;
		this._pendingLines = [];
		this._buffer = Buffer.alloc(0);
		this._isEnded = false;
	}

	readLine() {
		if (this._pendingLines.length > 0) {
			return Promise.resolve(this._pendingLines.shift());
		}
		if(this._isEnded) {
			return undefined;
		}
		return new Promise((resolve, reject) => {
			this._stream.resume().on('data', (chunk) => {
				this._buffer = Buffer.concat([this._buffer, chunk]);
				let nlOffset = 0;
				while((nlOffset = this._buffer.indexOf(10)) >= 0) {
					this._addline(this._buffer.slice(0, nlOffset));
					this._buffer = this._buffer.slice(nlOffset + 1);
				}

				if (this._pendingLines.length > 0) {
					this._stream.pause();
				}
				resolve(this._pendingLines.shift());
			}).on('end', () => {
				this._isEnded = true;
				resolve(this._pendingLines.shift());
			});;
		});
	}

	_addline(lineAsBuffer) {
		this._pendingLines.push(lineAsBuffer.toString(this._encoding).replace(/\n|\r/g, ""));
	}
}