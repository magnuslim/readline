module.exports = class {
	constructor(stream, encoding) {
		this._stream = stream;
		this._encoding = encoding;
		this._pendingResolves = [];
		this._pendingLines = [];
		this._buffer = Buffer.alloc(0);
		this._stream.on('data', (chunk) => {
			this._buffer = Buffer.concat([this._buffer, chunk]);
			let nlOffset = 0;
			while((nlOffset = this._buffer.indexOf(10)) >= 0) {
				this._addline(this._buffer.slice(0, nlOffset));
				this._buffer = this._buffer.slice(nlOffset + 1);
			}

			this._process();
			if (this._pendingLines.length > 0) {
				this._stream.pause();
			}
		});
		this._stream.on('end', () => {
			if (this._buffer.length <= 0) {
				return;
			}
			this._addline(this._buffer);
			this._process();
		});
	}

	readLine() {
		if (this._pendingLines.length > 0) {
			return Promise.resolve(this._pendingLines.shift());
		}
		return new Promise((resolve, reject) => {
			this._stream.resume();
			this._pendingResolves.push(resolve);
		});
	}

	_addline(lineAsBuffer) {
		this._pendingLines.push(lineAsBuffer.toString(this._encoding).replace(/\n|\r/g, ""));
	}

	_process() {
		const callTimes = Math.min(this._pendingResolves.length, this._pendingLines.length);
		if (callTimes > 0) {
			for (let i = 0; i < callTimes; ++i) {
				this._pendingResolves[i](this._pendingLines[i]);
			}
			this._pendingResolves = this._pendingResolves.slice(callTimes);
			this._pendingLines = this._pendingLines.slice(callTimes);
		}
	}
}