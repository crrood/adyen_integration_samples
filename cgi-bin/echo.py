#!/usr/local/adyen/python/bin/python3
"""
echos POST params back to client as JSON object
"""

#########################
#       Return URL      #
#########################

# imports
import os
import sys
from urllib.parse import parse_qs

# custom server utilities
from ServerUtils import ServerUtils
utils = ServerUtils("CGI")

# return URL params if it's a GET request
if os.environ["REQUEST_METHOD"] == "GET":
    request_data = parse_qs(os.environ["QUERY_STRING"])
    utils.send_response(request_data)

# otherwise return POST data
else:
    content_length = int(os.environ["CONTENT_LENGTH"])
    raw_request = sys.stdin.read(content_length)
    form = parse_qs(raw_request)

    data = {}
    for key in form:
        data[key] = form[key]

    utils.send_response(data, "text/html")
