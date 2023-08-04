/* Author Samiksha Narendra Salgaonkar */
const express = require('express');
const router = express.Router();

const messagingController=require('../controllers/messagingControllers');

router.post('/message/topic', messagingController.postMessageTopic);
router.post("/message/publishMessage", messagingController.publishMessage);
router.post("/message/pullMessage", messagingController.pullMessages);

module.exports = router;