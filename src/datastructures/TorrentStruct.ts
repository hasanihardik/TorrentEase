import crypto from "crypto";
import { LocalStorage } from "../data/LocalStorage";
import bencodec,  {encode}  from "bencodec";

interface torrentFile {
	announce: Buffer;
	"announce-list"?: Array<Array<Buffer>>;
	comment?: Buffer;
	"created by": Buffer;
	"creation date": number;
	info: {
		length: number;
		files: Array<{
			length: number;
			path: Array<Buffer>;
		}>;
		name: Buffer;
		"piece length": number;
		pieces: Buffer;
		source?: Buffer;
	};
}
class TorrentStruct {
	public Announce: string;
	public AnnounceList: Array<string>;
	public InfoHash: Buffer;
	public PieceHashes: Array<Array<any>>;
	public PieceLength: number;
	public Length: number;
	public Name: string;

	constructor(val: torrentFile, buffer: Buffer) {
		this.Announce = val.announce.toString();
		this.AnnounceList = [];
		if (val["announce-list"] !== undefined) {
			val["announce-list"].forEach((ele) => {
				this.AnnounceList.push(...ele.map((e) => e.toString()));
			});
		}
		this.AnnounceList.push(this.Announce);

		// Calculating infoHash from it's substring in the torrent file.
		this.InfoHash = findInfoHash(buffer);

		this.PieceLength = val.info["piece length"];
		this.Name = val.info.name.toString();
		this.PieceHashes = [[]];
		for (let index = 0; index < val.info.pieces.length; index++) {
			const arrLen = this.PieceHashes.length;
			// legnth of a SHA1 hash is 160bits i.e 20 bytes...
			if (this.PieceHashes[arrLen - 1].length < 20) {
				this.PieceHashes[arrLen - 1].push(val.info.pieces.at(index));
			} else {
				this.PieceHashes.push([val.info.pieces.at(index)]);
			}
		}
		this.Length = val.info.length;
		// Adding the content to local file...
		const data = new LocalStorage();
		data.data.torrentInfo = JSON.parse(JSON.stringify(this));
		data.writeToFile();
	}
}

export default TorrentStruct;

function findInfoHash(content: Buffer) {
	const torDetails: any = bencodec.decode(content);
	const info = bencodec.encode(torDetails.info);
	return crypto.createHash("sha1").update(info).digest();
}
