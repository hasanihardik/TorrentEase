export const requestPacket = (index: number, begin: number, length: number) => {
	const req = Buffer.alloc(17);
	req.writeUInt32BE(13, 0);
	req.writeUInt8(6, 4);
	req.writeUInt32BE(index, 5);
	req.writeUInt32BE(begin, 9);
	req.writeUInt32BE(length, 13);

	return req;
};
