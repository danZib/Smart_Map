var neo4j = require("neo4j-driver").v1;
var bcrypt = require("bcrypt-nodejs");
var utils = require('./utils.js');
var url = "bolt://178.62.3.124:7687";
var user = "neo4j";
var pass = "neo4j";

function GraphDb() {
  this.driver = neo4j.driver(url, neo4j.auth.basic(user, pass), {disableLosslessIntegers: true});
}

var transformIntegers = function(result) {
  return new Promise( (resolve,reject) => {
    try {
      result.records.forEach( function(row, i) {
        row._fields.forEach( function(val, j) {
          result.records[i]._fields[j] = neo4j.isInt(val)
              ? (neo4j.integer.inSafeRange(val) ? val.toNumber() : val.toString())
              : val;
        })
      })
      resolve(result);
    } catch (error) {
        reject( error );
    }
  });
};

/* BUILDING STOREY *****************************************************/
GraphDb.prototype.getBuildingStoreys = function(buildingId, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (storey:IfcBuildingStorey)<-[:CONTAINS_STOREY]-(building:IfcBuilding)
        WHERE building.ifc_global_id = '${buildingId}'
        RETURN storey{.*}`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getBuildingStorey = function(buildingId, level, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (storey:IfcBuildingStorey)<-[:CONTAINS_STOREY]-(building:IfcBuilding)
        WHERE building.ifc_global_id = '${buildingId}' AND storey._level = ${level}
        RETURN storey{.*}`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getFloorplanByLevel = function(buildingId, level, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (b:IfcBuilding)-[:CONTAINS_STOREY]->(s:IfcBuildingStorey)-[r:CONTAINS_ELEMENT|CONTAINS_SPACE]-(e)
        WHERE s._level = ${level} AND b.ifc_global_id = '${buildingId}'
        WITH s, {global_id: e.ifc_global_id, svg_path: e._svg_path, ifc_type: labels(e)[0]} AS element
        RETURN {elements: collect(element), viewBox:s._viewport}`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getSystemsByLevel = function(buildingId, level, callback) {
  var session = this.driver.session();
  session
    .run(
      `   MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]->(sto:IfcBuildingStorey)-[:CONTAINS_MEP]-(:IfcFlowSegment)-[:CONSISTS_OF]-(sys:IfcSystem)
          WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}' AND NOT (sys)<-[:HAS_SUBSYSTEM]-(:IfcSystem)
          RETURN DISTINCT sys{.*}
      `
    )
   .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getSystemSvgPlot = function(buildingId, level, systemType, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_MEP]-(comp)-[:CONSISTS_OF]-(sys:IfcSystem)
        WHERE sys.ifc_system_type = '${systemType}'
        WITH {global_id: comp.ifc_global_id, svg_path: comp._svg_path, ifc_type: labels(comp)[0]} AS plotElement
        RETURN plotElement`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getSpace = function(buildingId, level, spaceId, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)
        WHERE space.ifc_global_id = '${spaceId}'
        WITH space{.*} AS spaceProps
        RETURN spaceProps`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getPhotoSpheres = function(buildingId, level, spaceId, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)-[:HAS_PHOTOSPHERE]->(photo:PhotoSphere)
        WHERE space.ifc_global_id = '${spaceId}'
        WITH {imageName: photo.image_name, yaw: photo.yaw, pitch: photo.pitch, id: photo.id} AS photoProps
        RETURN photoProps`
    )
    .then(transformIntegers)
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      if (records.length === 0) {
        records.push({})
      }
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getWorkOrders = function(buildingId, level, spaceId,
 callback) {

  query = ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)
        WHERE space.ifc_global_id = '${spaceId}'
        MATCH (space)<-[r:LOCATED_IN]-(work:WorkOrder)
        RETURN collect(work{.*})`

  console.log(query)
  var session = this.driver.session();
  session
    .run(query)
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.createWorkOrder = function(buildingId, level, spaceId, workOrder,
 callback) {

  query = ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)
        WHERE space.ifc_global_id = '${spaceId}'
        CREATE (space)<-[r:LOCATED_IN]-(work:WorkOrder ${utils.objectToString(workOrder, true)})`

  console.log(query)
  var session = this.driver.session();
  session
    .run(query)
    .then(function(results) {
      callback(null, results);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getHotSpots = function(buildingId, level, spaceId, photoId, callback) {

  query = ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)-[:HAS_PHOTOSPHERE]->(photo:PhotoSphere)
        WHERE space.ifc_global_id = '${spaceId}' AND photo.id = '${photoId}'
        WITH space, photo
        MATCH (photo)-[:HAS_HOTSPOT]-(hot:HotSpot)
        RETURN collect(hot{.*})`

  console.log(query)
  var session = this.driver.session();
  session
    .run(query)
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getHotSpotFromWorkOrder = function(buildingId, level, spaceId, workOrderId, callback) {

  query = ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)-[:HAS_PHOTOSPHERE]->(photo:PhotoSphere)-[:HAS_HOTSPOT]->(hot:HotSpot)<-[:HAS_HOTSPOT]-(work:WorkOrder)
        WHERE space.ifc_global_id = '${spaceId}' AND work.id = '${workOrderId}'
        RETURN hot{.*}`

  console.log(query)
  var session = this.driver.session();
  session
    .run(query)
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.createHotSpot = function(buildingId, level, spaceId, photoId, workOrderId, hotSpot, callback) {

  query = ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${level} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)-[:HAS_PHOTOSPHERE]->(photo:PhotoSphere)
        WHERE space.ifc_global_id = '${spaceId}' AND photo.id = '${photoId}'
        WITH space, photo
        MATCH (space)-[:LOCATED_IN]-(work:WorkOrder)
        WHERE work.id = '${workOrderId}'
        CREATE (photo)-[r:HAS_HOTSPOT]->(:HotSpot ${utils.objectToString(hotSpot, true)})<-[:HAS_HOTSPOT]-(work)`

  var session = this.driver.session();
  session
    .run(query)
    .then(function(results) {
      callback(null, results);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getSubSystemBySpace = function(buildingId, storeyLevel, spaceId, systemType, subSystemType, serviceType, callback) {
  var session = this.driver.session();
  var feedDirection = '-[:FEEDS*]-'
  if (serviceType === 'supply') {
    feedDirection = '<-[:FEEDS*]-'
  } else if (serviceType === 'return') {
    feedDirection = '-[:FEEDS*]->'
  }
  session
    .run(
      ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE sto._level = ${storeyLevel} AND bui.ifc_global_id = '${buildingId}'
        WITH sto AS storey
        MATCH (storey)-[:CONTAINS_SPACE]-(space:IfcSpace)
        WHERE space.ifc_global_id = '${spaceId}'
        MATCH p = (space)-[:CONTAINS_MEP]-(terminals:IfcFlowTerminal)${feedDirection}(source)-[:IS_SOURCE]-(system:IfcSystem)
        WHERE system.ifc_system_type = '${subSystemType}'
        WITH nodes(p) AS sys_nodes
        UNWIND sys_nodes AS sys_n
        WITH sys_n
        WHERE NOT 'IfcSpace' IN LABELS(sys_n) AND NOT 'IfcSystem' in LABELS(sys_n)
        RETURN collect(sys_n.ifc_global_id)`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0]);
      });
      session.close();
      callback(null, records[0]);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.transform = function(object) {
  for (let property in object) {
    if (object.hasOwnProperty(property)) {
      const propertyValue = object[property];
      if (neo4j.isInt(propertyValue)) {
        object[property] = propertyValue.toString();
      } else if (typeof propertyValue === 'object') {
        transform(propertyValue);
      }
    }
  }
}
module.exports = GraphDb;
