//Author: Samiksha Narendra Salgaonkar (B00865423)
import { React, useState, useEffect } from 'react';
import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { InputLabel, Paper } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import { makeStyles } from '@material-ui/core/styles';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import './chatBox.css';
import { db } from "./_firebase";

import {awsCredentials} from '../utils/api'

var AWS = require("aws-sdk");

// AWS credentials to access the AWS Services
AWS.config.update(awsCredentials);

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


function SecurityQuestionsLogin() {

    const classes = useStyles();

    const location = useLocation();

    const navigate = useNavigate();

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

    const email = location.state;

    const [error, setError] = useState({
        securityQuestion1: false,
        securityQuestion2: false
    });
    
    const [detail, setDetail] = useState({
        securityQuestion1: '',
        securityQuestion2: ''
    });

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        if (!value.match(/^[a-zA-Z0-9]+(?:[\s.]+[a-zA-Z0-9]+)*$/)) {
            setError(pre => ({ ...pre, [name]: true }))
        }
        else {
            setError(pre => ({ ...pre, [name]: false }))
        }
        setDetail(pre => ({ ...pre, [name]: value }))
    }

    const handleClickOnSubmit = async (e) => {
        e.preventDefault()
        for (const [, value] of Object.entries(error)) {
            if (value) {
                return
            }
        }

        console.log(detail);
        const docRef = db.collection('securityQuestionsCollection');
        const retrievedDocument = await docRef.where('email', '==', email).get();
        if (retrievedDocument.empty) {
            console.log('No matching documents.');
            return;
        }

        retrievedDocument.forEach(doc => {
            const answer1 = doc.data().answer1;
            const answer2 = doc.data().answer2;

            if((answer1 === detail.securityQuestion1) && (answer2 === detail.securityQuestion2)) {
                navigate(`/CaeserCipherLogin`, {state: email});
                console.log(email);
            }    
        });
        
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
                                Login Page - 2 of 3
                            </Typography>
                        </Grid>
                        <Grid container spacing={3} className={classes.questionWrapper}>
                            <InputLabel> Which city were you born? </InputLabel>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    name="securityQuestion1"
                                    variant="outlined"
                                    id="securityQuestion1"
                                    label="Security Question 1"
                                    placeholder="Security Question 1"
                                    fullWidth
                                    required
                                    onChange={handleQuestionChange}
                                    error={error.securityQuestion1}
                                    helperText={error.securityQuestion1 ? 'Enter only alphanumeric characters!' : ''}
                                />
                            </Grid>
                            <InputLabel> Your childhood friend? </InputLabel>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    name="securityQuestion2"
                                    variant="outlined"
                                    id="securityQuestion2"
                                    fullWidth
                                    required
                                    label="Security Question 2"
                                    placeholder="Security Question 2"
                                    onChange={handleQuestionChange}
                                    error={error.securityQuestion2}
                                    helperText={error.securityQuestion2 ? 'Enter only alphanumeric characters!' : ''}
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

export default SecurityQuestionsLogin;