var extend = require('jquery-extend');
var request = require('request');

module.exports = function (grunt) {
    
    function downloadOnePokemon(requestParams, cb) {
        var outFile = requestParams.outFile();
        grunt.log.ok('Downloading to ' + outFile);
        
        request.post({
            url: requestParams.url,
            method: 'POST',
            headers: requestParams.headers,
            form: requestParams.params
        }, function (err, res, body) {
            if (!err) {
                grunt.file.write(outFile, body);
                var json = JSON.parse(body);
                cb(true, json.nextPokemonId);
            } else {
                grunt.fail.warn('Error retrieving data from Global Link: ' + err);
                cb(false, '1-0');
            }
        });
    }

    function downloadAllPokemon(rawDir, requestParams, cb) {
        requestParams.params = requestParams.initialParams;
        requestParams.outFile = function () {
            return rawDir + '/' + requestParams.params.pokemonId + '.json'
        };

        function keepGoing (res, nextId) {
            if (nextId === '1-0') {
                cb(res);
            } else {
                requestParams.params.pokemonId = nextId;
                downloadOnePokemon(requestParams, keepGoing);
            }            
        }

        downloadOnePokemon(requestParams, keepGoing);
    }

    function getFormeName(info) {
        if (info.name === 'Rotom') {
            switch (info.typeName2) {
                case 'Ghost':
                    return 'Rotom';
                case 'Grass':
                    return 'Rotom-C';
                case 'Ice':
                    return 'Rotom-F';
                case 'Fire':
                    return 'Rotom-H';
                case 'Flying':
                    return 'Rotom-S';
                case 'Water':
                    return 'Rotom-W';
            }
        } else if (info.name === 'Landorus' ||
                   info.name === 'Tornadus' ||
                   info.name === 'Thundurus') {
            if (info.formNo === '1') {
                return info.name + '-T';
            }
        } else if (info.name === 'Pumpkaboo' ||
                   info.name === 'Gourgeist') {
            switch (info.formNo) {
                case '0':
                    return info.name + '-Average';
                case '1':
                    return info.name + '-Small';
                case '2':
                    return info.name + '-Large';
                case '3':
                    return info.name + '-Super';

            }
        }
        return info.name;
    }

    function individualSet(data) {
        var rv = {};
        // We need the "info" for the name (and possibly types), and "trend" for the rest of the data
        if (data && data.rankingPokemonInfo && data.rankingPokemonTrend) {
            try {
                // Note: This assumes all info arrays are properly ranked.  If that ever changes, this'll
                // need to actually sort the arrays (or at least look for ranking === 1)
                var trend   = data.rankingPokemonTrend;
                var nature  = trend.seikakuInfo && trend.seikakuInfo[0].name;
                var ability = trend.tokuseiInfo && trend.tokuseiInfo[0].name;
                var item    = trend.itemInfo && trend.itemInfo[0].name;
                var moves   = trend.wazaInfo && trend.wazaInfo.slice(0,4).map(function (a) { return a.name; });
                var name    = getFormeName(data.rankingPokemonInfo);

                rv[name] = {
                    "Common Battle Spot": {
                        level:   50,
                        evs:     {},
                        nature:  grunt.LevenWork.closestNature(nature),
                        ability: grunt.LevenWork.closestAbility(ability),
                        item:    grunt.LevenWork.closestItem(item),
                        moves:   moves.map(function (a) { return grunt.LevenWork.closestMove(a); })
                    }
                };
            } catch (e) {
                grunt.fail.warn('Error extracting set info for ' + data.rankingPokemonInfo.name + ': ' + e);
            }
        }
        return rv;
    }

    function generateGlobalLinkDex(inDir, out) {
        var sets = {};
        grunt.log.write('Processing sets');
        grunt.file.recurse(inDir, function (abspath) {
            sets = extend(sets, individualSet(grunt.file.readJSON(abspath)));
            grunt.log.write('.');
        });
        grunt.log.ok();

        var outText = 'var SETDEX_GLOBALLINK=' + JSON.stringify(sets, null, 2) +';';
        var trueOutf = process.cwd() + '/' + out;
        grunt.log.ok('Writing output to ' + trueOutf);
        grunt.file.write(trueOutf, outText);

    }

    grunt.registerTask('globalLinkDownload', 'Download the Global Link data', function () {
        var done = this.async();
        downloadAllPokemon(
            grunt.config([this.name, 'rawDir']), 
            grunt.config([this.name, 'request']), 
            function (res) {
                done(res);
            }
        );
    });

    grunt.registerTask('globalLink', 'Generate Global Link dex data', function () { 
        generateGlobalLinkDex(
            grunt.config([this.name, 'rawDir']), 
            grunt.config([this.name, 'genFile'])
        );
    });
};