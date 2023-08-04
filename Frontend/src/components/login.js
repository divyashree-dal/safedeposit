//Author: Divyashree Bangalore Subbaraya (B00875916)
import { React, useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { useNavigate, Link } from 'react-router-dom';
import { IconButton, Paper } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import EmailIcon from '@material-ui/icons/Email';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import { makeStyles } from '@material-ui/core/styles';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import './chatBox.css';

import {awsCredentials} from '../utils/api'

var AWS = require("aws-sdk");

// AWS credentials to access the AWS Services
AWS.config.update(awsCredentials);

var docClient = new AWS.DynamoDB.DocumentClient();

// Table name for storing the registration information
var table = "register";


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
        padding: "40px",
        paddingBottom: '12%',
        display: 'flex',
        justifyContent: 'center',
        height: '80%',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'column'
    },

    card: {
        margin: '3%',
        height: '100%'
    },

    cardMedia: {
        height: '600px',
        width: '620px'
    },

    section: {
        paddingTop: '5%'
    },

    personPin: {
        height: '40%',
        width: '40%',
        marginLeft: '30%'
    },

    typo: {
        textAlign: 'center',
        marginBottom: '20%'
    },

    button: {
        textTransform: 'none',
        float: 'center',
        padding: "2%",
        width: '100px',
        marginLeft: '30%'
    },

    typoText: {
        fontSize: '14px',
        textAlign: 'center',
        marginLeft: '25%',
        padding: '4%'
    },

    registerText: {
        fontSize: '15px',
        textAlign: 'center',
        marginLeft: '12%',
        padding: '2%'
    }


}));


function Login(props) {
    // Defining variables and states for Login functioning

    const classes = useStyles();

    const [error, setError] = useState({
        email: false,
        password: false
    });

    const [details, setDetails] = useState({
        email: '',
        password: ''
    });

    const history = useNavigate();

    const [displayPassword, setDisplayPassword] = useState(false)

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


    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        if (value.match(/^\S+@\S+\.\S{2,}$/)) {
            setError(pre => ({ ...pre, [name]: false }))
            setDetails(pre => ({ ...pre, [name]: value }))
        }
        else {
            setError(pre => ({ ...pre, [name]: true }))
        }
    }

    const handlePasswordChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        setDetails(pre => ({ ...pre, [name]: value }))
    }

    const handleClickOnSubmit = (e) => {
        e.preventDefault()
        for (const [, value] of Object.entries(error)) {
            if (value) {
                return
            }
        }

        var params = {
            TableName: table,
            ProjectionExpression: "password",
            Key: {
                "email_id": details.email
            }
        };

        // This gets the password of the email entered
        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item", JSON.stringify(err, null, 2));

            } else {
                if (data.Item.password !== '') {
                    setError({ password: false });
                }
                // If the email id and the password is correct
                if (details.password.localeCompare(data.Item.password) === 0) {
                    history(`/SecurityQuestionsLogin`, { state: details.email });
                    console.log(details.email);
                } else {
                    alert("Please check the password or the email id");
                }
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                console.log("The password is :", JSON.stringify(data.Item.password));
            }
        });

    }

    const handlePasswordClickChange = () => {
        setDisplayPassword(!displayPassword)
    }

    //Render the login page
    return (
        <section className={classes.section}>
            <Container component="main" maxWidth="md" className={classes.mainContainer}>
                <Paper elevation={5} className={classes.paper}>
                    <form onSubmit={handleClickOnSubmit}>
                        <Grid item xs={12} sm={12}>
                            <PersonPinIcon color="primary" className={classes.personPin} />
                            <Typography variant="h5" className={classes.typo}>
                                Login Page - 1 of 3
                            </Typography>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    name="email"
                                    id="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    size="small"
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={handleEmailChange}
                                    error={error.email}
                                    helperText={error.email ? 'Incorrect email id!' : ''}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="password"
                                    variant="outlined"
                                    id="password"
                                    label="Password"
                                    type={displayPassword ? "text" : "password"}
                                    fullWidth
                                    required
                                    size="small"
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
                                    helperText={error.password ? 'Incorrect password!' : ''}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit"
                                    color="primary"
                                    variant="contained"
                                    className={classes.button}
                                >
                                    Login
                                </Button>
                            </Grid>
                            <br />
                            <Typography variant="h6" className={classes.registerText}>
                                <Grid item xs={12}>
                                    New to Safe Deposit?<Link to="/"> Register here</Link>
                                </Grid>
                            </Typography>

                        </Grid>
                    </form>
                    <Card className={classes.card} md={2}>
                        <CardMedia
                            image="images/loginLockImage.png"
                            title="Login Lock image"
                            className={classes.cardMedia}
                        />
                    </Card>
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

export default Login;

