# Adyen Integration Samples
End-to-end code samples for all of the available Adyen integrations, meant as a reference during implementation.

## Setup:
Download the source code to your local computer:
```bash
git clone https://github.com/crrood/adyen_integration_samples.git
```
Add authentication credentials to `config.ini`.  See `example_config.ini` for file format:
```
[credentials]  # static
merchantAccount = [Your merchant account]
apiKey = [Your webservice user API key]
```

Change the value of ORIGIN_KEY in js/common.js to the value generated for your webservice user per the below:
https://docs.adyen.com/user-management/how-to-get-an-origin-key

Finally, make sure python3 is in your path and run `./update_python_path.sh` to configure the server.  

## Start
From the base directory, start a server with the supplied script:
```bash
./start_server.sh
```

Then go to [localhost:8000](http://localhost:8000) in your browser to view a list of integrations.

## Issues
Please reach out to support@adyen.com for any integration-related questions.  If you notice a bug in the code, please submit a pull request.