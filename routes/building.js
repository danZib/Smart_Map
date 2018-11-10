var express = require('express');
var router = express.Router({mergeParams: true});

router.get('/', function(req, res) {
  res.send('Hello!');
});


// router.get('/storeys', function(req, res) {
//   var buildingId = req.params.buildingId;


//   db.getBuildingStoreys(buildingId, function(err, records) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.json(records);
//     }
//   });

router.get('/svg', async function(req, res) {
  var buildingId = req.params.buildingId;
  var data = []
  const levels = [0, 1, 2]
  // console.log("Outside loop");

  data.push(await db.getFloorplanByLevelPromise(buildingId, 0)
    .then((results) => {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      return records[0];
    })
    .catch(function(err) {
      return 'err';
    }))

  data.push(await db.getFloorplanByLevelPromise(buildingId, 1)
    .then((results) => {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      return records[0];
    })
    .catch(function(err) {
      return 'err';
    }))

  data.push(await db.getFloorplanByLevelPromise(buildingId, 2)
    .then((results) => {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      return records[0];
    })
    .catch(function(err) {
      return 'err';
    }))
  res.json(data)
});

router.get('/path/:sourceId/:leafId', function(req, res) {
  var buildingId = req.params.buildingId;
  var sourceId = req.params.sourceId;
  var leafId = req.params.leafId;
  db.getShortestRoute(buildingId, sourceId, leafId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
});

module.exports = router;
