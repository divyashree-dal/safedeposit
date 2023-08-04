from flask import Response
from google.cloud import storage
from google.cloud import vision
import json


def ml_function_job(present_file=None, user_email='', user_account=''):
    bucket_name = 'imagedatagroup07'

    image_name = present_file.filename
    # credentials = service_account.Credentials.from_service_account_file(
    #     "/Users/divyashree.b.s/Downloads/csci5410projectmlpart-4d5e1b168083.json")
    storage_client = storage.Client()

    bucket = storage_client.get_bucket(bucket_name)

    # Create and get json file
    blob_json = bucket.get_blob('existingImagesLabelsScore.json')

    data = {}
    if blob_json is not None:
        data = json.loads(blob_json.download_as_string(client=None))

    print(data)

    # read the present file
    main_file_content = present_file.read()

    # To retrieve list of images under the prefix folder
    blobs = list(bucket.list_blobs(prefix='Images/'))
    get_images_annotations = {}
    for blob in blobs:

        # check for the account and email existence
        if blob.metadata['account'] == user_account and blob.metadata['email'] != user_email:
            name = blob.name.split('.')[0].split('/')[1]

            # if image data exists in the json file
            if name in data.keys():
                check_data_key = list(data[name].keys())[0]

                # if image data exists in the annotations
                if check_data_key in get_images_annotations.keys():

                    # compare and get the highest annotation
                    # (Eg:  plant and plant annotations of different images, get the highest annotations)
                    get_images_annotations[check_data_key] = max(data[name][check_data_key],
                                                                 get_images_annotations[check_data_key])
                else:

                    # Spread and store the present image in the dictionary
                    get_images_annotations = {**get_images_annotations, **data[name]}

    # Instantiates a client
    client = vision.ImageAnnotatorClient()

    image = vision.Image(content=main_file_content)

    response = client.label_detection(image=image)
    labels = response.label_annotations

    image_annotation = {}

    for label in labels:
        image_annotation[label.description] = label.score

    print(get_images_annotations)

    # get the common annotations between present image and previouslu stored image annotations(dict)
    intersection = image_annotation.keys() & get_images_annotations.keys()

    send_message = False
    print(intersection)

    # if intersection exists
    for key in intersection:

        # get the present image label score
        present_image_score = int(image_annotation[key] * 100)

        # get the past image label score
        past_image_score = int(get_images_annotations[key] * 100)

        # classify the images ( score set : 80)
        if present_image_score >= past_image_score or present_image_score > 80:

            # if the score is greater than 80, then send the message to user
            data[image_name.split('.')[0]] = {key: image_annotation[key]}
            label_name = key
            label_score = image_annotation[key]
            send_message = True  # TODO : Send Message saying Image has already present
            break

    # If no intersection exists, simply upload the image and store in th GCS bucket, and no message sent
    else:
        label_name = labels[0].description
        label_score = labels[0].score
        data[image_name.split('.')[0]] = {label_name: label_score}


    # update the json and upload the images irrespective of send_message True/False
    storage_client.get_bucket(bucket_name).blob('existingImagesLabelsScore.json').upload_from_string(json.dumps(data))
    new_blob = storage_client.get_bucket(bucket_name).blob(f'Images/{image_name}')
    new_blob.metadata = {'email': user_email, 'account': user_account}
    new_blob.upload_from_string(main_file_content)
    # blob_json.upload_from_string(json.dumps(data))
    return dict(send_message=send_message, label_name=label_name, label_score=label_score,
                message='Classification completed SuccessFully', status=True)


def vectorCall(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """

    try:
        if 'file' not in request.files:
            print('No File ')
            print(request.files)
            return Response(json.dumps(dict(message='Upload File', status_code=400, status=False)),
                            mimetype='application/json')
        else:
            print('Got file')
            present_file = request.files['file']

        if 'account' not in request.form or 'email' not in request.form:
            print('either no account or email')
            return Response(json.dumps(dict(message='plaese account or email', status_code=400, status=False)),
                            mimetype='application/json')

        classification = ml_function_job(present_file, request.form['email'], request.form['account'])
        response = Response(json.dumps(classification), mimetype='application/json')
        response.status_code = 200
        return response

    except Exception as e:
        return Response(json.dumps(dict(message=str(e), status_code=500, status=False)), mimetype='application/json')