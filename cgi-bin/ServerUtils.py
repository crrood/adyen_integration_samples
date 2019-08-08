#!/usr/local/adyen/python3/bin/python3
import logging

# network methods
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# authentication
import configparser

class ServerUtils():

	##########################
	##		CONSTRUCTOR		##
	##########################

	def __init__(self, logger_prefix="CGI", config_file="config.ini"):
		self.logger = self.get_custom_logger(logger_prefix)
		self.config = self.load_config(config_file)

	######################
	##		LOGGING		##
	######################
	'''
	logger with date, time, and custom prefix
	'''
	def get_custom_logger(self, logger_prefix):
		logging.basicConfig(
			level=logging.DEBUG,
			format='%(asctime)s %(name)s:%(levelname)s %(message)s',
			datefmt='[%d/%m/%Y %X %Z]')

		return logging.getLogger(logger_prefix)

	##############################
	##		NETWORK METHODS		##
	##############################
	'''
	class methods for sending requests and responding to client
	'''

	# send request to server and return dict or string response
	def send_request(self, url, request_dict):

		# logging
		self.logger.info("")
		self.logger.info("sending outgoing request to {}".format(url))
		self.logger.info("request data: {}".format(request_dict))

		# encode data
		formatted_data = json.dumps(request_dict).encode("utf8")

		# create request object
		request = Request(url, formatted_data, self.get_json_header())

		try:
			# make request to server
			response = urlopen(request)
			result = response.read()

			self.logger.info("response data: {}".format(result))

			# format and return response
			if "application/json" in response.getheader("content-type"):
				return json.loads(result.decode("utf8"))
			elif isinstance(result, bytes):
				return result.decode("utf8")
			else:
				return result
		except HTTPError as e:
			return "{}".format(e)
		except Exception as e:
			return "error sending request: {}".format(e)

	# respond to client
	def send_response(self, response_text, content_type="application/json", skipHeaders=False):
		if not skipHeaders:
			print("Content-type:{}\r\n".format(content_type), end="")
			print("\r\n", end="")

		# format response
		if type(response_text) is bytes:
			formatted_response = "{}\r\n".format(response_text.decode("utf8"))
		elif type(response_text) is str:
			formatted_response = "{}\r\n".format(response_text)
		elif type(response_text) is dict:
			formatted_response = "{}\r\n".format(json.dumps(response_text))
		else:
			self.logger.error("Invalid data type in send_response")
			self.logger.error(type(response_text))
			self.logger.error(str(response_text))
			return

		self.logger.info("")
		self.logger.info("responding to client with data: {}".format(formatted_response))

		# send response
		print(formatted_response, end="")

	# respond with raw data
	def send_debug(self, response_text, content_type="text/plain", duplicate=False):
		if not duplicate:
			print("Content-type:{}\r\n".format(content_type))
		print(response_text)

	##############################
	##		CONFIGURATION		##
	##############################
	'''
	load credentials from config.ini

	see example_config.ini for file format
	'''
	def load_config(self, config_file):
		parser = configparser.ConfigParser()
		parser.read(config_file)
		credentials = parser["credentials"]

		loaded_config = {}

		loaded_config["merchant_account"] = credentials["merchantAccount"]
		loaded_config["api_key"] = credentials["apiKey"]

		return loaded_config

	######################
	##		HEADERS		##
	######################
	def get_json_header(self):
		return {
			"Content-Type": "application/json",
			"X-API-Key": self.config["api_key"]
		}
