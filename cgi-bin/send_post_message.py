#!/usr/local/adyen/python/bin/python3
"""
handler for callback from issuing bank

receives 'pares' POST data and sends back to client in a javascript postMessage
"""

# imports
import os
import sys
from urllib.parse import parse_qs

# custom server utilities
from ServerUtils import ServerUtils
utils = ServerUtils("CGI")

# log request
utils.logger.info("")
utils.logger.info("")
utils.logger.info("------- incoming request to threeDSNotification.py -------")

# parse payment data from URL params
content_length = int(os.environ["CONTENT_LENGTH"])
raw_request = sys.stdin.read(content_length)
form = parse_qs(raw_request)

data = {}
for key in form:
    data[key] = form[key]

utils.logger.info("incoming POST params:")
utils.logger.info(data)

# send post message back to client
post_message = """
    <script type="text/javascript">
    window.parent.postMessage({data}, "http://localhost:8000");
    </script>
""".format(data=data)

utils.send_response(post_message, "text/html")
