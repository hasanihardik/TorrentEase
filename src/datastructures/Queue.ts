export class Queue {
	private requested: Boolean[];
	private recieved: Boolean[];
	private recievedCnt: number;

	constructor(len: number | undefined) {
		this.recieved = new Array(len).fill(false);
		this.requested = new Array(len).fill(false);
		this.recievedCnt = 0;
	}

	addRequested(pieceIndex: number) {
		this.requested[pieceIndex] = true;
	}

	addRecieved(pieceIndex: number) {
		this.recieved[pieceIndex] = true;
		this.recievedCnt++;
	}

	isDone() {
		return this.recieved.every((i) => i === true);
	}

	isRecieved(pieceIndex: number) {
		if (this.recieved.length <= pieceIndex) {
			return false;
		}

		return this.recieved[pieceIndex];
	}

	isRequested(pieceIndex: number) {
		// if isDone then updated requested to be recieved and return if the piece has been requested or not.
		if (this.requested.length <= pieceIndex) {
			return true;
		}

		if (this.isDone()) {
			this.requested = this.recieved.slice();
		}

		return this.requested[pieceIndex];
	}

	setRecieved(pieceIndex: number) {
		if (this.recieved.length <= pieceIndex) {
			return;
		}

		this.recieved[pieceIndex] = true;
		this.recievedCnt += 1;
		return;
	}

	setRequested(pieceIndex: number) {
		if (this.requested.length <= pieceIndex) {
			return;
		}

		this.requested[pieceIndex] = true;
		return;
	}

	printProgress() {
		const totPieces = this.recieved.length;
		console.log(`Download progress: ${this.recievedCnt}/${totPieces}`);
	}
}
