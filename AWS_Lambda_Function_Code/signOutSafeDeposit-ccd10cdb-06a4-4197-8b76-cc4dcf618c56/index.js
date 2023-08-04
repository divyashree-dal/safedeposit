// Author: Dinesh Kumar Baalajee Jothi (B00861292)
'use strict';
const aws = require('aws-sdk'); 
var docClient = new aws.DynamoDB.DocumentClient();
var DynamoDBTable = "register"; // Table to get the registered user details

exports.handler = (event, context, callback) => {
    try {

        return signout(event,callback);
        
    } catch (err) {
        callback(err);
    }
};

// Function to sign in to the safe deposit
function signout(event, callback) {
    
    // Getting the details entered in the chat box
    var emailID = event.sessionAttributes.email;
    var password = event.sessionAttributes.password;
    
    console.log("The email id is :" + event.sessionAttributes.email);
    
    if(typeof emailID !== "undefined" && typeof password !== "undefined" && emailID !== "" && password !== ""){
    
    // Parameters to read from the DynamoDB
    var params = {
            TableName: DynamoDBTable,
            Key:{
                "email_id": emailID
            }
        };
        
        // This gets the password of the email entered
        docClient.get(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(data, null, 4));
                console.error("Unable to read item. Error JSON:",JSON.stringify(err, null, 2));           
            } else if(JSON.stringify(data, null, 4) !== ""){
                //String the firstname and replace the quotes
                var Fname = JSON.stringify(data.Item.firstName).replace('"', '');
                    
                    // The JSON to send to the LEX as response from the function
                    let lambdaSuccessResponse = {
                        // We set the session attributes to empty to end the user session                  
                        sessionAttributes : {                      
                            "email": "",
                            "password": ""
                        },                     
                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {                           
                            contentType: "PlainText",
                            content: "Signing you out " + Fname.replace('"','') + "...............\n"+"\n Signed out! \n"                          
                        }
                        }
                    };
                    callback(null, lambdaSuccessResponse);
                    
            }
        });
    } else {
        let lambdaFailedResponse = {

                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {  
                            contentType: "PlainText", 
                            content: "You have not signed in yet."                           
                        }                            
                        }        
                    };
                    callback(null, lambdaFailedResponse);
    }
}