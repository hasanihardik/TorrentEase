import dgram from "dgram";
import { makeAnnounceReq, ValidAnnounceRes, ValidConnectRes } from "./helper/udpReq";
import { LocalStorage } from "./data/LocalStorage";
import { initiateHandShake } from "./helper/handshake"
require("dotenv").config;

// If you ever make change in this line also make the same change in Announce Packet file
const udpPort: number = process.env.UDP_PORT !== undefined ? parseInt(process.env.UDP_PORT) : 3881;

export const socket = dgram.createSocket("udp4");
socket.bind(udpPort);

socket.on("listening", () => {
	const addrs = socket.address();
	console.log(`The udp server is listening on ${addrs.address}:${addrs.port}`);
});

socket.on("close", () => {
	socket.removeAllListeners();
	console.log("The udp socket is closed succesfully");
});

socket.on("message", (msg, rinfo) => {
	if (ValidConnectRes(msg, rinfo.size)) {
		console.log("Recieved a Valid Connection Request");
		// Need to make a announce request
		makeAnnounceReq();
	} else if (ValidAnnounceRes(msg, rinfo.size)) {
		const localStorage = new LocalStorage();
		localStorage.data.interval = msg.readUInt32BE(8);
		localStorage.data.leechers = msg.readUInt32BE(12);
		localStorage.data.seeders = msg.readUInt32BE(16);
		const n = (msg.length - 20) / 6;
		console.log("The number of peers are", n);
		localStorage.data.peers = [];
		for (let i = 0; i < n; i++) {
			const ipAddress = msg.readUInt32BE(20 + 6 * i);
			const mask = BigInt(255) << BigInt(24);
			const ipString = ((BigInt(ipAddress) & (BigInt(255) << BigInt(24))) >> BigInt(24)) + "." +
				((BigInt(ipAddress) & (BigInt(255) << BigInt(16))) >> BigInt(16)) + "." +
				((BigInt(ipAddress) & (BigInt(255) << BigInt(8))) >> BigInt(8)) + "." +
				(BigInt(ipAddress) & BigInt(255));

			localStorage.data.peers.push({
				ipAddress: ipString,
				portNo: msg.readUInt16BE(24 + 6 * i)
			})
		}
		localStorage.writeToFile();
		initiateHandShake();
	} else {
		console.log("A message come ", msg);
	}
});
