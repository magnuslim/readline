module.exports = class {
	constructor(stream, encoding) {
		this._stream = stream;
		this._stream.pause();
		this._encoding = encoding;
		this._pendingLines = [];
		this._buffer = Buffer.alloc(0);
		this._isEnded = false;
		this._stream.on('end', () => {
			this._isEnded = true;
			// The left chatarcters remain one line.
			if(this._buffer.length > 0) {
				this._addline(this._buffer);
				this._buffer = Buffer.alloc(0);
			}
		});
	}

	readLine() {
		if (this._pendingLines.length > 0) {
			return Promise.resolve(this._pendingLines.shift());
		}
		if(this._isEnded) {
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			let onData = (chunk) => {
				this._stream.pause();
				// Remove all callback, otherwise it would always bind to event 'data', and will be called next time event 'data' is fired.
				this._stream.removeListener('data', onData);
				// Make sure that resolve() will always be called just one time.
				this._stream.removeListener('end', onEnd); 

				// Save complete lines into this._pendingLines and leave other characters in buffer.
				this._buffer = Buffer.concat([this._buffer, chunk]);
				let nlOffset = 0;
				while((nlOffset = this._buffer.indexOf(10)) >= 0) {
					this._addline(this._buffer.slice(0, nlOffset));
					this._buffer = this._buffer.slice(nlOffset + 1);
				}

				// Recursion is for very long line.
				resolve(this.readLine());
			};
			let onEnd = () => {
				resolve(this.readLine());
			};
			this._stream.on('data', onData).on('end', onEnd).resume();
		});
	}

	_addline(lineAsBuffer) {
		this._pendingLines.push(lineAsBuffer.toString(this._encoding).replace(/\n|\r/g, ""));
	}
}