//Author: Samiksha Narendra Salgaonkar (B00865423)
import { React, useState, useEffect } from 'react';
import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { InputLabel, Paper } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { makeStyles } from '@material-ui/core/styles';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import './chatBox.css';
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

    randomNumberWrapper: {
        paddingTop: '50px'
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

    randomNumberButton: {
        height: "30px",
        marginLeft: "10px"
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


function CaeserCipherLogin(props) {

    const classes = useStyles();

    const location = useLocation();

    const navigate = useNavigate();

    const [lexUserId, setLexUserId] = useState('chatbot-demo' + Date.now());

    const [sessionAttributes, setSessionAttributes] = useState({});

    var lexruntime;
    lexruntime = new AWS.LexRuntime();
    lexruntime = lexruntime;

    const handleRandomNumberGeneration = e => {
        e.preventDefault();

        const min = 1;
        const max = 100;
        const rand = min + Math.floor(Math.random() * (max - min));
        setRandom({ random: rand });
    }

    const [random, setRandom] = useState({
        random: ''
    });

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        setDetail({
            randomNumber: ''
        });

        setError({
            error: false
        });
    }

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
        error: false
    });

    const [detail, setDetail] = useState({
        randomNumber: ''
    });

    const handleInputChange = (e) => {
        e.preventDefault();

        setDetail({ randomNumber: e.target.value });
    };

    const handleClickOnSubmit = async (e) => {
        e.preventDefault();

        const answer = random.random + 10;
        const capturedValue = detail.randomNumber;

        if (capturedValue == answer) {
            navigate(`/dashboard`, { state: email });
        } else {
            setShow(true);
        }
    };

    //Render the login page
    return (
        <section className={classes.section}>
            <Container component="main" maxWidth="md" className={classes.mainContainer}>
                <Paper elevation={5} className={classes.paper}>
                    <form onSubmit={handleClickOnSubmit}>
                        <Grid item xs={12} sm={12}>
                            <PersonAddIcon color="primary" className={classes.personPin} />
                            <Typography variant="h5" className={classes.typo}>
                                Login Page - 3 of 3
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit"
                                color="primary"
                                variant="contained"
                                className={classes.randomNumberButton}
                                onClick={handleRandomNumberGeneration}
                            >
                                Click on the button to generate a number
                            </Button>
                        </Grid>

                        <Grid container spacing={3} className={classes.randomNumberWrapper}>
                            <InputLabel className={classes.inputlabel}> Perform x + 10 [x is {random.random}] </InputLabel>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    name="decryptedNumber"
                                    variant="outlined"
                                    id="decryptedNumber"
                                    label="Decrypted Number"
                                    placeholder="Decrypted Number"
                                    fullWidth
                                    required
                                    onChange={handleInputChange}
                                    error={error.error}
                                    helperText={error.error ? 'Enter only numbers!' : ''}
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

                            <Modal className="form-forgot-password " show={show} onHide={handleClose} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
                                <Modal.Title>Incorrect Cipher! Try again!</Modal.Title>
                                <Modal.Body>
                                    <div className="form-inputs form-Submit" onClick={handleClose}>
                                        <button className="form-input-btn" type="submit" style={{ boxSizing: "content-box", borderRadius: "0.2rem", height: "30px", color: "white", fontsize: "12px", backgroundColor: "#3f51b5" }}>
                                            Close
                                        </button>
                                    </div>
                                </Modal.Body>
                            </Modal>

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

export default CaeserCipherLogin;