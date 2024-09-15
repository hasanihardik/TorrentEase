# Bit-Torrent Client (Peer to Peer protocol)

This is a BitTorrentClient using NodeJS, Typescript and this has a basic download endpoint which when provided a torrent file start downloading the data from the peers following the Standard Bit Torrent Protocol. It's a vary basic project and thus have a lot of limitation. Currently I am not thinking of improving it but If I get some time I might come back to it. The Current limitations that I know of are:

-   It only supports upd protocol for the tracker.
-   It sends all the block request in one go which I think is the cause my app breaks sometime in the middle
-   It very poorly arcitechtured.

## The Project Refrences

The links below are the project and documents that I have refered to while building the project (apart from stackoverflow 😜)

-   https://www.bittorrent.org/beps/bep_0015.html
-   https://wiki.theory.org/BitTorrentSpecification
-   https://allenkim67.github.io/programming/2016/05/04/how-to-make-your-own-bittorrent-client.html (really helpful time to time)
