const CHECKOUT_VERSION = "v52";
const PAL_VERSION = "v49";

const common = {
	// change this to your own value
	// https://docs.adyen.com/user-management/how-to-get-an-origin-key
	ORIGIN_KEY: "pub.v2.8115054323780109.aHR0cDovL2xvY2FsaG9zdDo4MDAw.B92basPQjzeM7_TtJ2IKZoln780QtvwAiPFDEbKs7Ng",

	// request headers
	FORM_ENCODED_HEADER: { "Content-Type": "application/x-www-form-urlencoded" },
	JSON_ENCODED_HEADER: { "Content-Type": "application/json" },

	// local server URLs
	SERVER_URL: "http://localhost:8000/cgi-bin/server.py",
	SEND_POST_MESSAGE: "http://localhost:8000/cgi-bin/send_post_message.py",
	RETURN_URL: "http://localhost:8000/cgi-bin/echo.py",

	// API versions
	CHECKOUT_VERSION: "v52",
	PAL_VERSION: "v49",

	// Adyen endpoints
	endpoints: {
		"paymentMethods": "https://checkout-test.adyen.com/" + CHECKOUT_VERSION + "/paymentMethods",
		"paymentsDetails": "https://checkout-test.adyen.com/" + CHECKOUT_VERSION + "/payments/details",
		"payments": "https://checkout-test.adyen.com/" + CHECKOUT_VERSION + "/payments",
		"authorise": "https://pal-test.adyen.com/pal/servlet/Payment/" + PAL_VERSION + "/authorise",
		"authorise3d": "https://pal-test.adyen.com/pal/servlet/Payment/" + PAL_VERSION + "/authorise3d",
		"authorise3ds2": "https://pal-test.adyen.com/pal/servlet/Payment/" + PAL_VERSION + "/authorise3ds2",
	},

	// method to send AJAX POST requests
	AJAXPost: function(path, callback, params = {}, headers = JSON_ENCODED_HEADER) {

		// build request
		let request = new XMLHttpRequest();
		request.open("POST", path, true);
		request.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.getResponseHeader("content-type") === "application/json") {
					callback(JSON.parse(this.responseText));
				}
				else {
					callback(this.responseText);
				}
			}
		};

		// add headers to requests
		for (let key in headers) {
			request.setRequestHeader(key, headers[key]);
		}

		// stringify params
		if (typeof(params) === "object") {
			params = JSON.stringify(params);
		}

		// send request
		request.send(params);
	},

	// method to send AJAX GET requests
	AJAXGet: function(path, callback) {
		let request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.getResponseHeader("content-type") === "application/json") {
					callback(JSON.parse(this.responseText));
				}
				else {
					callback(this.responseText);
				}
			}
		},

		request.send();
	},

	/*
	parses and logs API calls

	for easier logging, server.py returns an object with format:
	{
		request: {
			// JSON body of request to API
		},
		response: {
			// JSON body of response from API
		},
		endpoint: // API endpoint called
	}

	returns the response JSON object
	*/
	parseServerResponse: function(data) {
		request = data.request;
		response = data.response;

		output(request, "Request from server to Adyen", data.endpoint);
		output(response, "Response from Adyen to server");

		return response;
	},

	// utility to output to web page
	output: function(text, title = null, subtitle = null, indentation = 4) {

		// holder for title, subtitle, and content
		contentEl = document.createElement("div");

		// holder for container + summary
		containerEl = document.createElement("div");
		containerEl.classList.add("output-item");
		containerEl.appendChild(contentEl);

		// text to show when element is collapsed
		let summary;

		// format output
		if (typeof(text) === "object") {
			try {
				// indent JSON object
				text = JSON.stringify(text, null, indentation);
				summary = "{ JSON }";
			}
			catch(e) {
				// convert non-JSON object to string
				text = text.toString();
				summary = "{ Object }";
			}
		}
		else if (typeof(text) === "string") {
			try {
				// try to convert text to JSON
				text = JSON.stringify(JSON.parse(text), null, indentation);
				summary = "{ JSON }";
			}
			catch(e) {
				// do nothing, sometimes text is just text - Lao Tzu
				// use first 50 characters as summary
				summary = text.match(/.{50,50}/) + (text.length > 55) ? "..." : "";
			}
		}

		// remove extra backslashes from overzealous URL encoding
		text = text.replace(/\\/g, "");

		// add a subtitle, usually endpoint or SDK method
		if (subtitle) {
			subtitleContainer = document.createElement("pre");
			subtitleEl = document.createElement("code");
			subtitleContainer.appendChild(subtitleEl);
			subtitleContainer.classList.add("output-subtitle");
			subtitleEl.innerHTML = subtitle;
			contentEl.append(subtitleContainer);

			if (!title) {
				summary = subtitle;
			}
		}

		// set summary to title if it's supplied
		if (title) {
			summary = title;

			// append arrow at end of summary
			summary += " &#9656,";
		}


		// create main body of item
		outputTextContainer = document.createElement("pre");
		outputText = document.createElement("code");
		outputTextContainer.appendChild(outputText);
		outputText.classList.add("output-main-body");
		outputText.innerHTML = text;
		contentEl.appendChild(outputTextContainer);

		// add highlighting
		hljs.highlightBlock(outputText);

		// create summary element
		summaryEl = document.createElement("div");
		summaryEl.classList.add("output-summary");
		summaryEl.innerHTML = summary;
		containerEl.insertBefore(summaryEl, containerEl.firstChild);

		// add event listener to expand / collapse
		summaryEl.addEventListener("click", () => {
			console.log("hide");
			console.log(contentEl);
			contentEl.classList.toggle("display-none");
		});

		// add to page
		document.querySelector("#output").append(containerEl);
	},

	// add the hidden class to an object
	// applies "display: none" CSS
	hide: function(querySelector) {
		document.querySelector(querySelector).classList.add("display-none");
	},

	// remove the hidden class from an object
	unhide: function(querySelector) {
		document.querySelector(querySelector).classList.remove("display-none");
	},

	// generate UUID for 3DS2 prefetch flow
	uuid: function() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
	  });
	},

	// pulls values from HTML form and encodes into JSON object
	getJSONFromFormData: function(querySelector) {
		result = {};
		for (let el of document.querySelector(querySelector).elements) {
			result[el.name] = el.value;
		}
		return result;
	},

	// generate browserInfo object
	collectBrowserInfo: function() {

	    screenWidth = window && window.screen ? window.screen.width : '';
	    screenHeight = window && window.screen ? window.screen.height : '';
	    colorDepth = window && window.screen ? window.screen.colorDepth : '';
	    userAgent = window && window.navigator ? window.navigator.userAgent : '';
	    javaEnabled = window && window.navigator ? navigator.javaEnabled() : false;

	    let language = '';
	    if (window && window.navigator) {
	        language = window.navigator.language
	            ? window.navigator.language
	            : window.navigator.browserLanguage; // Else is for IE <+ 10
	    }

	    d = new Date();
	    timeZoneOffset = d.getTimezoneOffset();

	    browserInfo = {
	        screenWidth,
	        screenHeight,
	        colorDepth,
	        userAgent,
	        timeZoneOffset,
	        language,
	        javaEnabled
	    };

	    return browserInfo;
	},

	// convert functions to pretty output
	stringifyFunction: function(func) {
		return func.toString().replace(/ {4}/g, "\t").replace(/\t/g, "    ");
	}
}
