#!/usr/local/adyen/python3/bin/python3

import os, sys
from urllib.parse import parse_qs

# custom server utilities
from ServerUtils import ServerUtils
utils = ServerUtils("CGI")

##########################
##		3D Secure 1		##
##########################

# handler for callback from issuing bank

# parse payment data from URL params
content_length = int(os.environ["CONTENT_LENGTH"])
raw_request = sys.stdin.read(content_length)
form = parse_qs(raw_request)

data = {}
for key in form.keys():
	data[key] = form[key]

# send post message back to client
post_message = """
	<script type="text/javascript">
	window.parent.postMessage({data}, "http://localhost:8000");
	</script>
""".format(data=data)

utils.send_response(post_message, "text/html")
