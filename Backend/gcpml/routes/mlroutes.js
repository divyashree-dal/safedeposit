//Author: Divyashree Bangalore Subbaraya (B00875916)
const express = require('express')

const router = express.Router();

const uploadController = require('../controller/uploadController')

//POST Route for the upload of image
router.post('/upload', uploadController.uploadFile);


module.exports = router;



