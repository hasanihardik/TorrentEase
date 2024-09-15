import { Request, Response, Express } from "express";
import express from "express";
require("dotenv").config();

import DownloadRouter from "./routes/downloader"
// const DownloadRouter = require("./routes/downloader");

// Configuring our Express App
const app: Express = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// The Landing route
app.get("/", (req: Request, res: Response) => {
	res.render("template/index.ejs");
});

app.use("/api/download", DownloadRouter);

// Running our server on a port
app.listen(process.env.PORT || 5000, () => {
	console.log("The server is running at port ", process.env.PORT || 5000);
});
