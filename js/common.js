// change this to your own value
// https://docs.adyen.com/user-management/how-to-get-an-origin-key
export const ORIGIN_KEY = "pub.v2.8115054323780109.aHR0cDovL2xvY2FsaG9zdDo4MDAw.B92basPQjzeM7_TtJ2IKZoln780QtvwAiPFDEbKs7Ng";

// request headers
export const FORM_ENCODED_HEADER = { "Content-Type": "application/x-www-form-urlencoded" };
export const JSON_ENCODED_HEADER = { "Content-Type": "application/json" };

// local server URLs
export const SERVER_URL = "http://localhost:8000/cgi-bin/server.py";
export const THREE_DS_NOTIFICATION_URL = "http://localhost:8000/cgi-bin/threeDSNotification.py";

// API versions
const CHECKOUT_VERSION = "v49";
const PAL_VERSION = "v49";

// Adyen endpoints
export const endpoints = {
	"paymentMethods": "https://checkout-test.adyen.com/" + CHECKOUT_VERSION + "/paymentMethods",
	"paymentsDetails": "https://checkout-test.adyen.com/" + CHECKOUT_VERSION + "/payments/details",
	"payments": "https://checkout-test.adyen.com/" + CHECKOUT_VERSION + "/payments",
	"authorise": "https://pal-test.adyen.com/pal/servlet/Payment/" + PAL_VERSION + "/authorise",
	"authorise3d": "https://pal-test.adyen.com/pal/servlet/Payment/" + PAL_VERSION + "/authorise3d",
	"authorise3ds2": "https://pal-test.adyen.com/pal/servlet/Payment/" + PAL_VERSION + "/authorise3ds2"
};

// method to send AJAX POST requests
export function AJAXPost(path, callback, params = {}, headers = JSON_ENCODED_HEADER) {

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
}

// method to send AJAX GET requests
export function AJAXGet(path, callback) {
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
	};

	request.send();
}

// utility to output to web page
export function output(text, title = null, subtitle = null, indentation = 4) {

	// holder for title, subtitle, and content
	const contentEl = document.createElement("div");

	// holder for container + summary
	const containerEl = document.createElement("div");
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
			// do nothing; sometimes text is just text - Lao Tzu
			// use first 50 characters as summary
			summary = text.match(/.{50,50}/) + (text.length > 55) ? "..." : "";
		}
	}

	// remove extra backslashes from overzealous URL encoding
	text = text.replace(/\\/g, "");

	// add a subtitle, usually endpoint or SDK method
	if (subtitle) {
		const subtitleContainer = document.createElement("pre");
		const subtitleEl = document.createElement("code");
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
		summary += " &#9656;";
	}


	// create main body of item
	const outputTextContainer = document.createElement("pre");
	const outputText = document.createElement("code");
	outputTextContainer.appendChild(outputText);
	outputTextContainer.classList.add("output-main-body");
	outputText.innerHTML = text;
	contentEl.appendChild(outputTextContainer);

	// create summary element
	const summaryEl = document.createElement("div");
	summaryEl.classList.add("output-summary");
	summaryEl.innerHTML = summary;
	containerEl.insertBefore(summaryEl, containerEl.firstChild);

	// add event listener to expand / collapse
	summaryEl.addEventListener("click", () => {
		contentEl.classList.toggle("display-none");
	});

	// add to page
	document.querySelector("#output").append(containerEl);
}

// add the hidden class to an object
// applies "display: none" CSS
export function hide(querySelector) {
	document.querySelector(querySelector).classList.add("display-none");
}

// remove the hidden class from an object
export function unhide(querySelector) {
	document.querySelector(querySelector).classList.remove("display-none");
}

// generate UUID for 3DS2 prefetch flow
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// pulls values from HTML form and encodes into JSON object
export function getJSONFromFormData(querySelector) {
	const result = {};
	for (let el of document.querySelector(querySelector).elements) {
		result[el.name] = el.value;
	}
	return result;
}

// generate browserInfo object
export function collectBrowserInfo() {

    const screenWidth = window && window.screen ? window.screen.width : '';
    const screenHeight = window && window.screen ? window.screen.height : '';
    const colorDepth = window && window.screen ? window.screen.colorDepth : '';
    const userAgent = window && window.navigator ? window.navigator.userAgent : '';
    const javaEnabled = window && window.navigator ? navigator.javaEnabled() : false;

    let language = '';
    if (window && window.navigator) {
        language = window.navigator.language
            ? window.navigator.language
            : window.navigator.browserLanguage; // Else is for IE <+ 10
    }

    const d = new Date();
    const timeZoneOffset = d.getTimezoneOffset();

    const browserInfo = {
        screenWidth,
        screenHeight,
        colorDepth,
        userAgent,
        timeZoneOffset,
        language,
        javaEnabled,
    };

    return browserInfo;
}