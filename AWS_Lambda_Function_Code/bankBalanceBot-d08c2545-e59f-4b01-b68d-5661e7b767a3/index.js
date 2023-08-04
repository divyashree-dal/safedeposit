// Author: Dinesh Kumar Baalajee Jothi (B00861292)
'use strict';
const aws = require('aws-sdk');
var docClient = new aws.DynamoDB.DocumentClient();
var dynamoDBTable = "safe_deposit"; // Table to get the box information

// Handle the lex event
exports.handler = (event, context, callback) => {
    try {

        return bankBalance(event,callback);
        
    } catch (err) {
        callback(err);
    }
};

// Function to check the balnce in the safe deposit box
function bankBalance(event, callback) {
    
    // Getting the login details if there was a session and the user logged in
    var Email = event.sessionAttributes.email;
    var Password = event.sessionAttributes.password;
    
    // Checking if the email is empty or undefined if there was no session
    if(typeof Email !== "undefined" && typeof Password !== "undefined" && Email !== "" && Password !== ""){
          
         // Parameters to get the box details and its balance
         var Boxparams = {
            TableName: "register",
            Key:{
                "email_id": Email
            }
        };  

        docClient.get(Boxparams, function(err, data) {
            if (err) {
                console.error("Unable to read item"); 
            } else if(JSON.stringify(data, null, 4) !== ""){
                //String the firstanme and lastname
                var SafeDeposit = JSON.stringify(data.Item.safeDeposit).replace('"', '');
                
                // Parameters to get the data from safe_deposit table
                var params = {
                 TableName: dynamoDBTable,
                  Key:{
                   "serial_number": SafeDeposit.replace('"','')
                   }
                  };
                          
                docClient.get(params, function(err, data) {
                 if (err) {
                   console.error("Unable to read item");
                
                 } else if(JSON.stringify(data, null, 4) !== ""){
                
                     var balanceofSafeBox = data.Item.balance; // Get the balance of the safe deposit from the table
                     // Response to the LEX
                     let lambdaSuccessResponse = {
                        sessionAttributes : {  
                            "email": Email,
                            "password": Password
                        },
                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {   
                            contentType: "PlainText",
                            content: "Your balance in the safe deposit is  " + balanceofSafeBox
                            
                        }  
                        } 
                    };
                    callback(null, lambdaSuccessResponse);
                 }
                });
            }
        });
    } else {     
        let lambdaFailedResponse = {
                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {
                            contentType: "PlainText",
                            content: "Please Sign in to your account to view the balance  "
                        }     
                        }
                    };
        callback(null, lambdaFailedResponse);
    }         
}  