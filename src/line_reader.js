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
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			let resolved = false; // Mark promise as resolved, or it may be resolved twice.(ondata & onend)
			this._stream.resume().on('data', (chunk) => {
				this._stream.pause();
				this._buffer = Buffer.concat([this._buffer, chunk]);

				// Save complete lines into this._pendingLines and leave other characters in buffer.
				let nlOffset = 0;
				while((nlOffset = this._buffer.indexOf(10)) >= 0) {
					this._addline(this._buffer.slice(0, nlOffset));
					this._buffer = this._buffer.slice(nlOffset + 1);
				}

				if(!resolved) {
					let r = resolve(this._pendingLines.shift());
					resolved = true;
				}
			}).on('end', () => {
				this._isEnded = true;

				// The left chatarcters remain one line.
				if(this._buffer.length > 0) {
					this._addline(this._buffer);
					this._buffer = Buffer.alloc(0);
				}

				if(!resolved) {
					resolve(this._pendingLines.shift());
					resolved = true;
				}
			});;
		});
	}

	_addline(lineAsBuffer) {
		this._pendingLines.push(lineAsBuffer.toString(this._encoding).replace(/\n|\r/g, ""));
	}
}