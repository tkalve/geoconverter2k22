'use strict';
const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');
const proj4list = require('./proj4-list.min.js');

let filename = process.argv[2];
let sourceDef = "EPSG:25834";
let targetDef = "EPSG:4326"; // WGS84

let offsetX = 592330;
let offsetY = 7842260;


proj4.defs([
    proj4list[sourceDef],
    proj4list[targetDef]
]);

if (fs.existsSync(process.argv[2]))
{
    let rawdata = fs.readFileSync(process.argv[2]);
    let geo = JSON.parse(rawdata);
    
    geo.features.forEach(function (feature) {
        feature.geometry.coordinates.forEach(convertCoordinates);
    });

    let parsedFile = path.parse(filename);
    var convertedFilename = parsedFile.name + ".converted" + parsedFile.ext;
    
    // write geojson to a new file
    fs.writeFile(convertedFilename, JSON.stringify(geo), err => {
      if (err) {
        throw err
      }
      console.log('Converted file saved to ' + convertedFilename)
    })
    
    function convertCoordinates(coordinates, index, arr)
    {
        if (Array.isArray(coordinates))
        {
            if (Array.isArray(coordinates[0]))
            {
                coordinates.forEach(convertCoordinates);
            }
            else
            {
                let newCoordinates = proj4(sourceDef, targetDef, [coordinates[0]+offsetX, coordinates[1]+offsetY]);
                arr[index] = [newCoordinates[0], newCoordinates[1]];

                console.log("Converted to " + arr[index])
            }
        }
    }
} else {
    console.error("No such file", filename);
}
