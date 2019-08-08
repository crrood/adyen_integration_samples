#!/usr/local/adyen/python3/bin/python3

##########################
##		Return URL		##
##########################

# handler for callback from issuing bank
#
# parses POST data and sends back to client in a javascript postMessage

##########################

# imports
import os, sys
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

utils.send_response(data, "application/json")
