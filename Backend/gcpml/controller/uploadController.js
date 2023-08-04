//Author: Divyashree Bangalore Subbaraya (B00875916)
const processFile = require('../middleware/uploadFile');
const logger = require('../middleware/pinoService')
const validator  = require('email-validator');
const axios = require('axios');
const FormData = require('form-data');

module.exports.uploadFile = async (request, response, next) => {

    logger.info("Starting the upload process");
    try {

        // Process file using Multer
        await processFile(request, response);
   
        console.log(request.body);

        // Email existence check
        if (!request.body.email) {
            logger.error("No email ID");
            return response.status(400).json({
                success: false,
                message: 'Please enter parameter key - email'
            })
        }
        
        // Email null/validator 
        if(request.body.email === undefined || request.body.email === null 
            || !validator.validate(request.body.email)){
            logger.error("Invalid email");
            return response.status(400).json({
                success: false,
                message: 'Invalid email ID'
            })
        }
        
        // Account check
        if (!request.body.account) {
            logger.error("No Account");
            return response.status(400).json({
                success: false,
                message: 'Account missing'
            })
        }

        // File check
        if (!request.file) {
            logger.error("File not uploaded! Please try to upload the file");
            return response.status(400).json({
                success: false,
                message: 'Please try to upload again!'
            })
        }

        console.log(request.body)

        // Process the form data, append details to the formData
        var form = new FormData();
        form.append('email', request.body.email);
        form.append('account', request.body.account);
        form.append('file', request.file.buffer,request.file.originalname);
        
        // Cloud function url
        await axios.post('https://us-central1-csci5410projectmlpart.cloudfunctions.net/ml-classification-function', form, {
            headers: {
                'accept': 'application/json',
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            }
        }).then((cloud_response) => {
            logger.info("Uploaded image to bucket successfully");
            console.log(cloud_response.data)
            return response.status(cloud_response.status).json({
                success: cloud_response.data['status'],
                message: cloud_response.data['message'],
                send_message: cloud_response.data['send_message']!==undefined ? cloud_response.data['send_message'] : '',
                url: '',
            });
            
        })
        .catch((error) => {
            console.error('Error:', error);
            return response.status(500).json({
                success: false,
                message: `Failure`,
                url: '',
            });
        });

    } catch (error) {
        response.status(500).json({
            success: false,
            message: error.message
        })

    }
}
