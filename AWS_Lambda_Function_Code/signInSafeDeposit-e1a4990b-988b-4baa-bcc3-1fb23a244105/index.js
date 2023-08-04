// Author: Dinesh Kumar Baalajee Jothi (B00861292)
'use strict';
const aws = require('aws-sdk'); 
var docClient = new aws.DynamoDB.DocumentClient();
var DynamoDBTable = "register"; // Table to get the registered user details

exports.handler = (event, context, callback) => {
    try {

        return signin(event,callback);
        
    } catch (err) {
        callback(err);
    }
};

// Function to sign in to the safe deposit
function signin(event, callback) {
    
    // Getting the details entered in the chat box
    var emailID = event.currentIntent.slots.Email;
    var password = event.currentIntent.slots.Password;
    
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
                console.error("Unable to read item. Error JSON:");           
            } else if(JSON.stringify(data, null, 4) !== ""){
                //String the firstanme and lastname and replace the quotes
                var Fname = JSON.stringify(data.Item.firstName).replace('"', '');
                var Lname = JSON.stringify(data.Item.lastName).replace('"', '');
            
                // If the email id and the password is correct
                if(password.localeCompare(data.Item.password) == 0){
                    
                    // The JSON to send to the LEX as response from the function
                    let lambdaSuccessResponse = {
                        // We set the session attributes to keep the user logged in                     
                        sessionAttributes : {                      
                            "email": emailID,
                            "password": password
                        },                     
                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {                           
                            contentType: "PlainText",
                            content: "Welcome to Safe deposit, " + Fname.replace('"','') + " " + Lname.replace('"','')                          
                        }
                            
                        }
                        
                    };
                    callback(null, lambdaSuccessResponse);
                    
                } else {
                        
                    let lambdaFailedResponse = {

                        dialogAction: {
                        type: 'ConfirmIntent',
                        fulfillmentState: "Fulfilled",
                        message: {  
                            contentType: "PlainText",
                            content: "The details are not correct, Please check your email and password"                           
                        }                            
                        }        
                    };
                    callback(null, lambdaFailedResponse);
                }
            }
        });
}