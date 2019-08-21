#!/usr/local/adyen/python3/bin/python3

#########################
#       Return URL		#
#########################

# echos POST params back to client as JSON object

##########################

# imports
import os
import sys
from urllib.parse import parse_qs

# custom server utilities
from ServerUtils import ServerUtils
utils = ServerUtils("CGI")

# parse payment data from URL params
content_length = int(os.environ["CONTENT_LENGTH"])
raw_request = sys.stdin.read(content_length)
form = parse_qs(raw_request)

data = {}
for key in form.keys():
    data[key] = form[key]

utils.send_response(data, "text/html")
