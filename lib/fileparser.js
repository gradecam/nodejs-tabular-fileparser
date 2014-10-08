/* jshint node:true, unused:true */
'use strict';

var fs = require('fs');

var csv = require('csv');
var Deferred = require('Deferred');
var __ = require('underscore');
var xlsx = require('xlsx');


function transform_data(data, headers) {
    if (Array.isArray(headers)) {
        data = __.map(data, function(row) {
            return __.object(headers, row);
        });
    } else if (headers) {
        var head = data.shift();
        __.each(headers, function(val, key) {
            var idx = __.indexOf(head, key);
            if (idx != -1) {
                head[idx] = val;
            }
        });
        data = __.map(data, function(row) {
            return __.object(head, row);
        });
    }
    return data;
}

function parse_xlsx(filename, headers) {
    var dfd = new Deferred();
    var workbook = xlsx.readFile(filename);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var opts = (
        Array.isArray(headers) && {header: headers} ||
        {header: 1}
    );
    var data = xlsx.utils.sheet_to_json(worksheet, opts);
    if (headers && !Array.isArray(headers)) {
        data = transform_data(data, headers);
    }
    return dfd.resolve(data);
}

function parse_csv(filename, headers, delim) {
    delim = delim || ',';
    var dfd = new Deferred();
    var parser = csv.parse({delimiter: delim, trim: true}, function(err, data) {
        if (err) {
            dfd.reject(err);
        } else {
            data = transform_data(data, headers);
            dfd.resolve(data);
        }
    });
    fs.createReadStream(filename).pipe(parser);
    return dfd.promise();
}

function parse(filename, headers) {
    var ext = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    switch (ext) {
        case 'xlsx':
            return parse_xlsx(filename, headers);
        case 'csv':
            return parse_csv(filename, headers);
        case 'tsv':
        case 'tab':
            return parse_csv(filename, headers, '\t');
        default:
            throw 'Unsupported file format.';
    }
}

module.exports = parse;
