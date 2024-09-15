import { LocalStorage } from "../data/LocalStorage";
import { generatePeerId } from "../helper/Peers";
require("dotenv").config();

export class AnnouncePacket {
	private transactionId: number = 0;
	private connectionId: bigint = BigInt(0);
	private infoHash?: Buffer;
	private peerId: Buffer;
	private downloaded: bigint;
	private left: bigint = BigInt(0);
	private uploaded: bigint;
	private event: "none" | "Completed" | "Started" | "Stopped";
	private ip?: number; // Optional so omiting
	private numWant?: number; //Optional so omiting
	private port: number;

	constructor() {
		const localStorage = new LocalStorage();
		const { transactionID, connectionID, torrentInfo } = localStorage.data;

		if (transactionID && connectionID && torrentInfo?.Length) {
			this.transactionId = transactionID;
			this.connectionId = BigInt(connectionID);
			this.left = BigInt(torrentInfo.Length);
		}
		// After saving the buffer value it get's converted to json object we need to convert it back to json..
		if (localStorage.data.torrentInfo) this.infoHash = Buffer.from(localStorage.data.torrentInfo?.InfoHash.data);

		this.peerId = generatePeerId();
		localStorage.data.peerId = this.peerId.toJSON();
		this.downloaded = BigInt(0);
		this.uploaded = BigInt(0);
		this.port = process.env.UDP_PORT !== undefined ? parseInt(process.env.UDP_PORT) : 6881;
		this.numWant = -1;
		localStorage.data.event = this.event = "Started";

		// going to save details my local storage
		localStorage.data.downloaded = "0";
		localStorage.data.uploaded = "0";
		localStorage.writeToFile();
	}

	public getAnnounceMessage() {
		const action = 1; // Announce code...
		const eventMap = { none: 0, Completed: 1, Started: 2, Stopped: 3 }; // 0: none; 1: completed; 2: started; 3: stopped

		const announceMessage = Buffer.alloc(98);
		announceMessage.writeBigInt64BE(this.connectionId, 0);
		announceMessage.writeInt32BE(action, 8);
		announceMessage.writeInt32BE(this.transactionId, 12);
		if (this.infoHash) this.infoHash.copy(announceMessage, 16, 0, 20);
		if (this.peerId) this.peerId.copy(announceMessage, 36, 0, 20);
		announceMessage.writeBigInt64BE(this.downloaded, 56);
		announceMessage.writeBigInt64BE(this.left, 64);
		announceMessage.writeBigInt64BE(this.uploaded, 72);
		announceMessage.writeInt32BE(eventMap[this.event], 80);
		announceMessage.writeInt32BE(0, 84); //IP ->optional
		announceMessage.writeInt32BE(50, 88); // key being my 0 also optional
		announceMessage.writeInt32BE(50, 92); // default value for num_want also optional
		announceMessage.writeInt16BE(this.port, 96);

		return announceMessage;
	}
}
