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

GraphDb.prototype.setWeights = function(callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH p=()-[r:CONNECTED_TO]-()
        FOREACH (n IN relationships(p)| SET n.weight = rand() * 10 )`
    )
    .then(function(results) {

      callback(null, true);
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



   GraphDb.prototype.getWeightedRoute = function(buildingId, source_id, leaf_id, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (start:IfcSpace {ifc_global_id: '${source_id}'}), (end:IfcSpace {ifc_global_id: '${leaf_id}'})
        CALL apoc.algo.dijkstra(start, end, 'CONNECTED_TO', 'weight') YIELD path
        RETURN path`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0].segments);
      });
      session.close();
      let final_res = []
      records = records[0]
      for (let i = 0; i < records.length; i ++) {

        let levelFirst = 0
        if (records[i].start.properties._center_point[2] > 4.0){
          levelFirst = 1
        }
        let levelSecond = 0
        if (records[i].relationship.properties._center_point[2] > 4.0){
          levelSecond = 1
        }

        let firstCoord = {'x': records[i].start.properties._center_point[0], 'y': -records[i].start.properties._center_point[1], 'level': levelFirst, 'guid': records[i].start.properties.ifc_global_id, 'type': 'IfcSpace'}

        let secondCoord = {'x': records[i].relationship.properties._center_point[0], 'y': -records[i].relationship.properties._center_point[1], 'level': levelSecond, 'guid': '', 'type': 'IfcDoor'}
        if (i > 0) {
          let prevCoord = final_res[i-1]
          let distance1 = utils.calcDistance(prevCoord, firstCoord)
          let distance2 = utils.calcDistance(prevCoord, secondCoord)

          if (distance1 < distance2) {
            final_res.push(firstCoord)
          }
          final_res.push(secondCoord)
        } else {
          final_res.push(firstCoord)
          final_res.push(secondCoord)
        }

      }
      // if (records[records.length - 1].end.properties._center_point[2] < 4.0){
      //     let levelLast = 0
      //   } else {
      //     let levelLast = 1
      // }

      let levelLast = 0
        if (records[records.length - 1].end.properties._center_point[2] > 4.0){
          levelLast = 1
        }

      let lastCoord = {'x': records[records.length - 1].end.properties._center_point[0], 'y': -records[records.length - 1].end.properties._center_point[1], 'level': levelLast, 'guid': records[records.length - 1].end.properties.ifc_global_id, 'type': 'IfcSpace'}

      final_res.push(lastCoord)

      // let final_res = []
      // for (let i = 0; i < records.length; i = i + 3){
      //   final_res.push({'x': records[i][0].properties._center_point[0],
      //       'y': -records[i][0].properties._center_point[1]})
      //   final_res.push({'x': records[i][1].properties._center_point[0],
      //       'y': -records[i][1].properties._center_point[1]})

      // }

      callback(null, final_res);
    })
    .catch(function(err) {
      session.close();
      callback(err);
    });
};

GraphDb.prototype.getShortestRoute = function(buildingId, source_id, leaf_id, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (ms:IfcSpace { ifc_global_id: '${source_id}' }),(cs:IfcSpace { ifc_global_id: '${leaf_id}' }),
        p=shortestPath((ms)-[:CONNECTED_TO*..15]-(cs))
        RETURN p`
    )
    .then(function(results) {
      var records = [];
      results.records.forEach(function(record) {
        records.push(record._fields[0].segments);
      });
      session.close();
      let final_res = []
      records = records[0]
      for (let i = 0; i < records.length; i ++) {

        let levelFirst = 0
        if (records[i].start.properties._center_point[2] > 4.0){
          levelFirst = 1
        }
        let levelSecond = 0
        if (records[i].relationship.properties._center_point[2] > 4.0){
          levelSecond = 1
        }

        let firstCoord = {'x': records[i].start.properties._center_point[0], 'y': -records[i].start.properties._center_point[1], 'level': levelFirst, 'guid': records[i].start.properties.ifc_global_id, 'type': 'IfcSpace'}

        let secondCoord = {'x': records[i].relationship.properties._center_point[0], 'y': -records[i].relationship.properties._center_point[1], 'level': levelSecond, 'guid': '', 'type': 'IfcDoor'}
        if (i > 0) {
          let prevCoord = final_res[i-1]
          let distance1 = utils.calcDistance(prevCoord, firstCoord)
          let distance2 = utils.calcDistance(prevCoord, secondCoord)

          if (distance1 < distance2) {
            final_res.push(firstCoord)
          }
          final_res.push(secondCoord)
        } else {
          final_res.push(firstCoord)
          final_res.push(secondCoord)
        }

      }
      // if (records[records.length - 1].end.properties._center_point[2] < 4.0){
      //     let levelLast = 0
      //   } else {
      //     let levelLast = 1
      // }

      let levelLast = 0
        if (records[records.length - 1].end.properties._center_point[2] > 4.0){
          levelLast = 1
        }

      let lastCoord = {'x': records[records.length - 1].end.properties._center_point[0], 'y': -records[records.length - 1].end.properties._center_point[1], 'level': levelLast, 'guid': records[records.length - 1].end.properties.ifc_global_id, 'type': 'IfcSpace'}

      final_res.push(lastCoord)

      // let final_res = []
      // for (let i = 0; i < records.length; i = i + 3){
      //   final_res.push({'x': records[i][0].properties._center_point[0],
      //       'y': -records[i][0].properties._center_point[1]})
      //   final_res.push({'x': records[i][1].properties._center_point[0],
      //       'y': -records[i][1].properties._center_point[1]})

      // }

      callback(null, final_res);
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

GraphDb.prototype.getSpace = function(buildingId, spaceId, callback) {
  var session = this.driver.session();
  session
    .run(
      ` MATCH (bui:IfcBuilding)-[:CONTAINS_STOREY]-(sto:IfcBuildingStorey)
        WHERE bui.ifc_global_id = '${buildingId}'
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
