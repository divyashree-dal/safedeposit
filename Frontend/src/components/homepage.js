//Author: Divyashree Bangalore Subbaraya (B00875916)
import React, { useState, useEffect } from 'react'
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { InputLabel, IconButton, Paper, Tooltip, TextField, theme } from '@material-ui/core';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import './chatBox.css';
import { makeStyles } from '@material-ui/core/styles';
import { PhotoCamera } from "@material-ui/icons";
import FormData from 'form-data';
import { saveImage } from "../utils/api";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useNavigate, useLocation } from "react-router-dom";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

import { awsCredentials } from '../utils/api'

var AWS = require("aws-sdk");

// AWS credentials to access the AWS Services
AWS.config.update(awsCredentials);

var docClient = new AWS.DynamoDB.DocumentClient();

var dynamoDBTable = "safe_deposit"; // Table to get the user details

const useStyles = makeStyles((theme) => ({

    paper: {
        padding: '30px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginTop: '1%',
        marginRight: '7%',
        marginBottom: '0',
        marginLeft: 'auto'
    },

    mainContainer: {
        padding: "4%",
        display: "flex",
        justifyContent: "center",
        height: "60%",
        alignItems: "center",
        position: "relative",
        flexDirection: "column"
    },
    media: {
        height: 140,
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
    },

    loggedInUser: {
        width: "400px"
    },

    pubSubPublishBar: {
        height: "30px"
    },

    pubSubPullBar: {
        height: "30px",
        marginLeft: "50px"
    }

}));

function Homepage() {

    const classes = useStyles();

    // Defining variables and states for SignUp functioning

    const [errorSnackMessage, setErrorSnackMessage] = useState('Invalid !! Try again');

    const [error, setError] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false,
        checkedBox: false,
        phoneNumber: false,
        errorSnackbar: false
    });

    const [detail, setDetail] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        snackbar: false,
        checkbox: false,
        password: '',
        message: ''
    });

    const [disabled, setDisabled] = useState(true);

    const [loginSnackBar, setLoginSnackBar] = useState(false);

    const [show, setShow] = useState(false);

    const [pullShow, setPullShow] = useState(false);

    const [uploadedSuccessSnackBar, setUploadedSuccessSnackBar] = useState(false);

    const [uploadedErrorSnackBar, setUploadedErrorSnackBar] = useState(false);

    const [uploadedMessageSnackBar, setUploadedMessageSnackBar] = useState(false);

    const [uploadImage, setUploadImage] = useState();

    const [withDraw, setWithDraw] = useState(0);

    const [selectImage, setSelectedImage] = useState(false);

    const [messageData, setMessageData] = useState("");

    const location = useLocation();

    const history = useNavigate();

    const [lexUserId, setLexUserId] = useState('chatbot-demo' + Date.now());

    const [sessionAttributes, setSessionAttributes] = useState({});

    var lexruntime;

    lexruntime = new AWS.LexRuntime();

    lexruntime = lexruntime;

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
    }

    const handleNewUserMessage = (newMessage) => {
        pushChat(newMessage); // Passing the message to the LEX
    };

    const handleSuccessUploadSnackbar = () => {
        setUploadedSuccessSnackBar(false)
    }

    const handleErrorUploadSnackbar = () => {
        setUploadedErrorSnackBar(false)
    }

    const handleMessageUploadSnackbar = () => {
        setUploadedMessageSnackBar(false)
    }


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

    // Show the resposne from LEX in the chat box
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

    useEffect(() => {
        addResponseMessage('Welcome to Safe Desposit Online Chat Support');
    }, []);


    const onChangeHandler = (e) => {
        setUploadImage(e.target.files[0]);
        setSelectedImage(true);
    }

    // Email check for form data
    const email = useLocation().state;

    // account state for form data 
    var [account, setAccount] = useState(0);

    var [account_balance, setaccount_balance] = useState();

    // Get the BOX number and the balance

    // Parameters to get the box details and its balance
    var Boxparams = {
        TableName: "register",
        Key: {
            "email_id": email
        }
    };

    docClient.get(Boxparams, function (err, data) {
        if (err) {
            console.error("Unable to read item1");
        } else if (JSON.stringify(data, null, 4) !== "") {
            //String the firstanme and lastname
            var SafeDeposit = JSON.stringify(data.Item.safeDeposit).replace('"', '');

            // Assigning the BOX number
            account = SafeDeposit.replace('"', '');

            setAccount(account)

            // Parameters to get the data from safe_deposit table
            var params = {
                TableName: dynamoDBTable,
                Key: {
                    "serial_number": account
                }
            };

            docClient.get(params, function (err, data) {
                if (err) {
                    console.log(err)
                    console.error("Unable to read item2");

                } else if (JSON.stringify(data, null, 4) !== "") {

                    setaccount_balance(data.Item.balance); // Get the balance of the safe deposit from the table
                }
            });
        }
    });

    const [sendMessageBoolean, setSendMessageBoolean] = useState(false);

    const handleFormClickOnSubmit = () => {


        let formData = new FormData();

        formData.append('file', uploadImage);
        formData.append('email', email)
        formData.append('account', account)

        saveImage(formData, {
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.8',
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            }
        }).then((response) => {
            console.log("response");
            if (response.data['send_message'] === true) {
                setUploadedMessageSnackBar(true)
                // publish button active
                setSendMessageBoolean(true)
                setDisabled(false);

            }
            else {
                setSendMessageBoolean(false)
                setUploadedSuccessSnackBar(true);
                setDisabled(true);
            }
            console.log(JSON.stringify(response))

        })
            .then((result) => {
                console.log('Success:', result);
            })
            .catch((error) => {

                console.log('error:', JSON.stringify(error.response.data['message']));
                setErrorSnackMessage(error.response.data['message']);
                setUploadedErrorSnackBar(true);

            });
    };

    // To handle the click of visualization
    const handleVisualizeButton = (e) => {
        window.open('https://datastudio.google.com/s/hh-BHE_vTbg', "_blank");
    }

    // Login success snack bar
    const handleLoginSnackBar = () => {
        setLoginSnackBar(false)
    }

    // Set the status of snack bar
    useEffect(() => {
        const home = () => {
            if (location.state) {
                setLoginSnackBar(location.state ? true : false);
                history('/dashboard', { state: email })
            }
        }
        home();
    }, []);

    // handle logout
    const handleLogout = (e) => {
        history('/login', { state: null })
    }

    // To handle the entered amount to be withdrawn
    const handleWithDrawChange = (e) => {
        setWithDraw(e.target.value)
        console.log(`change value ${e.target.value}`)
    }

    // To handle the withdraw function
    const handleWithdrawSubmit = (e) => {
        // Storing the parameters to be updated in the safe deposit table
        var paramsSafeDeposit = {
            TableName: "safe_deposit",
            Key: {
                "serial_number": account
            },
            UpdateExpression: "SET #us = :x",
            ExpressionAttributeValues: {
                ":x": account_balance - withDraw,
            },
            ExpressionAttributeNames: {
                "#us": "balance"
            }
        };

        docClient.update(paramsSafeDeposit, function (err, data) {
            if (err) console.log(err);
            else console.log("Success");
        });
    }

    const handlePublishMessages = e => {
        e.preventDefault();
        setShow(true);
    }

    const handleUserPublishMessage = e => {
        e.preventDefault();

        setDetail({
            [e.target.name]: [e.target.value]
        })
    }

    const handleClose = () => {
        setShow(false);

        const publishValues = {
            email: email,
            message: detail.message
        }

        axios.post('http://localhost:8080/gcppubsubmessage/message/publishMessage', publishValues)
            .then((res) => {
                console.log(res);
                alert("Message published successfully!");
            })
            .catch((error) => {
                alert("Error occured!");
                console.log(error);
            });

        setDetail({
            message: ''
        });
    };

    const handlePullMessages = e => {
        e.preventDefault();
        setPullShow(true);
    };

    const handlePullClose = () => {
        setPullShow(false);

        const pullValues = {
            email: email
        };

        axios.post('http://localhost:8080/gcppubsubmessage/message/pullMessage', pullValues)
            .then((res) => {
                console.log(res.data.message);
                const result = Buffer.from(res.data.message, "base64").toString("utf-8")
                setMessageData(result);
                alert("Message pulled successfully!");
            })
            .catch((error) => {
                alert("Error occured!");
                console.log(error);
            });

    };

    // Render the home page
    return (
        <section className={classes.section}>
            <Container component="main" maxWidth="md" className={classes.mainContainer}>
                <Paper elevation={5} className={classes.paper}>

                    <form onSubmit={handleClickOnSubmit}>
                        <Grid item xs={12} sm={12}>
                            <PersonPinIcon color="primary" className={classes.personPin} />
                            <Typography variant="h5" className={classes.typoText} >
                                Welcome to Safe Deposit Application!
                            </Typography>
                        </Grid>

                        <br />

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <div className={classes.loggedInUser}>
                                    <InputLabel>Please find the details of the logged in user!</InputLabel>
                                    <br />
                                    Account Number: {account}
                                    <br />
                                    <br />
                                    Email address: {email}
                                    <br />
                                    <br />
                                    Account Balance: {account_balance}
                                </div>
                            </Grid>
                        </Grid>

                        <br />

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <input
                                    accept="image/*"
                                    className={classes.input}
                                    id="randomimage"
                                    type="file"
                                    onChange={onChangeHandler}
                                />
                                <Tooltip title="Select Image">
                                    <label htmlFor="randomimage">
                                        <IconButton
                                            className={classes.randomimage}
                                            color="primary"
                                            aria-label="upload picture"
                                            component="span"
                                        >
                                            <PhotoCamera fontSize="large" />
                                        </IconButton>
                                    </label>
                                </Tooltip>

                                <label>{uploadImage ? uploadImage.name : "Select Image"}</label>

                                <Grid item xs={12}>

                                    <Button onClick={() => handleFormClickOnSubmit()} color="primary"
                                        variant="contained" className={classes.button} disabled={!uploadImage}>
                                        UPLOAD
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                        <br />
                        <br />

                        <Grid item xs={12}>
                            <Typography variant="h6" className={classes.typoText} >
                                Want to Withdraw?
                            </Typography>

                            <Grid item xs={12}>
                                <TextField
                                    name="withdraw"
                                    variant="outlined"
                                    id="withdraw"
                                    label="Withdraw"
                                    fullWidth
                                    size="small"
                                    onChange={handleWithDrawChange}
                                />
                            </Grid>

                            <br />

                            <Button onClick={handleWithdrawSubmit} color="primary"
                                variant="contained" style={{ 'marginLeft': '120px' }}>
                                Withdraw money
                            </Button>
                        </Grid>

                        <br />
                        <br />

                        <Typography variant="h6" className={classes.typoText} >
                            Send/receive messages?!
                        </Typography>

                        <Grid item xs={12} sm={12}
                            container
                            direction="row"
                            alignItems="center"
                            justifyContent="center">
                            <Button type="submit"
                                color="primary"
                                variant="contained"
                                className={classes.pubSubPublishBar}
                                onClick={handlePublishMessages}
                                show={show}
                                disabled={disabled}
                            >
                                Publish message
                            </Button>

                            <Modal className="form-forgot-password " show={show} onHide={handleClose} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
                                <Modal.Title>Publish messages to your fellow account holders here.....</Modal.Title>
                                <Modal.Body>
                                    <div className="form-inputs form-Submit">
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            id="message"
                                            type="text"
                                            name="message"
                                            label="Write your message and hit Send..."
                                            variant="outlined"
                                            autoComplete="off"
                                            onChange={handleUserPublishMessage}
                                        />
                                        <button className="form-input-btn" type="submit" onClick={handleClose} style={{ boxSizing: "content-box", borderRadius: "0.2rem", height: "30px", color: "white", fontsize: "12px", backgroundColor: "#3f51b5" }}>
                                            Publish
                                        </button>
                                    </div>
                                </Modal.Body>
                            </Modal>

                            <Button type="submit"
                                color="primary"
                                variant="contained"
                                className={classes.pubSubPullBar}
                                onClick={handlePullMessages}
                            >
                                Pull Messages
                            </Button>

                            <Modal className="form-forgot-password " show={pullShow} onHide={handlePullClose} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
                                <Modal.Title>Pull messages from your fellow account holders here.....</Modal.Title>
                                <Modal.Body>
                                    <div className="form-inputs form-Submit">
                                        <button className="form-input-btn" type="submit" onClick={handlePullClose} style={{ boxSizing: "content-box", borderRadius: "0.2rem", height: "30px", color: "white", fontsize: "12px", backgroundColor: "#3f51b5" }}>
                                            Pull
                                        </button>
                                    </div>
                                    <div className="message-box">
                                        <Typography variant="h5">
                                            {messageData}
                                        </Typography>
                                    </div>
                                </Modal.Body>
                            </Modal>

                        </Grid>

                        <br />
                        <br />

                        <Typography variant="h6" className={classes.typoText} >
                            Want to checkout visualization?!
                        </Typography>

                        <Grid item xs={12}>
                            <Button onClick={() => handleVisualizeButton()} color="primary"
                                variant="contained" style={{ 'marginLeft': '120px' }} disabled={!email}>
                                Visualization
                            </Button>
                        </Grid>

                        <br />
                        <br />

                        <Grid item xs={12}>
                            <Typography variant="h6" className={classes.typoText} >
                                Want to logout?
                            </Typography>
                            <Button onClick={() => handleLogout()} color="primary" color="error"
                                variant="outlined" style={{ 'marginLeft': '155px' }}>
                                Logout
                            </Button>
                        </Grid>

                    </form>

                    <Card className={classes.card} md={6}>
                        <CardMedia
                            image="images/registerLockImage.png"
                            title="Register Lock image"
                            className={classes.cardMedia}
                        />
                    </Card>

                    <Snackbar open={uploadedErrorSnackBar} autoHideDuration={6000} onClose={handleErrorUploadSnackbar}>
                        <MuiAlert elevation={6} variant="filled" onClose={handleErrorUploadSnackbar} severity="error">
                            {errorSnackMessage}
                        </MuiAlert>
                    </Snackbar>

                    <Snackbar open={uploadedMessageSnackBar} autoHideDuration={6000} onClose={handleMessageUploadSnackbar}>
                        <MuiAlert elevation={6} variant="filled" onClose={handleMessageUploadSnackbar} severity="error">
                            Oh..Oh..Similar image, Check your email!
                        </MuiAlert>
                    </Snackbar>

                    <Snackbar open={uploadedSuccessSnackBar} autoHideDuration={6000} onClose={handleSuccessUploadSnackbar}>
                        <MuiAlert elevation={6} variant="filled" onClose={handleSuccessUploadSnackbar} severity="success">
                            Uploaded the image successfully!
                        </MuiAlert>
                    </Snackbar>


                    <Snackbar open={loginSnackBar} autoHideDuration={6000} onClose={handleLoginSnackBar}>
                        <MuiAlert elevation={6} variant="filled" onClose={handleLoginSnackBar} severity="success">
                            You are logged in!
                        </MuiAlert>
                    </Snackbar>

                </Paper>

                <div className="App" >
                    <Widget
                        handleNewUserMessage={handleNewUserMessage}
                        title="Chat Support"
                        subtitle="Safe Deposit"
                        className={classes.chatbtn}
                    />
                </div>
            </Container>

        </section >
    )
};


export default Homepage;