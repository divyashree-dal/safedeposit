//Author: Divyashree Bangalore Subbaraya (B00875916)
import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { IconButton, Paper } from '@material-ui/core';
import { TextField, InputAdornment } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import EmailIcon from '@material-ui/icons/Email';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Checkbox from '@material-ui/core/Checkbox';
import { useNavigate, Link } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import './chatBox.css';
import {awsCredentials} from '../utils/api'

var AWS = require("aws-sdk");
 
// AWS credentials to access the AWS Services
AWS.config.update(awsCredentials);

// Dynamo client object
var docClient = new AWS.DynamoDB.DocumentClient();


// user registration table in DynamoDb
var table = "register";

// styles
const useStyles = makeStyles((theme) => ({
    paper: {
        paddingRight: '13px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginTop: '0',
        marginRight: 'auto',
        marginBottom: '0',
        marginLeft: 'auto'
    },

    mainContainer: {
        padding: "40px",
        display: 'flex',
        justifyContent: 'center',
        height: '80%',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'column',
        marginBottom: '5%'
    },

    card: {
        margin: '3%',
        height: '100%'
    },

    cardMedia: {
        height: '649px',
        width: '1020px'
    },

    section: {
        paddingTop: '5%'
    },

    personPin: {
        height: '30%',
        width: '30%',
        marginLeft: '30%'
    },

    typoText: {
        textAlign: 'center',
        marginBottom: '3%'
    },

    typoTextAccount: {
        fontSize: '15px',
        textAlign: 'center',
        marginLeft: '2%',
        paddingBottom: '3%'
    },

    typoCaption: {
        fontSize: '14px'
    },

    registerButton: {
        textTransform: 'none',
        float: 'right',
        width: '200px',
        margin: '2%'
    }

}));

function Register(props) {

    // Defining variables and states for SignUp functioning
    const classes = useStyles();

    const navigate = useNavigate();

    const [password, setPassword] = useState("");

    const [displayPassword, setDisplayPassword] = useState(false)

    const [displayConfirmPassword, setDisplayConfirmPassword] = useState(false)

    const [error, setError] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false,
        checkedBox: false,
        phoneNumber: false
    });

    const [detail, setDetail] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        snackbar: false,
        checkbox: false,
        password: ''
    });

    const [lexUserId, setLexUserId] = useState('chatbot-demo' + Date.now());

    const [sessionAttributes, setSessionAttributes] = useState({});

    var lexruntime;

    lexruntime = new AWS.LexRuntime();

    lexruntime = lexruntime;

    useEffect(() => {
        addResponseMessage('Welcome to Safe Desposit Online Chat Support');
      }, []);

      const handleNewUserMessage = (newMessage) => {
        pushChat(newMessage); // Passing the message to the LEX
      };

      // Function code for LEX chat support
      const pushChat = (Message) => {

        console.log(Message);

        if (Message && Message.trim().length > 0) {

            // sending the data to the Lex runtime
            var params = {
                botAlias: 'productionbot', // The published bot name
                botName: 'SafeDepositBot', // The bot name
                inputText: Message,
                userId: lexUserId,
                sessionAttributes: sessionAttributes
            };
            var a = function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    showError('Error:  ' + err.message + ' (see console for details)')

                }
                if (data) {
                    setSessionAttributes(data.sessionAttributes)
                    showResponse(data);
                    console.log(data);
                }
                Message = '';
            };

            lexruntime.postText(params, a);
        }
        return false;
    }

    // Show error in the chatbox
    const showError = (daText) => {
        var errorPara = document.createElement("P");
        errorPara.className = 'lexError';
        errorPara.appendChild(document.createTextNode(daText));
        addResponseMessage(daText);
    }

    // Show the response from LEX in the chat box
    const showResponse = (lexResponse) => {

        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';
        if (lexResponse.message) {
            addResponseMessage(lexResponse.message);
        }
        if (lexResponse.dialogState === 'ReadyForFulfillment') {
            addResponseMessage('Ready for fulfillment');
        }
    }

    // On submit of the Go to Next Page button
    const handleClickOnSubmit = (e) => {
        e.preventDefault()

        for (const [, value] of Object.entries(error)) {
            if (value) {
                return
            }
        }
        if (!detail.checkbox) {
            setError(pre => ({ ...pre, checkedBox: true }))
            return
        }

        // Reading the table
        var getparams = {
            TableName: "safe_deposit"
        };

        console.log('Before table')
        // Scanning the whole table for items
        docClient.scan(getparams, onScan);

        console.log('After table')
        
        // Iterating through the data
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table", JSON.stringify(err, null, 2));
            } else {

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

                // Iterating through the HashMap containing 
                for(let safeBox of safe.entries()){

                    console.log(safeBox[1]);

                    if(safeBox[1] !== 3 && valAssigned !== 1){
                        safeName = safeBox[0];
                        safeUsers = safeBox[1];
                        valAssigned = 1;
                    }
                }

                console.log("The first empty box is :" + safeName);            
                
                // Storing the parameters to be updated in the safe deposit table
                var paramsSafeDeposit = {
                    TableName: "safe_deposit",
                    Key:{
                        "serial_number": safeName
                    },
                    UpdateExpression: "SET #usr = :count",
                    ExpressionAttributeValues: {
                        ":count": safeUsers + 1,     // Incrementing the user count
                    },
                    ExpressionAttributeNames : {
                        "#usr": "users"
                      }
                };

                if(safeName.localeCompare("") !== 0){
                    docClient.update(paramsSafeDeposit, function(err, data) {
                        if (err) console.log(err);
                        else console.log("Success");
                    });
                } else {
                    console.log("The safe deposits are full")
                }

                // Storing the parameters to be uploaded to the registration table
                var params = {
                    TableName:table,
                    Item:{
                        "email_id": detail.email,
                        "firstName": detail.firstName,
                        "lastName": detail.lastName,
                        "password" : detail.password,
                        "safeDeposit" : safeName
                    }
                };

                console.log("Adding a new item...");
                docClient.put(params, function(err, data) {
                    
                    if (err) {
                        console.error("Unable to add item", JSON.stringify(err, null, 2));
                    } else {
                        
                        console.log("Added item:", JSON.stringify(data, null, 2));
                        navigate(`/SecurityQuestions`, {state: detail.email}) ;
                    }
                });
            }
        }
    }

    // To handle the appropriate name and its error
    const handleNameChange = (e) => {
        const { name, value } = e.target;
        if (!value.match(/^[a-zA-Z0-9]+(?:[\s.]+[a-zA-Z0-9]+)*$/)) {
            setError(pre => ({ ...pre, [name]: true }))
        }
        else {
            setError(pre => ({ ...pre, [name]: false }))
        }
        setDetail(pre => ({ ...pre, [name]: value }))
    }

    // To handle the appropriate email and its error
    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        if (value.match(/^\S+@\S+\.\S+$/)) {
            setError(pre => ({ ...pre, [name]: false }))
        }
        else {
            setError(pre => ({ ...pre, [name]: true }))
        }
        setDetail(pre => ({ ...pre, [name]: value }))
    }

    const handleEmailBlur = (e) => {
        const { name, value } = e.target;

        if (!value.match(/^\S+@\S+\.\S+$/)) {
            setError(pre => ({ ...pre, [name]: true }))
        }
        else {
            setError(pre => ({ ...pre, [name]: false }))
        }
        setDetail(pre => ({ ...pre, [name]: value }))
    }

    // To handle the appropriate password and its error
    const handlePasswordChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        if (password.match('^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$')) {
            if (password.length + 1 > 7) {
                setError(pre => ({ ...pre, [name]: false }))
            }
            else {
                setError(pre => ({ ...pre, [name]: true }))
            }
        }
        setPassword(value)
        setDetail(pre => ({ ...pre, [name]: value }))
    }

    // To confirm the password again
    const handleConfirmPasswordChange = (e) => {
        const { name, value } = e.target;
        if (password === value) {
            setError(pre => ({ ...pre, [name]: false }))
        }
        else {
            setError(pre => ({ ...pre, [name]: true }))
        }
    }

    const handlePasswordClickChange = () => {
        setDisplayPassword(!displayPassword)
    }

    const handleConfirmPasswordClickChange = () => {
        setDisplayConfirmPassword(!displayConfirmPassword)
    }

    const handleCheckedSnackBar = () => {
        setError(pre => ({ ...pre, checkedBox: false }))
    }

    const handleCheckedBoxChange = (e) => {
        setDetail(pre => ({ ...pre, checkbox: !detail.checkbox }))
    }

    // Render the Sign Up page
    return (
        <section className={classes.section}>

            <Container component="main" maxWidth="md" className={classes.mainContainer}>
                <Paper elevation={2} className={classes.paper}>
                    <Card className={classes.card} md={6}>
                        <CardMedia
                            image="images/registerLockImage.png" 
                            title="Register Lock image"
                            className={classes.cardMedia}
                        />
                    </Card>

                    <form onSubmit={handleClickOnSubmit}>
                        <Grid item xs={12} sm={12}>
                            <PersonAddIcon color="primary" className={classes.personPin} />
                            <Typography variant="h5" className={classes.typoText} >
                                Safe Deposit Registration form!
                            </Typography>

                            <Typography variant="h6" className={classes.typoTextAccount}>
                                <Grid item xs={12}>
                                    Already have an account?<Link to="/login"> Login</Link>
                                </Grid>
                            </Typography>

                        </Grid>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="firstName"
                                    variant="outlined"
                                    id="firstName"
                                    label="First Name"
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={handleNameChange}
                                    error={error.firstName}
                                    helperText={error.firstName ? 'Enter only alphanumeric characters!' : ''}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="lastName"
                                    variant="outlined"
                                    id="lastName"
                                    fullWidth
                                    required
                                    label="Last Name"
                                    placeholder="Last Name"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={handleNameChange}
                                    error={error.lastName}
                                    helperText={error.lastName ? 'Enter only alphanumeric characters!' : ''}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant="outlined"
                                    name="email"
                                    id="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={handleEmailChange}
                                    onBlur={handleEmailBlur}
                                    error={error.email}
                                    helperText={error.email ? 'Example: abc@gmail.com' : ''}
                                />
                            </Grid>

                        

                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="password"
                                    variant="outlined"
                                    id="password"
                                    label="Password"
                                    type={displayPassword ? "text" : "password"}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    label="visibility of passwords"
                                                    onClick={handlePasswordClickChange}
                                                >
                                                    {displayPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    onPaste={(e) => { e.preventDefault() }}
                                    onChange={handlePasswordChange}
                                    error={error.password}
                                    helperText={error.password ? 'Minimum of 8 characters!' : ''}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    variant="outlined"
                                    name="confirmPassword"
                                    id="confirm-password"
                                    label="Confirm Password"
                                    type={displayConfirmPassword ? "text" : "password"}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    label="visibility of passwords"
                                                    onClick={handleConfirmPasswordClickChange}
                                                >
                                                    {displayConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={handleConfirmPasswordChange}
                                    error={error.confirmPassword}
                                    helperText={error.confirmPassword ? 'Passwords do not match' : ''}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Checkbox
                                    name="checkbox"
                                    checked={detail.checkbox}
                                    size="small"
                                    color="primary"
                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    onChange={handleCheckedBoxChange}
                                />
                                <Typography variant='caption' className={classes.typoCaption}>
                                    Yes, I agree to the terms and conditions of SafeDeposit!
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit"
                                    color="primary"
                                    variant="contained"
                                    className={classes.registerButton}
                                    onClick={handleClickOnSubmit}>
                                    Go to next page
                                </Button>
                                <Snackbar open={error.checkedBox} autoHideDuration={6000} onClose={handleCheckedSnackBar}>
                                    <MuiAlert elevation={6} variant="filled" onClose={handleCheckedSnackBar} severity="error">
                                        Please Agree to terms and conditions!
                                    </MuiAlert>
                                </Snackbar>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {/* Chatbot pop up*/}
                <div className="App" >
                    <Widget
                    handleNewUserMessage={handleNewUserMessage}
                    title="Chat Support"
                    subtitle="Safe Deposit"
                    className={classes.chatbtn} 
                    />
                </div>
            </Container>

        </section>
    );
}

export default Register;