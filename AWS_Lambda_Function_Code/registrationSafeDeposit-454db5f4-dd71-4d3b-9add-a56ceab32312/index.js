// Author : Dinesh Kumar Baalajee Jothi (B00861292)
'use strict';
const aws = require('aws-sdk'); 
var docClient = new aws.DynamoDB.DocumentClient();
var DynamoDBTable = "register"; // Table to get the user details

exports.handler = (event, context, callback) => {
    try {

        return Register(event,callback);
        
    } catch (err) {
        callback(err);
    }
};

// Function to Register to the safe deposit
function Register(event, callback) {
    
    // Get the details needed for registration
    var emailID = event.currentIntent.slots.email;
    var password = event.currentIntent.slots.password;
    var Fname = event.currentIntent.slots.Fname;
    var Lname = event.currentIntent.slots.Lname;
    
    // We will get the safe deposit box information

        // Reading the safe deposit table
        var getparams = {
            TableName: "safe_deposit"
        };

        // Scanning the whole table for items
        docClient.scan(getparams, onScan);
        
        // Iterating through the data
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                // print all the movies
                console.log("Scan succeeded.");

                // The first box will be chosen randomly
                const safe = new Map();
                data.Items.forEach(function(box) {
                    // Saving the box in a hashmap
                    safe.set(box.serial_number,box.users);
                   console.log(
                        box.serial_number + ": " + box.users);
                });
                // Getting the box which is empty
                var safeName = "";
                var safeUsers = 0;

                var valAssigned = 0; // Variable to check if we have found a box

                // Iterating through the HashMap
                for(let safeBox of safe.entries()){
                    console.log(safeBox[1]);
                    if(safeBox[1] != 3 && valAssigned != 1){
                        safeName = safeBox[0];
                        safeUsers = safeBox[1];
                        valAssigned = 1;
                    }
                }
                
                // Storing the parameters to be updated in the safe deposit table
                var paramsSafeDeposit = {
                    TableName: "safe_deposit",
                    Key:{
                        "serial_number": safeName
                    },
                    UpdateExpression: "SET #us = :x",
                    ExpressionAttributeValues: {
                        ":x": safeUsers + 1,
                    },
                    ExpressionAttributeNames : {
                        "#us": "users"
                      }
                };

                // Updating the safe deposit
                if(safeName.localeCompare("") != 0){
                    docClient.update(paramsSafeDeposit, function(err, data) {
                        if (err) console.log(err);
                        else console.log("Success");
                    });
                } else {
                    console.log("The safe deposits are full")
                }
    
    // Storing the parameters to be uploaded to the registration table
    var params = {

        TableName:DynamoDBTable,
        Item:{
            "email_id": emailID,
            "firstName": Fname,
            "lastName": Lname,
            "password" : password,
            "safeDeposit" : safeName
                    }
                };
                
        docClient.put(params, function(err, data) {
                    
            if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                        let lambdaFailedResponse = {   
                        dialogAction: {
                         type: 'Close',
                         fulfillmentState: "Fulfilled",
                         message: {               
                            contentType: "PlainText",
                            content: "Registartion failed, Can you please try again"
                           }
                        }
                    };
                    callback(null, lambdaFailedResponse); // Send the response to the LEX                
                    } else {

                        let lambdaSuccessResponse = {                       
                        dialogAction: {
                         type: 'Close',
                         fulfillmentState: "Fulfilled",
                         message: {
                            contentType: "PlainText",
                            content: "You have successfully registered, You can now sign-in to your account"
                           }
                        }
                    };
                    callback(null, lambdaSuccessResponse);
                    }
                });      
            }     
            }
}