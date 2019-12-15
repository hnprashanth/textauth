/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var storageAuthusersName = process.env.STORAGE_AUTHUSERS_NAME
var storageAuthusersArn = process.env.STORAGE_AUTHUSERS_ARN

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
AWS.config.update({ region: 'ap-south-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


/**********************
 * Example get method *
 **********************/

app.get('/auth', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

app.get('/auth/*', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

/****************************
* Example post method *
****************************/

app.post('/auth', async function (req, res) {
  // Add your code here
  const otp = Math.floor(100000 + Math.random() * 900000)
  const item = { phone: req.body.phone, otp }
  let putItemParams = {
    TableName: 'authusers-dev',
    Item: item
  }
  await dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: 'put call succeed!', url: req.url, data: data })
    }
  });
});

app.post('/auth/verify', async function (req, res) {
  // Add your code here
  console.log(req.body)
  let getItemParams = {
    TableName: "authusers-dev",
    Key: { phone: req.body.phone }
  }

  const user = await getItem(getItemParams)
  console.log(user)
  if (user.otp === parseInt(req.body.otp)) {
    res.json({ success: 'Valid OTP' })
  } else {
    res.json({ success: 'Invalid OTP' })
  }
});

/****************************
* Example put method *
****************************/

app.put('/auth', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body })
});

app.put('/auth/*', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body })
});

/****************************
* Example delete method *
****************************/

app.delete('/auth', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.delete('/auth/*', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.listen(3000, function () {
  console.log("App started")
});

//get a single item from dynamoDB
function getItem(params) {
  let promise = new Promise(function (resolve, reject) {
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      if (result.Item) {
        resolve(result.Item);
      } else {
        reject({ error: "item not found" });
      }
    });
  });
  return promise;
}

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
