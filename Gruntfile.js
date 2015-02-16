module.exports = function (grunt) {

    // Since I want to avoid polluting the global namespace, we're going to eval all the datafiles in
    // their own namespace. Global Namespace Pollution BAAAD!
    var LevenWork = (function (grunt) {

        var MOVES_FILE     = './move_data.js';
        var ABILITIES_FILE = './ability_data.js';
        var NATURES_FILE   = './nature_data.js';
        var ITEMS_FILE     = './item_data.js';

        var leven = require('levenshtein');
        var $ = {
            extend: require('jquery-extend')
        };

        var moves, abilities, natures, items;

        eval(grunt.file.read(MOVES_FILE, 'utf8'));
        eval(grunt.file.read(ABILITIES_FILE, 'utf8'));
        eval(grunt.file.read(NATURES_FILE, 'utf8'));
        eval(grunt.file.read(ITEMS_FILE, 'utf8'));

        var moves     = Object.keys(MOVES_XY);
        var abilities = ABILITIES_XY;
        var natures   = Object.keys(NATURES);
        var items     = ITEMS_XY;

        // Let's stick some items into that ITEMS_XY array, since Mega Stones have a special function
        // when it comes to forme-picking.
        items = items.concat([
            'Abomasite',
            'Absolite',
            'Aerodactylite',
            'Aggronite',
            'Alakazite',
            'Altarianite',
            'Ampharosite',
            'Audinite',
            'Banettite',
            'Beedrillite',
            'Blastoisinite',
            'Blazikenite',
            'Cameruptite',
            'Charizardite X',
            'Charizardite Y',
            'Diancite',
            'Galladite',
            'Garchompite',
            'Gardevoirite',
            'Gengarite',
            'Glalitite',
            'Gyaradosite',
            'Heracronite',
            'Houndoominite',
            'Kangaskhanite',
            'Latiasite',
            'Latiosite',
            'Lopunnite',
            'Lucarionite',
            'Manectite',
            'Mawilite',
            'Medichamite',
            'Metagrossite',
            'Mewtwonite X',
            'Mewtwonite Y',
            'Pidgeotite',
            'Pinsirite',
            'Sablenite',
            'Salamencite',
            'Sceptilite',
            'Scizorite',
            'Sharpedonite',
            'Slowbronite',
            'Steelixite',
            'Swampertite',
            'Tyranitarite',
            'Venusaurite'
            ]);

        function simpleLeven(inKey, ary) {
            // We can do this with a sort like the one here, but that actually takes a lot longer -- we only 
            // need the minimum value, soo...
            // return ary.sort(function (a, b) {
            //         return leven(inKey, a) - leven(inKey, b);
            //     })[0];

            var bestMatch = {
                val: 'NOMATCH',
                dist: Number.MAX_VALUE
            }

            function mangle(s) {
                return s.replace(/\W/g, '').toLowerCase();
            }

            ary.forEach(function (a) {
                var dist = leven(inKey, mangle(a));
                if (dist < bestMatch.dist) {
                    bestMatch.val = a;
                    bestMatch.dist = dist;
                }
            });
            if (bestMatch.dist < 3) {
                return bestMatch.val;
            }
            // There weren't any sufficiently close matches, which happens a lot for (eg) status moves
            return '';
        }

        return {
            closestMove:    function (inKey) { return simpleLeven(inKey, moves); },
            closestAbility: function (inKey) { return simpleLeven(inKey, abilities); },
            closestNature:  function (inKey) { return simpleLeven(inKey, natures); },
            closestItem:    function (inKey) { return simpleLeven(inKey, items); }
        }
    })(grunt);

    grunt.initConfig({
        http: {
            showdown: {
                options: {
                    url: 'http://www.smogon.com/stats/2015-01/chaos/<%= showdown.rawFile %>'
                },
                dest: '<%= showdown.rawFile %>'
            }
        },
        showdown: {
            rawFile: 'vgc2015-1500.json',
            genFile: 'setdex_showdown.js'

        },
        globalLink: {
            rawDir: 'globalLink',
            genFile: 'setdex_globalLink.js'
        }
    });

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

        return { 
            "Common Showdown": {
                level:   50,
                evs:     spread.evs,
                nature:  LevenWork.closestNature(spread.nature),
                ability: LevenWork.closestAbility(getSimpleSorted(pokeData.Abilities, 1)[0]),
                item:    LevenWork.closestItem(getSimpleSorted(pokeData.Items, 1)[0]),
                moves:   getSimpleSorted(pokeData.Moves, 4).map(function (a) { return LevenWork.closestMove(a); })
            }
        };
    }

    function findSets(fn) {
        // This is the cheesy way to read valid JSON.
        var data = {};
        var sets = {};
        try {
            grunt.log.ok('Reading data file ' + fn);
            data = require('./' + fn);
        } catch (e) { 
            grunt.fail.fatal('Failed to require the data file: ' + fn);
        }
        
        grunt.log.write('Processing sets');
        for (var p in data.data) {
            if (data.data.hasOwnProperty(p)) {
                // p is the name of a Pokemon; the data's in data.data[p] (eg data["data"]["Abomasnow"])
                grunt.log.write('.');
                sets[p] = individualSet(data.data[p]);
            }
        }
        grunt.log.ok();

        return sets;
    }

    function generateShowdownDex(raw, out) {
        var sets = findSets(raw);
        var outText = 'var SETDEX_SHOWDOWN=' + JSON.stringify(sets, null, 2) +';';
        grunt.log.ok('Writing output to ' + out);
        grunt.file.write(out, outText);
    }

    grunt.loadNpmTasks('grunt-http');

    grunt.registerTask('showdown', 'Generate Showdown Dex', function () {
        generateShowdownDex(grunt.config([this.name, 'rawFile']), grunt.config([this.name, 'genFile']));
    });
    
    grunt.registerTask('globallink', 'Generate Global Link data', function () { 
        generateGlobalLinkDex(rawFile.globalLink, genFile.globalLink); 
    });

    grunt.registerTask('default', ['showdown']);
};