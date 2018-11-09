var express = require('express');
var router = express.Router({mergeParams: true});

router.get('/', function(req, res) {
  var buildingId = req.params.buildingId;
  db.getBuildingStoreys(buildingId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
});

router.get('/:level', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  db.getBuildingStorey(buildingId, storeyLevel, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
});

router.get('/:level/svg', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  db.getFloorplanByLevel(buildingId, storeyLevel, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
});


module.exports = router;
