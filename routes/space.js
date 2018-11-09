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

router.get('/:spaceId/photospheres/:photosphereId/hotspot', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;
  var photoId = req.params.photosphereId;

  db.getHotSpots(buildingId, storeyLevel, spaceId, photoId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      console.log(records)
      res.json(records);
    }
  });
})

router.post('/:spaceId/photospheres/:photosphereId/hotspot', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;
  var photoId = req.params.photosphereId;
  var workOrderId = req.body.workOrderId;
  var hotSpot = req.body.hotSpot;

  db.createHotSpot(buildingId, storeyLevel, spaceId, photoId, workOrderId, hotSpot, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})


router.get('/:spaceId/workorder', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;
  db.getWorkOrders(buildingId, storeyLevel, spaceId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})

router.get('/:spaceId/workorder/:workorderId/hotspot', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;
  var workorderId = req.params.workorderId;
  db.getHotSpotFromWorkOrder(buildingId, storeyLevel, spaceId, workorderId, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})

router.post('/:spaceId/workorder', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;
  var workOrder = req.body;
  console.log(workOrder)
  db.createWorkOrder(buildingId, storeyLevel, spaceId, workOrder, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})


router.get('/:spaceId/systems/:type/subsystems/:subtype/service/:servicetype', function(req, res) {
  var buildingId = req.params.buildingId;
  var storeyLevel = req.params.level;
  var spaceId = req.params.spaceId;
  var serviceType = req.params.servicetype;
  var systemType = utils.propsToString(req.params.type);
  var subSystemType = utils.propsToString(req.params.subtype);
  db.getSubSystemBySpace(buildingId, storeyLevel, spaceId, systemType, subSystemType, serviceType, function(err, records) {
    if (err) {
      res.send(err);
    } else {
      res.json(records);
    }
  });
})


module.exports = router;
