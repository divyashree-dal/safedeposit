// Author: Dinesh Kumar Baalajee Jothi (B00861292)
'use strict';
const aws = require('aws-sdk'); 
var docClient = new aws.DynamoDB.DocumentClient();
var DynamoDBTable = "register"; 

exports.handler = (event, context, callback) => {
    try {

        // Calling the function to find the safe deposit box number
        return boxNumber(event,callback);
        
    } catch (err) {
        callback(err);
    }
};

// Function to get the box number of the safe deposit
function boxNumber(event, callback) {
    
    // Get the user email and password if the user already signed in
    var Email = event.sessionAttributes.email;
    var password = event.sessionAttributes.password;
    
    if(typeof Email !== "undefined" && typeof password !== "undefined"){
    
    var params = {
            TableName: DynamoDBTable,
            Key:{
                "email_id": Email
            }
        };
          
        // This gets the safe deposit if the session details are correct
        docClient.get(params, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:");
            } else if(JSON.stringify(data, null, 4) !== ""){
                // Get the safe deposit alphnumeric box number
                var SafeDeposit = JSON.stringify(data.Item.safeDeposit).replace('"', '');
                
                // Checking if the session password is correct
                if(password.localeCompare(data.Item.password) == 0){
                      
                    let lambdaSuccessResponse = {
                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {        
                            contentType: "PlainText",
                            content: "Your Box Number is : " + SafeDeposit.replace('"','')  
                        }    
                        }
                    };
                    callback(null, lambdaSuccessResponse);
                    
                }
            }
        });
        
     } else {
                 
        let lambdaFailedResponse = {
                        dialogAction: {
                        type: 'Close',
                        fulfillmentState: "Fulfilled",
                        message: {
                            contentType: "PlainText",
                            content: "Please Sign in to your account to view the box number "
                        }   
                        }
                    };
        callback(null, lambdaFailedResponse);
     }
}