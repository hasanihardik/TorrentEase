import ConnectionPacket from "../Packets/connection_packet";
import { LocalStorage } from "../data/LocalStorage";
import TorrentStruct from "../datastructures/TorrentStruct";
import { socket } from "../udp";

export const getPeerList = async (torrent: TorrentStruct) => {
	let { protocol, host, serverPort, route } = getUrlInfo(torrent.AnnounceList[0]);
	// Have save to save the tracker port and host values for later use
	const localStorage = new LocalStorage();
	localStorage.data.trackerHost = host;
	localStorage.data.trackerPort = serverPort;
	localStorage.writeToFile();

	switch (protocol) {
		case "udp":
			// UDP Connect request
			console.log("Sending UDP packet!!");
			const connectPacket = new ConnectionPacket();
			socket.send(connectPacket.getConnectMessage(), serverPort, host, (error, msg) => {
				if (error) {
					console.log(error);
				} else {
					console.log("Message from the udp connect message", msg);
				}
			});
			break;
		case "http":
		case "https":
		// HTTP GET request
	}
};

export const generatePeerId = () => {
	const peer_id = "PP0000-" + Date.now();
	return Buffer.from(peer_id, "utf-8");
};

const getUrlInfo = (url: string) => {
	const urlInfo = url.split(/[:/]/);
	let protocol = urlInfo[0];
	let host = urlInfo[3];
	const serverPort = parseInt(urlInfo[4]);
	const route = urlInfo[5];
	return { protocol, host, serverPort, route };
};
