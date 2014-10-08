#!/usr/bin/env node
/* jshint node: true, unused:true */
'use strict';

function main() {
    var context = {
        parse: require('../lib/fileparser'),
    };
    require('embed-shell')({context: context, prompt: 'fileparser> '});
}

if (!module.parent) {
    main();
}
