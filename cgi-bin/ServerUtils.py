#!/usr/local/adyen/python/bin/python3
"""
utilities for sending / receiving requests

includes logging, authentication, and response formatting
"""

import logging

# network methods
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# authentication
import configparser


class ServerUtils():
    """
    class to be imported by cgi modules to access utilities
    """

    ########################
    #      CONSTRUCTOR     #
    ########################

    def __init__(self,
                 logger_prefix="CGI",
                 config_file="config.ini"):
        self.logger = ServerUtils.get_custom_logger(logger_prefix)
        self.config = self.load_config(config_file)

    ####################
    #      LOGGING     #
    ####################
    @staticmethod
    def get_custom_logger(logger_prefix):
        """
        logger with date, time, and custom prefix
        """
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s %(name)s:%(levelname)s %(message)s',
            datefmt='[%d/%m/%Y %X %Z]')

        return logging.getLogger(logger_prefix)

    ############################
    #      NETWORK METHODS     #
    ############################
    """
    class methods for sending requests and responding to client
    """

    def send_request(self,
                     url,
                     request_dict):
        """
        send request to server and return dict or string response
        """
        # logging
        self.logger.info("")
        self.logger.info("sending outgoing request to %s", url)
        self.logger.info("request data: %s", request_dict)

        # encode data
        formatted_data = json.dumps(request_dict).encode("utf8")

        # create request object
        request = Request(url, formatted_data, self.get_json_header())

        try:
            # make request to server
            response = urlopen(request)
            result = response.read()

            self.logger.info("response data: %s", result)

            # format and return response
            if "application/json" in response.getheader("content-type"):
                return json.loads(result.decode("utf8"))
            elif isinstance(result, bytes):
                return result.decode("utf8")
            else:
                return result
        except HTTPError as e:
            return "{}".format(e)

    def send_response(self,
                      response_text,
                      content_type="application/json",
                      skipHeaders=False):
        """
        respond to client
        """
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
        self.logger.info("responding to client with data: %s", formatted_response)

        # send response
        print(formatted_response, end="")

    @staticmethod
    def send_debug(response_text,
                   content_type="text/plain",
                   duplicate=False):
        """
        respond with raw data
        """
        if not duplicate:
            print("Content-type:{}\r\n".format(content_type))
        print(response_text)

    ############################
    #      CONFIGURATION       #
    ############################
    @staticmethod
    def load_config(config_file):
        """
        load credentials from config.ini

        see example_config.ini for file format
        """
        parser = configparser.ConfigParser()
        parser.read(config_file)
        credentials = parser["credentials"]

        loaded_config = {}

        loaded_config["merchant_account"] = credentials["merchantAccount"]
        loaded_config["api_key"] = credentials["apiKey"]

        return loaded_config

    ####################
    #      HEADERS     #
    ####################
    def get_json_header(self):
        """
        return a generic header for json content
        including API key
        """
        return {
            "Content-Type": "application/json",
            "X-API-Key": self.config["api_key"]
        }
