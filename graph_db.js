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

GraphDb.prototype.getFloorplans = function(buildingId, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (b:IfcBuilding)-[:CONTAINS_STOREY]->(s:IfcBuildingStorey)-[r:CONTAINS_ELEMENT|CONTAINS_SPACE]-(e)
        WHERE b.ifc_global_id = '${buildingId}'
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

GraphDb.prototype.getFloorplanByLevelPromise = function(buildingId, level) {
  var session = this.driver.session();
  return session.run(
      ` MATCH (b:IfcBuilding)-[:CONTAINS_STOREY]->(s:IfcBuildingStorey)-[r:CONTAINS_ELEMENT|CONTAINS_SPACE]-(e)
        WHERE s._level = ${level} AND b.ifc_global_id = '${buildingId}'
        WITH s, {global_id: e.ifc_global_id, svg_path: e._svg_path, ifc_type: labels(e)[0]} AS element
        RETURN {elements: collect(element), viewBox:s._viewport, level:s._level}`
    )

  // session
  //   .run(
  //     ` MATCH (b:IfcBuilding)-[:CONTAINS_STOREY]->(s:IfcBuildingStorey)-[r:CONTAINS_ELEMENT|CONTAINS_SPACE]-(e)
  //       WHERE s._level = ${level} AND b.ifc_global_id = '${buildingId}'
  //       WITH s, {global_id: e.ifc_global_id, svg_path: e._svg_path, ifc_type: labels(e)[0]} AS element
  //       RETURN {elements: collect(element), viewBox:s._viewport}`
  //   )
  //   .then(function(results) {
  //     var records = [];
  //     results.records.forEach(function(record) {
  //       records.push(record._fields[0]);
  //     });
  //     session.close();
  //     return records[0];
  //   })
  //   .catch(function(err) {
  //     session.close();
  //     return 'err';
  //   });
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
