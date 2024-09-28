const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const app = express();

const PORT = 3000;
let db;

app.use(express.json());

app.use(express.static("./public"));

app.use(fileUpload());

app.listen(PORT, ()=> {
	console.log(`Server listening on http://localhost:${PORT}`)
});

process.on("SIGINT", function () {
	process.exit(0);
});
