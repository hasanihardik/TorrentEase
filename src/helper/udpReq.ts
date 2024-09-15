import { AnnouncePacket } from "../Packets/announce_packet";
import { LocalStorage } from "../data/LocalStorage";
import { socket } from "../udp";

// I am keeping this funtion out of the class as it does not need any varialbles from it
// Here I am checking if it's a valid connection by verifying transaction ID request
// as well as storing the connection ID...

export const ValidConnectRes = (msg: Buffer, size: number) => {
	if (size < 16) {
		return false;
	}

	const action = msg.readInt32BE(0);
	const transaction_id = msg.readInt32BE(4);
	const connection_id = msg.readBigInt64BE(8);
	const localStorage = new LocalStorage();
	const sentTransactionID = localStorage.data.transactionID;

	if (action === 0 && transaction_id === sentTransactionID) {
		localStorage.data.connectionID = connection_id.toString();
		localStorage.writeToFile();
		return true;
	} else {
		return false;
	}
};

export const ValidAnnounceRes = (msg: Buffer, size: number) => {
	if (size < 20) {
		return false;
	}
	const action = msg.readInt32BE(0);
	const transaction_id = msg.readInt32BE(4);
	const interval = msg.readInt32BE(8);
	const leecher = msg.readInt32BE(12);
	const seeder = msg.readInt32BE(16);
	const localStorage = new LocalStorage();
	if (action === 1 && transaction_id === localStorage.data.transactionID) {
		console.log("A valid announce request came of size ", size);
		return true;
	} else {
		return false;
	}
};

export const makeAnnounceReq = () => {
	const announcePacket = new AnnouncePacket();
	const announceMessage = announcePacket.getAnnounceMessage();
	const localStorage = new LocalStorage();
	console.log(localStorage.data.trackerPort, localStorage.data.trackerHost);
	socket.send(announceMessage, localStorage.data.trackerPort, localStorage.data.trackerHost, (err, bytes) => {
		if (err) {
			console.log("Error", err);
		} else {
			console.log("The announce Message was sent succesfully!!", localStorage.data.trackerHost, localStorage.data.trackerPort);
		}
	});
};
