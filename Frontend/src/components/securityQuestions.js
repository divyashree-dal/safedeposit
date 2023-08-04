//Author: Samiksha Narendra Salgaonkar (B00865423)
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { InputLabel, Paper } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import { db } from "./_firebase";
import axios from 'axios';

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
    },

    questionWrapper: {
        marginTop: "10px"
    }

}));


function SecurityQuestions(props) {

    const classes = useStyles();

    const location = useLocation();

    const email = location.state;

    const [error, setError] = useState({
        securityQuestion1: false,
        securityQuestion2: false
    });

    const [detail, setDetail] = useState({
        securityQuestion1: '',
        securityQuestion2: ''
    });

    const [show, setShow] = useState(false);

    const handleClickOnSubmit = async (e) => {
        e.preventDefault();

        console.log(detail);

        const docRef = db.collection('securityQuestionsCollection').add({
            answer1: detail.securityQuestion1,
            answer2: detail.securityQuestion2,
            email: email
        });

        const topicDetails = {
            email: email
        };

        axios.post('http://localhost:8080/gcppubsubmessage/message/topic', topicDetails)
            .then((res) => {
                console.log(res);
            })
            .catch((error) => {
                alert("Error occured!");
                console.log(error);
            });

        setShow(true);
    }

    const handleClose = () => {
        setShow(false);
        setDetail({
            securityQuestion1: '',
            securityQuestion2: ''
        });

        setError({
            securityQuestion1: false,
            securityQuestion2: false
        });
    }

    const navigate = useNavigate();

    const handleModalClose = () => {
        setShow(false);
        setDetail({
            securityQuestion1: '',
            securityQuestion2: ''
        });

        setError({
            securityQuestion1: false,
            securityQuestion2: false
        });

        navigate(`/dashboard`, { state: email });
    }

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
                                    className={classes.registerButton}
                                    onClick={handleClickOnSubmit}>
                                    Register
                                </Button>
                                <Modal className="form-forgot-password " show={show} onHide={handleClose} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
                                    <Modal.Title>You have successfully registered!</Modal.Title>
                                    <Modal.Body>
                                        <div className="form-inputs form-Submit">
                                            <button className="form-input-btn" type="submit" onClick={handleModalClose} style={{ boxSizing: "content-box", borderRadius: "0.2rem", height: "30px", color: "white", fontsize: "12px", backgroundColor: "#3f51b5" }}>
                                                Close
                                            </button>
                                        </div>
                                    </Modal.Body>
                                </Modal>

                            </Grid>
                        </Grid>
                    </form>
                </Paper>

            </Container>

        </section>
    );
}

export default SecurityQuestions;