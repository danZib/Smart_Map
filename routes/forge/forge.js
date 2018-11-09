var forgeSDK = require('forge-apis');
var config = require('./config');
var express = require("express");
var router = express.Router();

router.get('/token', function(req, res) {
  try {
    var client_id = config.credentials.client_id;
    var client_secret = config.credentials.client_secret;
    var scopes = config.scopePublic;

    var req = new forgeSDK.AuthClientTwoLegged(client_id, client_secret, scopes);
    req.authenticate()
        .then(function (credentials) {

          res.json({ access_token: credentials.access_token, expires_in: credentials.expires_in });

        })
        .catch(function (error) {
          res.status(500).end(error.developerMessage);
        });
  } catch (err) {
      res.status(500).end(err);
  }
});

module.exports = router;
