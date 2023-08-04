// Code referenced from: https://www.bezkoder.com/google-cloud-storage-nodejs-upload-file/
//Author: Divyashree Bangalore Subbaraya (B00875916)
const util = require('util');
const Multer = require("multer");

let preprocessFile = Multer({
    storage: Multer.memoryStorage()
}).single('file');

let processFile = util.promisify(preprocessFile);

module.exports = processFile;