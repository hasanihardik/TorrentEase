import { Buffer } from "buffer";
import { LocalStorage } from "../data/LocalStorage";

export const buildHandshakePacket = () => {
	const localStorage = new LocalStorage();

	const buffer = Buffer.alloc(68);
	buffer.writeUInt8(19, 0); //protocol string len
	buffer.write("BitTorrent protocol", 1); //protocol string
	buffer.writeBigInt64BE(BigInt(0), 20); // reserved bits

	if (localStorage.data.torrentInfo) {
		Buffer.from(localStorage.data.torrentInfo.InfoHash.data).copy(
			buffer,
			28
		);
	} else {
		throw new Error("TCP connection to clients Requires a InfoHash");
	}
	if (localStorage.data.peerId) {
		Buffer.from(localStorage.data.peerId.data).copy(buffer, 48);
	} else {
		throw new Error("TCP connection to clients requires a PeerId");
	}
	return buffer;
};

export const buildKeepAlive = () => {
	//id=0
	const buffer = Buffer.alloc(4);
	buffer.writeInt32BE(0, 0);
	return buffer;
};

export const buildChoke = () => {
	const buffer = Buffer.alloc(5);
	buffer.writeInt32BE(1, 0); //length
	buffer.writeInt8(0, 4);
	return buffer;
};

export const buildUnChoke = () => {
	const buffer = Buffer.alloc(5);
	buffer.writeInt32BE(1, 0); //length
	buffer.writeInt8(1, 4);
	return buffer;
};

export const buildInterested = () => {
	const buffer = Buffer.alloc(5);
	buffer.writeInt32BE(1, 0); //length
	buffer.writeInt8(2, 4);
	return buffer;
};

export const buildNotInterested = () => {
	const buffer = Buffer.alloc(5);
	buffer.writeInt32BE(1, 0); //length
	buffer.writeInt8(3, 4);
	return buffer;
};

export const buildhave = (payload: number) => {
	const buffer = Buffer.alloc(9);
	buffer.writeUInt32BE(5, 0);
	buffer.writeUInt8(4, 4);
	buffer.writeUInt32BE(payload, 5);
	return buffer;
};

export const buildBitField = (bitfield: number[]) => {
	const buffer = Buffer.alloc(14);
	buffer.writeUInt32BE(bitfield.length + 1, 0);
	buffer.writeInt8(5, 4);
	Buffer.from(bitfield).copy(buffer, 5);
	return buffer;
};
export const buildRequest = (payload: {
	index: number;
	begin: number;
	length: number;
}) => {
	const buf = Buffer.alloc(17);
	// length
	buf.writeUInt32BE(13, 0);
	// id
	buf.writeUInt8(6, 4);
	// piece index
	buf.writeUInt32BE(payload.index, 5);
	// begin
	buf.writeUInt32BE(payload.begin, 9);
	// length
	buf.writeUInt32BE(payload.length, 13);
	return buf;
};

export const buildPiece = (payload: {
	block: { length: number; copy: (arg0: Buffer, arg1: number) => void };
	index: number;
	begin: number;
}) => {
	const buf = Buffer.alloc(payload.block.length + 13);
	// length
	buf.writeUInt32BE(payload.block.length + 9, 0);
	// id
	buf.writeUInt8(7, 4);
	// piece index
	buf.writeUInt32BE(payload.index, 5);
	// begin
	buf.writeUInt32BE(payload.begin, 9);
	// block
	payload.block.copy(buf, 13);
	return buf;
};

export const buildCancel = (payload: {
	index: number;
	begin: number;
	length: number;
}) => {
	const buf = Buffer.alloc(17);
	// length
	buf.writeUInt32BE(13, 0);
	// id
	buf.writeUInt8(8, 4);
	// piece index
	buf.writeUInt32BE(payload.index, 5);
	// begin
	buf.writeUInt32BE(payload.begin, 9);
	// length
	buf.writeUInt32BE(payload.length, 13);
	return buf;
};

export const buildPort = (payload: number) => {
	const buf = Buffer.alloc(7);
	// length
	buf.writeUInt32BE(3, 0);
	// id
	buf.writeUInt8(9, 4);
	// listen-port
	buf.writeUInt16BE(payload, 5);
	return buf;
};
