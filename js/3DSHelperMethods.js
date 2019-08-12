import { uuid } from "./common.js";

const CACHED_THREEDS_URL = "https://pal-test.adyen.com/threeds2simulator/acs/startMethod.shtml";

const globals = {};


  //////////////////
 // MAIN METHODS //
//////////////////

// both the fingerprint and challenge follow the same flow:
// creates an iframe with a self-submitting form, which redirects to the issuer's page
// that page redirects to the result on completion

export const getFingerprint = (serverTransactionID, methodURL, threedsMethodNotificationURL, container) => {

    return new Promise((resolve, reject) => {

    	// Create and Base64Url encode a JSON object containing the serverTransactionID & threeDSMethodNotificationURL
    	const dataObj = { threeDSServerTransID : serverTransactionID, threeDSMethodNotificationURL : threedsMethodNotificationURL };
    	const jsonStr = JSON.stringify(dataObj);
    	const base64URLencodedData = btoa(jsonStr);

    	// Create an iframe with a form that redirects to issuer's fingerprinting page
    	let iframe = createIFrame(container, "threeDSMethodIframe", "0", "0", data => {
            if (data.target.contentWindow.location.host) {
                resolve( { threeDSCompInd: "Y" } );
                iframe.remove();
            }
        });
        const form = createForm('threedsMethodForm', methodURL, 'threeDSMethodIframe', 'threeDSMethodData', base64URLencodedData);
        iframe.appendChild(form);
        form.submit();

        // timeout after 15 seconds
        setTimeout(() => reject( { threeDSCompInd: "U" } ), 15000);
    });
};

export const doChallenge = (acsURL, cReqData, iframeConfig, notificationURL) => {

    const TIMEOUT = 5 * 60 * 1000; // 5 minutes

    return new Promise((resolve, reject) => {

        // convert cReqData to base64
        const jsonStr = JSON.stringify(cReqData);
        const base64EncodedcReqData = btoa(jsonStr);

        const iframeSizes = {
            '01': ['250px', '400px'],
            '02': ['390px', '400px'],
            '03': ['500px', '600px'],
            '04': ['600px', '400px'],
            '05': ['100%', '100%']
        };
        const iframeWidth = iframeSizes[iframeConfig.size][1];
        const iframeHeight = iframeSizes[iframeConfig.size][0];

        // Create an iframe with a form that redirects to issuer's fingerprinting page
        let iframe = createIFrame(iframeConfig.container, "challengeIframe", iframeWidth, iframeHeight, data => {
            
            // the challenge iframe redirects to the notificationURL from the authorise call when it's completed
            // so we'll check every second to see if the redirect has happened yet
            if (!globals.checkChallengeInterval) {
                globals.checkChallengeInterval = setInterval(() => {

                    try {
                        if (iframe.contentWindow.location.href.includes(notificationURL)) {
                            clearInterval(globals.checkChallengeInterval);
                            
                            // pull cres data from the document body
                            const cres = JSON.parse(atob(JSON.parse(iframe.contentDocument.querySelector("body").innerHTML).cres));

                            // remove the iframe and resolve the promise
                            iframe.remove();
                            const transStatus = cres.transStatus;
                            if (transStatus === "Y") {
                                resolve( { transStatus: transStatus } );
                            }
                            else {
                                reject( { transStatus: transStatus } );
                            }
                        }
                    }
                    catch(error) {
                        // will return a CORS error if the challenge hasn't been completed yet
                        // this is expected - don't throw an error
                        console.log(error);
                    }
                }, 1000);
            }
        });
        const form = createForm('cReqForm', acsURL, 'challengeIframe', 'creq', base64EncodedcReqData);
        iframe.appendChild(form);
        form.submit();

        // timeout after some point
        setTimeout(() => reject( { transStatus: "N" } ), TIMEOUT);
    });
};

  ////////////////////
 // HELPER METHODS //
////////////////////

// creates an iFrame element and attaches it to the page
function createIFrame(container, name, width = '0', height = '0', callback = undefined) {

	// 1. Create iframe HTML
	const iframe = document.createElement('iframe');
	const iframeHTML = '<html><body></body></html>';

	iframe.height = height;
	iframe.width = width;
	iframe.name = name;
	iframe.innerHTML = iframeHTML;

	iframe.onload = callback;

	// attach to page
	if (container instanceof HTMLElement) {
		container.appendChild(iframe);
		return iframe;
	}
	else {
		console.error("container is not of type HTMLElement");
	}
}

// creates a form for sending post data
// can't be sent via normal AJAX because the issuer redirect requires the page to load
function createForm(name, action, target, inputName, inputValue) {

    if (!name || !action || !inputName || !inputValue) {
        throw new Error('Not all parameters provided');
    }

    const form = document.createElement( 'form' );
    form.style.display = 'none';
    form.name = name;
    form.action = action;
    form.method = "POST";
    form.target = target;
    const input = document.createElement( 'input' );
    input.name = inputName;
    input.value = inputValue;
    form.appendChild( input );
    return form;
}
