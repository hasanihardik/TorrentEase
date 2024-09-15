import net from "net";
import { socket } from "../udp";
import { Queue } from "../datastructures/Queue";
import { LocalStorage, torrentInfo } from "../data/LocalStorage";
import { requestPacket } from "../Packets/request_packet";

const BLOCK_LEN = Math.pow(2, 14);

export interface connectionProperties {
	chocked: boolean;
	havePieces: number[];
	PiecesRequest: boolean;
	RequestMade: boolean;
	PeerDetails: {
		ipAddress: string;
		portNo: number;
	};
}

export const chokeHandler = (
	
	socket: net.Socket,
	connectionProperties: connectionProperties
) => {
	// choke: <len=0001><id=0>
	console.log(
		`Chocked by the Peer: ${connectionProperties.PeerDetails.ipAddress}`
	);
	// socket.end();
	connectionProperties.chocked = true;
};

export const unchokeHandler = (
	socket: net.Socket,
	queue: Queue,
	connectionProperties: connectionProperties,
	localStorage: LocalStorage
) => {
	// unchoke: <len=0001><id=1>
	connectionProperties.chocked = false;
	console.log(
		`Recieved an unchocke request from the peer:${connectionProperties.PeerDetails.ipAddress}`
	);
	requestPiece(socket, connectionProperties, queue, localStorage);
};

export const haveHandler = (
	payload: Buffer,
	socket: net.Socket,
	connectionProperties: connectionProperties,
	queue: Queue,
	localStorage: LocalStorage
) => {
	// have: <len=0005><id=4><piece index>
	const pieceIndex = payload.readUInt32BE(0);
	connectionProperties.havePieces.push(pieceIndex);

	if (!connectionProperties.PiecesRequest) {
		// Doing this so it's called only once for a peer
		requestPiece(socket, connectionProperties, queue, localStorage);
	}
	console.log(
		`Recieved an have from the peer ${connectionProperties.PeerDetails.ipAddress}`
	);
	// console.log(
	// 	"Recieved an Have request",
	// 	pieceIndex,
	// 	connectionProperties.havePieces
	// );
};

export const bitFieldHandler = (
	payload: Buffer,
	socket: net.Socket,
	connectionProperties: connectionProperties,
	queue: Queue,
	localStorage: LocalStorage
) => {
	// bitfield: <len=0001+X><id=5><bitfield>
	console.log(
		`Recieve an bitfield Request from the peer ${connectionProperties.PeerDetails.ipAddress}`
	);

	const len = payload.length;
	for (let i = 0; i < len; i++) {
		let num = payload.readUInt8();
		for (let j = 0; j < 8; j++) {
			if (num % 2 == 1) {
				connectionProperties.havePieces.push(i * 8 + 7 - j);
			}
			num = Math.floor(num / 2);
		}
	}

	if (!connectionProperties.PiecesRequest)
		requestPiece(socket, connectionProperties, queue, localStorage);
};

export const requestHandler = () => {
	// request: <len=0013><id=6><index><begin><length>
};

export const pieceHandler = (
	index: number,
	begin: number,
	block: Buffer,
	localStorage: LocalStorage,
	queue: Queue,
	connectionProperties: connectionProperties,
	socket: net.Socket
) => {
	// piece: <len=0009+X><id=7><index><begin><block>
	// console.log("Piece Handler ", index, begin, localStorage.data.pieces);
	localStorage.data.pieces[index].blocks[begin] = block;
	localStorage.data.pieces[index].recieved += 1;

	if (
		localStorage.data.pieces[index].recieved ==
		localStorage.data.pieces[index].blocks.length
	) {
		connectionProperties.RequestMade = false;
		queue.addRecieved(index);
		queue.printProgress();
		requestPiece(socket, connectionProperties, queue, localStorage); // this would request the next piece from the peer
	}
};

export const cancelHandler = () => {
	// cancel: <len=0013><id=8><index><begin><length>
};
export const portHandler = () => {
	// port: <len=0003><id=9><listen-port>
};

export const defaultHandler = () => {};

export const pieceLength = (torrentInfo: torrentInfo, pieceIndex: number) => {
	const totLen = torrentInfo.Length;
	const pieceLen = torrentInfo.PieceLength;

	// Incase the pieceLen divides the totLen, the lastPieceInd would be +1 to the max possible piece ind and thus unatainable... So it should handle the edge case of the LastPieceLength to be zero;
	const lastPieceInd = Math.floor(totLen / pieceLen);
	const lastPieceLength = totLen % pieceLen;
	return pieceIndex === lastPieceInd ? lastPieceLength : pieceLen;
};

export const blocksPerPiece = (torrentInfo: torrentInfo, pieceInd: number) => {
	const pieceLen = pieceLength(torrentInfo, pieceInd);
	const blockSize = BLOCK_LEN;

	return Math.ceil(pieceLen / blockSize);
};

export const blockLen = (
	torrentInfo: torrentInfo,
	pieceInd: number,
	blockInd: number
) => {
	const pieceLen = pieceLength(torrentInfo, pieceInd);
	const blockLen = BLOCK_LEN;

	const lastBlockInd = Math.floor(pieceLen / blockLen);
	const lastBlockLen = pieceLen % blockLen;

	return blockInd == lastBlockInd ? lastBlockLen : blockLen;
};

const requestPiece = (
	socket: net.Socket,
	connectionProperties: connectionProperties,
	queue: Queue,
	localStorage: LocalStorage
) => {
	// Have to handle the request piece functionality

	if (connectionProperties.chocked) return null;
	console.log(
		`Requesting Pieces from the peer ${connectionProperties.PeerDetails.ipAddress}`
	);

	const data = new LocalStorage();
	const torrentinfo = data.data.torrentInfo;

	while (!queue.isDone() && connectionProperties.havePieces.length) {
		if (connectionProperties.RequestMade) continue; //skip If the Requestis AlreadyMade

		connectionProperties.RequestMade = false;
		const pieceIndex = connectionProperties.havePieces.shift();
		const pieceLen = pieceLength(torrentinfo!, pieceIndex!); // you can append a non null operator to say that these variable will not be null durning runtime

		if (pieceIndex && !queue.isRequested(pieceIndex)) {
			queue.setRequested(pieceIndex);
			connectionProperties.PiecesRequest = true;
			localStorage.data.pieces[pieceIndex].recieved = 0;
			const numOfBlocks = blocksPerPiece(torrentinfo!, pieceIndex);
			for (let i = 0; i < numOfBlocks; i++) {
				socket.write(requestPacket(pieceIndex, i, BLOCK_LEN)); //sending a request message
			}
			break;
		}
	}

	connectionProperties.PiecesRequest = false;
};
