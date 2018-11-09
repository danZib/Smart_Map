var express = require('express');
var router = express.Router({mergeParams: true});
var utils = require('../utils.js');

router.get('/', function(req, res) {
  res.send('Hello!');
});

router.get('/:spaceId', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;

  db.getSpace(buildingId, storeyLevel, spaceId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})

router.get('/:spaceId/photospheres', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;

  db.getPhotoSpheres(buildingId, storeyLevel, spaceId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})

module.exports = router;
