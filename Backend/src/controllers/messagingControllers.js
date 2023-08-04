/* Author Samiksha Narendra Salgaonkar */
const { PubSub } = require("@google-cloud/pubsub");
const { v1 } = require("@google-cloud/pubsub");
const pubSubClient = new PubSub({ keyFilename: "csci5410-sdp-project-27df84cdd7e8.json" });
const aws = require('aws-sdk');
require('dotenv').config();

const awsCredentials = {
    "accessKeyId": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY,
    "sessionToken": process.env.SESSION_TOKEN,
     "region": "us-east-1"
}

// AWS credentials to access the AWS Services
aws.config.update(awsCredentials);

const docClient = new aws.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
var messageData = "";

const getTopicName = async (emailObject) => {
    const email = emailObject.email;

    try {
        var params = {
            TableName: "register",
            ProjectionExpression: "topicName",
            Key: {
                "email_id": email
            }
        };

        const data = await docClient.get(params).promise();
        return data.Item.topicName;
    } catch (e) {
        console.log({ e });
        return ("Internal Server Error!");
    }
};

const getSubscriptionName = async (emailObject) => {
    const email = emailObject;
    try {
        var params = {
            TableName: "register",
            ProjectionExpression: "subscriptionName",
            Key: {
                "email_id": email
            }
        };

        const data = await docClient.get(params).promise();
        return data.Item.subscriptionName;
    } catch (e) {
        console.log({ e });
        return ("Internal Server Error!");
    }
};

// const createSubscription = async (topicDetails) => {
//     const topicName = topicDetails;
//     const uniqueID = uuidv4().toString();
//     const subscriptionName = 'subscription-' + uniqueID;
//     try {
//         await pubSubClient.topic(topicName).createSubscription(subscriptionName);
//         return subscriptionName;
//     } catch (e) {
//         console.log({ e });
//         return ("Internal Server Error!");
//     }
// };

const updateRegistrationDetails = async (topicDetails) => {
    const email = topicDetails.email;
    const topicName = topicDetails.topicName;
    const params = {
        TableName: "register",
        Key: {
            "email_id": email
        },
        UpdateExpression: "set topicName = :topic",
        ExpressionAttributeValues: {
            ':topic': topicName
        }
    };

    docClient.update(params, function (err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}

// const updateSubscriptionDetails = async (subscriptionDetails) => {
//     const email = subscriptionDetails.email;
//     const subscriptionName = subscriptionDetails.subscriptionName;

//     const params = {
//         TableName: "register",
//         Key: {
//             "email_id": email
//         },
//         UpdateExpression: "set subscriptionName = :subscription",
//         ExpressionAttributeValues: {
//             ':subscription': subscriptionName
//         }
//     };

//     docClient.update(params, function (err, data) {
//         if (err) console.log(err);
//         else console.log(data);
//     });
// }

// const setMessageData = (subscriptionID) => {
// }
const some_function = (subscriptionID) => {
    return new Promise((resolve, reject) => {
        const timeout = 60;
        let counter = 0;
        const messageHandler = (message) => {
            console.log(`Message: ${message.id}:`);
            console.log(`\tMessageBody: ${message.data}`);
            messageData = message.data;
        resolve(message.data);
            console.log(`\tAttributes: ${message.attributes}`);
            counter += 1;
            message.ack();
        };
        subscriptionID.on("message", messageHandler);
        setTimeout(() => {
            subscriptionID.removeListener("message", messageHandler);
            console.log(`${counter} message(s) received.`);
        }, timeout * 100);
    });

}

exports.pullMessages = async (req, res) => {

    const email = req.body.email;
    
    const subscriptionName = await getSubscriptionName(email);
    const subscriptionID = pubSubClient.subscription(subscriptionName);
    const timeout = 60;
    let counter = 0;
    messageData = await some_function(subscriptionID);
    console.log(messageData);
    console.log("ab bass return krna hai")
    return res.status(200).json({
        success: true,
        message: messageData
    });
};

exports.postMessageTopic = async (req, res) => {
    const email = req.body.email;
    const uniqueID = uuidv4().toString();
    const topicName = "safe-deposit-box-topic-" + uniqueID;
    try {
        await pubSubClient.createTopic(topicName);
        const topicDetails = {
            email: email,
            topicName: topicName
        };
        await updateRegistrationDetails(topicDetails);
        return res.status(200).json({
            success: true,
            message: `Topic ${topicName} created successfully!`,
        });
    } catch (e) {
        console.log({ e });
        return res.status(500).send("Internal Server Error!");
    }
};

exports.publishMessage = async (req, res) => {

    try {
        const email = req.body.email;

        const message = req.body.message;

        const emailObject = {
            email: email
        };

        const topicName = await getTopicName(emailObject);
        
        const messageIdentifier = await pubSubClient.topic(topicName).publishMessage({ data: Buffer.from(JSON.stringify(message)) });

        return res.status(200).json({
            success: true,
            message: `Topic ${messageIdentifier} published successfully!`,
        });
    } catch (e) {
        console.log({ e });
        return res.status(500).send("Internal Server Error!");
    }
};
