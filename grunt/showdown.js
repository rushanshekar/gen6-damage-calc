module.exports = function (grunt) {

    function getSimpleSorted(obj, max) {
        if (!max) {
            max = Object.keys(obj).length;
        }

        return Object.keys(obj).sort(function (a, b) {
            return obj[b] - obj[a];
        }).slice(0, max);
    }

    var spreadPattern = /([A-Za-z]+):(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)/;
    function parseSpread(spread) {
        // JS regexp is SLOW.  Consider doing this with a simple series of splits instead.
        // Pros: faster.  Cons: less nerd cred. Pros: It's an ugly regexp anyway
        // Adamant:84/220/12/0/20/172
        var rv = {
                nature: 'Hardy',
                evs: {
                    hp: 0,
                    at: 0,
                    df: 0,
                    sa: 0,
                    sd: 0,
                    sp: 0
                }
            };

        var match = spread.match(spreadPattern);
        if (match) {
            rv = {
                nature: match[1],
                evs: {
                    hp: parseInt(match[2]),
                    at: parseInt(match[3]),
                    df: parseInt(match[4]),
                    sa: parseInt(match[5]),
                    sd: parseInt(match[6]),
                    sp: parseInt(match[7])
                }
            };
        }
        return rv;

    }

    function individualSet(pokeData) {
        var spreadRaw = getSimpleSorted(pokeData.Spreads, 1)[0];
        var spread = parseSpread(spreadRaw);

        var allMoves = getSimpleSorted(pokeData.Moves);
        var moves = [];
        for (var i=0; i<allMoves.length; i++) {
            var move = grunt.LevenWork.closestMove(allMoves[i]);
            // If it's not status, let's append it; once we hit four, we'll get out of here.
            if (move && moves.push(move) >= 4) {
                break;
            }
        }
        return { 
            "Common Showdown": {
                level:   50,
                evs:     spread.evs,
                nature:  grunt.LevenWork.closestNature(spread.nature),
                ability: grunt.LevenWork.closestAbility(getSimpleSorted(pokeData.Abilities, 1)[0]),
                item:    grunt.LevenWork.closestItem(getSimpleSorted(pokeData.Items, 1)[0]),
                moves:   moves
            }
        };
    }

    function getFormeName(name) {
        switch (name) {
            case 'Rotom-Frost':
                return 'Rotom-F';
            case 'Rotom-Fan':
                return 'Rotom-S';
            case 'Rotom-Heat':
                return 'Rotom-H';
            case 'Rotom-Wash':
                return 'Rotom-W';
            case 'Rotom-Mow':
                return 'Rotom-C';
            
            case 'Landorus-Therian':
                return 'Landorus-T';
            case 'Tornadus-Therian':
                return 'Tornadus-T';
            case 'Thundurus-Therian':
                return 'Thundurus-T';
        }
        return name;
    }

    function findSets(fn) {
        // This is the cheesy way to read valid JSON.
        var data = {};
        var sets = {};
        try {
            grunt.log.ok('Reading data file ' + fn);
            data = require(process.cwd() + '/' + fn);
        } catch (e) { 
            grunt.fail.fatal('Failed to require the data file: ' + fn);
        }
        
        grunt.log.write('Processing sets');
        for (var p in data.data) {
            if (data.data.hasOwnProperty(p)) {
                // p is the name of a Pokemon; the data's in data.data[p] (eg data["data"]["Abomasnow"])
                grunt.log.write('.');
                var formeName = getFormeName(p);
                sets[formeName] = individualSet(data.data[p]);
            }
        }
        grunt.log.ok();

        return sets;
    }

    function generateShowdownDex(raw, out) {
        var sets = findSets(raw);
        var outText = 'var SETDEX_SHOWDOWN=' + JSON.stringify(sets, null, 2) +';';
        var trueOutf = process.cwd() + '/' + out;
        grunt.log.ok('Writing output to ' + trueOutf);
        grunt.file.write(trueOutf, outText);
    }
    
    grunt.registerTask('showdown', 'Generate Showdown Dex', function () {
        generateShowdownDex(grunt.config([this.name, 'rawFile']), grunt.config([this.name, 'genFile']));
    });

};
