var extend = require('jquery-extend');

module.exports = function (grunt) {

    var showdown_parser = (function() {

        var nameLinePat = /^== (.*)'s (.*) ==$/
        var pokeAndItemLinePat = /^(.+?)\s?(\([^\)]*\))?\s?(?:\([MF]\))?(?: @ (.*))?$/;
        var abilityLinePat = /^Ability: (.*)$/;
        var natureLinePat = /^(.*) Nature$/;
        var evsLinePat = /^EVs:/;
        var ivsLinePat = /^IVs:/;
        var moveLinePat = /^-\s?(.*)$/;

        function parseValues(line) {
            // line looks like:
            //  EVS: 108 HP / 252 Atk / 40 Spe
            // ...so let's chop off the first part (which isn't guaranteed to be 'EVs'), then split on '/'
            var postfix = line.split(':');
            var bits = postfix[postfix.length-1].split('/');
            var rv = {};

            for (var i=0; i<bits.length; i++) {
                var bit = bits[i].trim();
                var spl = bit.split(' ');
                
                if (spl.length !== 2) {
                    continue;
                }

                switch (spl[1].toLowerCase()) {
                    case 'hp':
                        rv.hp = spl[0];
                        break;

                    case 'atk':
                        rv.at = spl[0];
                        break;

                    case 'def':
                        rv.df = spl[0];
                        break;

                    case 'spa':
                        rv.sa = spl[0];
                        break;

                    case 'spd':
                        rv.sd = spl[0];
                        break;

                    case 'spe':
                        rv.sp = spl[0];
                        break;
                }
            }

            if (Object.keys(rv).length) {
                return rv;
            }
            return null;
        }

        return {
            parse: function (data) {
                var allPokes = [];
                var lines = data.split('\n');

                var curPoke = {};
                var bits;

                function finalizePoke(cur, all) {
                    
                    if (!curPoke.title) {
                        curPoke.title = 'Custom Report Set';
                    }

                    // I pulled all of the mega-checking and HP [Ice] stuff... it may eventually have
                    // to go back in some form, but I think we can start without it.

                    all.push(cur);
                }

                for (var i=0; i<lines.length; i++) {
                    var curLine = lines[i].trim();

                    if (curLine.length === 0) {
                        if (Object.keys(curPoke).length) {
                            finalizePoke(curPoke, allPokes);
                        }
                        curPoke = {};
                    } else if (nameLinePat.test(curLine)) { 
                        bits = nameLinePat.exec(curLine);
                        curPoke.title = bits[1] + "'s " + bits[2];
                        curPoke.creator = bits[1];
                    } else if (pokeAndItemLinePat.test(curLine)) {
                        bits = pokeAndItemLinePat.exec(curLine);

                        // If bits[2] is length 3, then it's '(M)' or '(F)'.  Which isn't a Pokemon.
                        if (bits[2] && bits[2].length !== 3) {
                            curPoke.nickname = bits[1];
                            curPoke.pokemon = bits[2].slice(1,bits[2].length-1);
                            curPoke.heldItem = bits[3];
                        } else {
                            curPoke.pokemon = bits[1];
                            curPoke.heldItem = bits[3];
                        }
                    } else if (abilityLinePat.test(curLine)) {
                        bits = abilityLinePat.exec(curLine);

                        curPoke.ability = bits[1];
                    } else if (natureLinePat.test(curLine)) {
                        bits = natureLinePat.exec(curLine);

                        curPoke.nature = bits[1];
                    } else if (evsLinePat.test(curLine)) {
                        curPoke.evs = parseValues(curLine);
                    } else if (ivsLinePat.test(curLine)) {
                        curPoke.ivs = parseValues(curLine);
                    } else if (moveLinePat.test(curLine)) {
                        bits = moveLinePat.exec(curLine);

                        if (curPoke.moves) {
                            curPoke.moves.push(bits[1]);
                        } else {
                            curPoke.moves = [bits[1]];
                        }
                    }
                }

                if (Object.keys(curPoke).length) {
                    finalizePoke(curPoke, allPokes);
                }

                return allPokes;
            }
        }
    })();

    function individualSet(pokeData) {
        var rv = {};
        rv[pokeData.title] = {
            level:   50,
            evs:     pokeData.evs,
            ivs:     pokeData.ivs,
            nature:  grunt.LevenWork.closestNature(pokeData.nature),
            ability: grunt.LevenWork.closestAbility(pokeData.ability),
            item:    grunt.LevenWork.closestItem(pokeData.heldItem),
            moves:   pokeData.moves.map(function(a) { return grunt.LevenWork.closestMove(a); })
        };
        return rv;
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
        var data = {};
        var sets = {};
        try {
            grunt.log.ok('Reading data file ' + fn);
            data = grunt.file.read(fn); 
        } catch (e) { 
            grunt.fail.fatal('Failed to require the data file: ' + fn);
        }
        
        grunt.log.write('Processing sets');
        data = showdown_parser.parse(data);
        for (var i=0; i<data.length; i++) {
            grunt.log.write('.');
            var formeName = getFormeName(data[i].pokemon);
            if (sets[formeName]) {
                sets[formeName] = extend(sets[formeName], individualSet(data[i]));
            } else {
                sets[formeName] = individualSet(data[i]);
            }
        }
        grunt.log.ok();

        return sets;
    }

    function generateNbDex(raw, out) {
        var sets = findSets(raw);
        var outText = 'var SETDEX_NUGGETBRIDGE=' + JSON.stringify(sets, null, 2) +';';
        var trueOutf = process.cwd() + '/' + out;
        grunt.log.ok('Writing output to ' + trueOutf);
        grunt.file.write(trueOutf, outText);
    }
    
    grunt.registerTask('nuggets', 'Generate Nugget Bridge custom set Dex', function () {
        generateNbDex(grunt.config([this.name, 'rawFile']), grunt.config([this.name, 'genFile']));
    });

};
