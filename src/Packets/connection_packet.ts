import { randomInt } from "crypto";
import { LocalStorage } from "../data/LocalStorage";

class ConnectionPacket {
	private transactionId: number;
	private connectMessage: Buffer;

	constructor() {
		this.transactionId = randomInt(1, 1e5);
		const protocolId = 0x41727101980;
		const action = 0; //connect
		this.connectMessage = Buffer.alloc(16);
		this.connectMessage.writeBigUInt64BE(BigInt(protocolId), 0);
		this.connectMessage.writeInt32BE(action, 8);
		this.connectMessage.writeInt32BE(this.transactionId, 12);

		const localStorage = new LocalStorage();
		localStorage.data.transactionID = this.transactionId;
		localStorage.writeToFile();
	}

	public getTransactionID() {
		return this.transactionId;
	}
	public getConnectMessage() {
		return this.connectMessage;
	}
}

export default ConnectionPacket;
