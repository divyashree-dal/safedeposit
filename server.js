//Author: Divyashree Bangalore Subbaraya (B00875916)
const express = require("express");

const http = require("http");

const app = require("./Backend/app");

const port = process.env.PORT || 8080;

const server = http.createServer(app);

const path = require("path");

const cors = require("cors");

app.use(cors());

server.listen(port, () => {
  console.log(`server listening at http://localhost:8080`);
});
