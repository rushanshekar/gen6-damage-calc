module.exports = function (grunt) {

    // Since I want to avoid polluting the global namespace, we're going to eval all the datafiles in
    // their own namespace. Global Namespace Pollution BAAAD!
    var LevenWork = (function (grunt) {

        var MOVES_FILE     = process.cwd() + '/move_data.js';
        var ABILITIES_FILE = process.cwd() + '/ability_data.js';
        var NATURES_FILE   = process.cwd() + '/nature_data.js';
        var ITEMS_FILE     = process.cwd() + '/item_data.js';

        var leven = require('levenshtein');
        var $ = {
            extend: require('jquery-extend')
        };

        var moves, abilities, natures, items;

        eval(grunt.file.read(MOVES_FILE));
        eval(grunt.file.read(ABILITIES_FILE));
        eval(grunt.file.read(NATURES_FILE));
        eval(grunt.file.read(ITEMS_FILE));

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
            'Venusaurite',
            'Red Orb',
            'Blue Orb'
            ]);

        function simpleLeven(inKey, ary) {
            // We can do this with a sort like the one here, but that actually takes a lot longer -- we only 
            // need the minimum value, soo...
            // return ary.sort(function (a, b) {
            //         return leven(inKey, a) - leven(inKey, b);
            //     })[0];

            if (inKey) {
                var bestMatch = {
                    val: 'NOMATCH',
                    dist: Number.MAX_VALUE
                }

                function mangle(s) {
                    return s.replace(/\W/g, '').toLowerCase();
                }

                var mangledKey = mangle(inKey);
                ary.forEach(function (a) {
                    var dist = leven(mangledKey, mangle(a));
                    if (dist < bestMatch.dist) {
                        bestMatch.val = a;
                        bestMatch.dist = dist;
                    }
                });
                // Since we're mangling everything only a typo should keep us from exact matches...
                // ... in theory, anyway.
                if (bestMatch.dist < 1) {
                    return bestMatch.val;
                }
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

    // HAAAACK
    grunt.LevenWork = LevenWork;

    grunt.initConfig({
        http: {
            showdown: {
                options: {
                    url: 'http://www.smogon.com/stats/2015-12/chaos/<%= showdown.rawFile %>'
                },
                dest: process.cwd() + '/<%= showdown.rawFile %>'
            }
        },
        showdown: {
            rawFile: 'vgc2016-1500.json',
            genFile: 'setdex_showdown.js'

        },
        nuggets: {
            rawFile: 'nbReports/report_sets.txt',
            genFile: 'setdex_nuggetBridge.js'
        },
        globalLinkDownload: {
            rawDir: '<%= globalLink.rawDir %>',
            request: {
                url: 'http://3ds.pokemon-gl.com/frontendApi/gbu/getSeasonPokemonDetail',
                headers: {
                    Referer: 'http://3ds.pokemon-gl.com/battle/oras/'
                },
                initialParams: {
                    languageId: 2,
                    seasonId: 108,
                    battleType: 2,
                    timezone: 'EST',
                    pokemonId: '1-0',
                    displayNumberWaza: 10,
                    displayNumberTokusei: 3,
                    displayNumberSeikaku: 10,
                    displayNumberItem: 10,
                    displayNumberLevel: 10,
                    displayNumberPokemonIn: 10,
                    displayNumberPokemonDown: 10,
                    displayNumberPokemonDownWaza: 10
                }
            }
        },
        globalLink: {
            rawDir: process.cwd() + '/globalLink',
            genFile: 'setdex_globalLink.js',
        }
    });

    grunt.loadTasks('grunt');

    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-debug-task');

    grunt.registerTask('default', ['showdown']);
    grunt.registerTask('all', ['http', 'globalLinkDownload', 'showdown', 'globalLink', 'nuggets']);
};