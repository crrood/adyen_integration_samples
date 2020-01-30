#!/usr/local/adyen/python/bin/python3

'''
Server to forward requests to Adyen

The endpoint should be included in a header called "endpoint"
and request data as a JSON object or URL params.
'''

# system utilities
import os
import sys
import json

# HTTP parsing
from urllib.parse import parse_qs

# custom server utilities
from ServerUtils import ServerUtils
utils = ServerUtils("CGI")

# constants
ACCEPT_HEADER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"


#############################
#       REQUEST HANDLING	#
#############################

utils.logger.info("")
utils.logger.info("")
utils.logger.info("------- incoming request to server.py -------")

# parse URL params
request_data = parse_qs(os.environ["QUERY_STRING"])
utils.logger.info("incoming URL params: %s", request_data)

# get data from POST fields
if os.environ["REQUEST_METHOD"] == "POST":
    post_data = json.loads(sys.stdin.read(int(os.environ["CONTENT_LENGTH"])))
    utils.logger.info("incoming POST data: %s", post_data)

    # combine URL and POST params
    request_data.update(post_data)

# get endpoint from request
try:
    endpoint = request_data["endpoint"]
    del request_data["endpoint"]
except KeyError:
    utils.logger.error("no endpoint in request data")
    utils.send_debug("no endpoint in request data")
    sys.exit(1)

#################################
#       SERVER-SIDE FIELDS		#
#################################

# add merchant account if the request contains a blank value for it
if "merchantAccount" in request_data.keys():
    if len(request_data["merchantAccount"]) == 0:
        request_data["merchantAccount"] = utils.config["merchant_account"]

# add accept header if browserInfo is present
if "browserInfo" in request_data.keys():
    request_data["browserInfo"]["acceptHeader"] = ACCEPT_HEADER


#########################
#       SEND REQUEST    #
#########################

# send request
request_result = utils.send_request(endpoint, request_data)


#############################
#       FORMAT RESPONSE		#
#############################

# respond to client with object containing request and response
response = {}
response["request"] = request_data
response["response"] = request_result
response["endpoint"] = endpoint

utils.send_response(response)

utils.logger.info("")
