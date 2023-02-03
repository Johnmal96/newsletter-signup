const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mailChimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

const API_KEY = process.env.API_KEY;
const server = process.env.SERVER;
const port = process.env.PORT;
const LIST_ID = process.env.LIST_ID; 

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

//Set MailChimp API configuration
mailChimp.setConfig({
    apiKey: API_KEY,
    server: server
});

app.post("/", function(req, res) {
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    //creates a data object to hold new subscriber information
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };
    
    // //convert JS object to JSON format
    const jsonData = JSON.stringify(data);

    //URL endpoint for MailChimp API
    const url = "https://us13.api.mailchimp.com/3.0/lists/" + LIST_ID;

    //creates options object for HTTPS POST request
    const options = {
        method: "POST",
        auth: "JohnMali:" + API_KEY
    }
    
    //make a HTTPS POST request to MailChimp API
    const request = https.request(url, options, function(response) {
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html")
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

        //log API response data
        response.on("data", function(data) {
            console.log(JSON.parse(data));
        })
    });

//write JSON data to the request body
    request.write(jsonData);
    //end the request
    request.end();
})

//redirects failure-page to index-page
app.post("/failure", function (req, res) {
    res.redirect(__dirname + "index.html");
});

app.listen(port, function() {
    console.log("Server is running");
});