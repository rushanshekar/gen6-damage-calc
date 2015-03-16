var fs     = require('fs');
var expect = require('chai').expect;
var extend = require('jquery-extend');
require('blanket');

// This is heere to get it out of the "use strict" scope.  Since we're not evaling every
// single source file in the app, we have some dangling undefineds that don't matter
// except to the strict-mode parser.
function modularizeSource() {
    eval(fs.readFileSync('damage.js', 'utf8'));

    // For countBoosts
    eval(fs.readFileSync('stat_data.js', 'utf8'));
    var STATS = STATS_GSC;

    // For getMoveEffectiveness
    var $ = { extend: extend };
    eval(fs.readFileSync('type_data.js', 'utf8'));
    var typeChart = TYPE_CHART_XY;

    // Turn it into a module definition
    return {
        calculateAllMoves:    CALCULATE_ALL_MOVES_BW,
        getDamageResult:      getDamageResult,
        buildDescription:     buildDescription,
        appendIfSet:          appendIfSet,
        toSmogonStat:         toSmogonStat,
        chainMods:            chainMods,
        getMoveEffectiveness: getMoveEffectiveness,
        getModifiedStat:      getModifiedStat,
        getFinalSpeed:        getFinalSpeed,
        checkAirLock:         checkAirLock,
        checkForecast:        checkForecast,
        checkKlutz:           checkKlutz,
        checkIntimidate:      checkIntimidate,
        checkDownload:        checkDownload,
        checkInfiltrator:     checkInfiltrator,
        countBoosts:          countBoosts,
        pokeRound:            pokeRound
    };
}

describe('damage', function() {    
    'use strict';

    var damage = {};
    var samplePokemon = {
        "Kangaskhan-Mega": {
            "name": "Mega Kangaskhan",
            "type1": "Normal",
            "type2": "",
            "level": 50,
            "maxHP": 181,
            "curHP": 181,
            "HPEVs": 4,
            "rawStats": {
                "at": 176,
                "df": 120,
                "sa": 72,
                "sd": 120,
                "sp": 167
            },
            "boosts": {
                "at": 0,
                "df": 0,
                "sa": 0,
                "sd": 0,
                "sp": 0
            },
            "stats": {
                "df": 120,
                "sd": 120,
                "sp": 167,
                "at": 176,
                "sa": 72
            },
            "evs": {
                "at": 248,
                "df": 0,
                "sa": 0,
                "sd": 0,
                "sp": 252
            },
            "nature": "Jolly",
            "ability": "Parental Bond",
            "item": "",
            "status": "Healthy",
            "toxicCounter": 0,
            "moves": [
                {
                    "bp": 40,
                    "type": "Normal",
                    "category": "Physical",
                    "makesContact": true,
                    "hasSecondaryEffect": true,
                    "name": "Fake Out",
                    "isCrit": false,
                    "hits": 1
                },
                {
                    "bp": 80,
                    "type": "Dark",
                    "category": "Physical",
                    "makesContact": true,
                    "name": "Sucker Punch",
                    "isCrit": false,
                    "hits": 1
                },
                {
                    "bp": 120,
                    "type": "Normal",
                    "category": "Physical",
                    "makesContact": true,
                    "hasRecoil": true,
                    "name": "Double-Edge",
                    "isCrit": false,
                    "hits": 1
                },
                {
                    "bp": 1,
                    "type": "Fighting",
                    "category": "Physical",
                    "makesContact": true,
                    "name": "Low Kick",
                    "isCrit": false,
                    "hits": 1
                }
            ],
            "weight": 100
        }
    };


    before(function (done) {
        damage = modularizeSource();
        done();
    });

    it('All interface functions exist', function () {
        expect(damage.calculateAllMoves).to.exist;
        expect(damage.getDamageResult).to.exist;
        expect(damage.buildDescription).to.exist;
        expect(damage.appendIfSet).to.exist;
        expect(damage.toSmogonStat).to.exist;
        expect(damage.chainMods).to.exist;
        expect(damage.getMoveEffectiveness).to.exist;
        expect(damage.getModifiedStat).to.exist;
        expect(damage.getFinalSpeed).to.exist;
        expect(damage.checkAirLock).to.exist;
        expect(damage.checkForecast).to.exist;
        expect(damage.checkKlutz).to.exist;
        expect(damage.checkIntimidate).to.exist;
        expect(damage.checkDownload).to.exist;
        expect(damage.checkInfiltrator).to.exist;
        expect(damage.countBoosts).to.exist;
        expect(damage.pokeRound).to.exist;
    });

    // The comment in damage.js suggests the original author is surprised by standard rounding...
    it('pokeRound rounds like GameFreak rounds', function () {
        expect(damage.pokeRound(1.0)).to.equal(1.0);
        expect(damage.pokeRound(1.4)).to.equal(1.0);
        expect(damage.pokeRound(1.5)).to.equal(1.0);
        expect(damage.pokeRound(1.6)).to.equal(2.0);
    });

    it('countBoosts counts positive boosts', function () {
        // No boosts
        expect(damage.countBoosts(samplePokemon['Kangaskhan-Mega'].boosts)).to.equal(0);

        // This is thorough, and silly.
        var modifiedKang = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
        for (var at=-6; at <= 6; at++) {
            for (var df=-6; df <= 6; df++) {
                for (var sa=-6; sa <= 6; sa++) {
                    for (var sd=-6; sd <= 6; sd++) {
                        for (var sp=-6; sp <= 6; sp++) {
                            modifiedKang.boosts = {
                                at: at,
                                df: df,
                                sa: sa,
                                sd: sd,
                                sp: sp
                            };
                            var nBoosts = 0 + Math.max(at, 0) + Math.max(df, 0) + 
                                Math.max(sa, 0) + Math.max(sd, 0) + Math.max(sp, 0);
                            expect(damage.countBoosts(modifiedKang.boosts)).to.equal(nBoosts);
                        }
                    }
                }
            }
        }
    });

    it('getModifiedStat works for a wide variety of stats and boosts', function () {
        for (var stat=0; stat<450; stat++) {
            // Doing this manually rather than in a loop just to be explicit
            expect(damage.getModifiedStat(stat, -6)).to.equal(Math.floor(stat * 2 / 8));
            expect(damage.getModifiedStat(stat, -5)).to.equal(Math.floor(stat * 2 / 7));
            expect(damage.getModifiedStat(stat, -4)).to.equal(Math.floor(stat * 2 / 6));
            expect(damage.getModifiedStat(stat, -3)).to.equal(Math.floor(stat * 2 / 5));
            expect(damage.getModifiedStat(stat, -2)).to.equal(Math.floor(stat * 2 / 4));
            expect(damage.getModifiedStat(stat, -1)).to.equal(Math.floor(stat * 2 / 3));
            expect(damage.getModifiedStat(stat,  0)).to.equal(Math.floor(stat * 2 / 2));
            expect(damage.getModifiedStat(stat,  1)).to.equal(Math.floor(stat * 3 / 2));
            expect(damage.getModifiedStat(stat,  2)).to.equal(Math.floor(stat * 4 / 2));
            expect(damage.getModifiedStat(stat,  3)).to.equal(Math.floor(stat * 5 / 2));
            expect(damage.getModifiedStat(stat,  4)).to.equal(Math.floor(stat * 6 / 2));
            expect(damage.getModifiedStat(stat,  5)).to.equal(Math.floor(stat * 7 / 2));
            expect(damage.getModifiedStat(stat,  6)).to.equal(Math.floor(stat * 8 / 2));
        }
    });

    describe('checkInfiltrator assigns field side data properly', function () {
        var source;

        beforeEach(function () {
            source = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
        });

        var negField = {
            isReflect: false,
            isLightScreen: false
        };
        var posField = {
            isReflect: true,
            isLightScreen: false
        };
        
        it('No Infiltrator, field has nothing, result stays same as start', function() {
            var resultField = {};
            damage.checkInfiltrator(source, resultField);
            expect(resultField).to.deep.equal({});
        });

        it('No Infiltrator, field has reflect & light screen, result stays same as start', function () {
            var resultField = extend(true, {}, posField);
            damage.checkInfiltrator(source, resultField);
            expect(resultField).to.deep.equal(posField);
        });


        it('Infiltrator, field is negative, result is identical to start', function () {
            source.ability = 'Infiltrator';
            var resultField = extend(true, {}, negField);
            damage.checkInfiltrator(source, resultField);
            expect(resultField).to.deep.equal(negField);
        });

        it('Infiltrator, field is positive, result is negated', function() {
            source.ability = 'Infiltrator';
            var resultField = extend(true, {}, posField);
            damage.checkInfiltrator(source, resultField);
            expect(resultField).to.deep.equal(negField);
        });
    });

    describe('checkDownload correctly boosts source based on ability and target\'s stats', function () {
        var source, target;

        beforeEach(function () {
            source = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
            target = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
        });

        it('Base case: No Download', function () {
            var initialBoosts = extend(true, {}, source.boosts);
            damage.checkDownload(source, target);
            expect(source.boosts).to.deep.equal(initialBoosts);
        });

        it('Download, def/sdef match; satk should get boost', function () {
            source.ability = 'Download';
            var expectedBoosts = extend(true, {}, source.boosts);
            expectedBoosts.sa += 1;
            damage.checkDownload(source, target);
            expect(source.boosts).to.deep.equal(expectedBoosts);
        });

        it('Download, def > sdef; satk should get boost', function () {
            source.ability = 'Download';
            target.stats.df = target.stats.sd+1;
            var expectedBoosts = extend(true, {}, source.boosts);
            expectedBoosts.sa += 1;
            damage.checkDownload(source, target);
            expect(source.boosts).to.deep.equal(expectedBoosts);
        });

        it('Download, sdef > def; atk should get boost', function () {
            source.ability = 'Download';
            target.stats.df = target.stats.sd-1;
            var expectedBoosts = extend(true, {}, source.boosts);
            expectedBoosts.at += 1;
            damage.checkDownload(source, target);
            expect(source.boosts).to.deep.equal(expectedBoosts);
        });
    });

    describe('checkIntimidate buffs and debuffs properly with various target abilities', function () {
        var source, target, expectedBoosts;

        beforeEach(function () {
            source = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
            target = extend(true, {}, samplePokemon['Kangaskhan-Mega']);            
            expectedBoosts = extend(true, {}, target.boosts);
        });

        function makeCase(sourceAbil, targetAbil, atMod, saMod) {
            return function () {
                sourceAbil && (source.ability = sourceAbil);
                targetAbil && (target.ability = targetAbil);
                atMod && (expectedBoosts.at += atMod);
                saMod && (expectedBoosts.sa += saMod);
                damage.checkIntimidate(source, target);
                expect(target.boosts).to.deep.equal(expectedBoosts);
            };
        }

        it('Base case: No intimidate on source', makeCase(null));
        it('Source intimidate, no counter-ability', makeCase('Intimidate', null, -1));
        
        it('Source intimidate, target Contrary', makeCase('Intimidate', 'Contrary', +1));
        it('Source intimidate, target Defiant', makeCase('Intimidate', 'Contrary', +1));

        it('Source intimidate, target Clear Body', makeCase('Intimidate', 'Clear Body', 0));
        it('Source intimidate, target White Smoke', makeCase('Intimidate', 'White Smoke', 0));
        it('Source intimidate, target Hyper Cutter', makeCase('Intimidate', 'Hyper Cutter', 0));

        it('Source intimidate, target Simple', makeCase('Intimidate', 'Simple', -2));

        // Future expansion:
        //it('Source intimidate, target Competitive', makeCase('Intimidate', 'Competitive', -1, +2));
    });

    // Why do we even support this?
    describe('checkKlutz effectively eliminates the source\'s held item.', function () {
        var source;

        beforeEach(function () {
            source = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
        });

        it('No held item, no Klutz, no side effects', function () {
            var original = extend(true, {}, source);
            damage.checkKlutz(source);
            expect(source).to.deep.equal(original);
        });

        it('Held item, no Klutz, no side effects', function () {
            source.item = 'Lollipop';
            var original = extend(true, {}, source);
            damage.checkKlutz(source);
            expect(source).to.deep.equal(original);
        });

        it('No held item, Klutz, no side effects', function () {
            source.ability = 'Klutz';
            var original = extend(true, {}, source);
            damage.checkKlutz(source);
            expect(source).to.deep.equal(original);            
        });

        it('Held item, Klutz, item is blanked', function () {
            source.ability = 'Klutz';
            source.item = 'Lollipop';
            var expected = extend(true, {}, source);
            expected.item = '';
            damage.checkKlutz(source);
            expect(source).to.deep.equal(expected);
        });
    });

    // Why do we even support this?
    describe('checkForecast handles Castform correctly', function () {
        var castform, kang, expectedCastform, expectedKang;

        beforeEach(function () {
            // Default to a funky Forecast Castform, since there's only one negative test
            castform = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
            castform.name = 'Castform';
            castform.ability = 'Forecast';
            expectedCastform = extend(true, {}, castform);

            kang = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
            expectedKang = extend(true, {}, kang);
        });

        function makeCase(inWeather, expectedCastformType) {
            return function () {
                var weather = inWeather;
                expectedCastform.type1 = expectedCastformType;
                expectedCastform.type2 = '';

                damage.checkForecast(castform, weather);
                damage.checkForecast(kang, weather);
                expect(castform).to.deep.equal(expectedCastform);
                expect(kang).to.deep.equal(expectedKang);                
            };
        }

        it('Does nothing to Castform (or anyone else) if there\'s no weather', makeCase('', 'Normal'));
        it('Does nothing to Castform (or anyone else) under Strong Winds', makeCase('Strong Winds', 'Normal'));

        it('Changes Castform to Fire in Sun, doesn\'t touch other Pokemon', makeCase('Sun', 'Fire'));
        it('Changes Castform to Fire in Harsh Sun, doesn\'t touch other Pokemon', makeCase('Harsh Sun', 'Fire'));

        it('Changes Castform to Water in Rain, doesn\'t touch other Pokemon', makeCase('Rain', 'Water'));
        it('Changes Castform to Water in Heavy Rain, doesn\'t touch other Pokemon', makeCase('Heavy Rain', 'Water'));

        it('Changes Castform to Ice in Hail, doesn\'t touch other Pokemon', makeCase('Hail', 'Ice'));
    });

    describe('checkAirLock clears weather on weather-clearing abilities', function () {
        var source;
        var field = {
            cleared: false,
            clearWeather: function () {
                this.cleared = true;
            }
        };

        beforeEach(function () {
            field.cleared = false;
            source = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
        });

        it('Clears weather on Air Lock', function () {
            expect(field.cleared).to.be.false;

            source.ability = 'Air Lock';
            damage.checkAirLock(source, field);
            expect(field.cleared).to.be.true;
        });

        it('Clears weather on Cloud Nine', function () {
            expect(field.cleared).to.be.false;

            source.ability = 'Cloud Nine';
            damage.checkAirLock(source, field);
            expect(field.cleared).to.be.true;
        });
    });
    
    // TODO Expand this one to account for item & ability interactions, since the math is being
    // truncated for items.  Also: Verify that the math should be truncated for items.
    describe('getFinalSpeed accounts for abilities and items', function () {
        var source;

        function makeCase(weather, speeds) {
            return function () {
                var chlor = extend(true, {}, source);
                chlor.ability = 'Chlorophyll';

                var rush = extend(true, {}, source);
                rush.ability = 'Sand Rush';

                var swim = extend(true, {}, source);
                swim.ability = 'Swift Swim';

                expect(damage.getFinalSpeed(chlor, weather)).to.equal(chlor.stats.sp * speeds[0]);
                expect(damage.getFinalSpeed(rush, weather)).to.equal(rush.stats.sp * speeds[1]);
                expect(damage.getFinalSpeed(swim, weather)).to.equal(swim.stats.sp * speeds[2]);
            };
        }

        beforeEach(function () {
            source = extend(true, {}, samplePokemon['Kangaskhan-Mega']);
        });

        it('Accounts for Choice Scarf (no ability)', function () {
            source.item = 'Choice Scarf';
            expect(damage.getFinalSpeed(source, '')).to.equal(Math.floor(source.stats.sp * 3 / 2));
        });

        it('Accounts for Macho Brace (no ability)', function () {
            source.item = 'Macho Brace';
            expect(damage.getFinalSpeed(source, '')).to.equal(Math.floor(source.stats.sp * 1 / 2));
        });

        it('Accounts for Iron Ball (no ability)', function () {
            source.item = 'Iron Ball';
            expect(damage.getFinalSpeed(source, '')).to.equal(Math.floor(source.stats.sp * 1 / 2));
        });

        it('Does nothing for Chlorophyll, Sand Rush, and Swift Swim outside of weather', 
            makeCase('', [1, 1, 1]));

        it('Boosts speed for Chlorophyll in Sun', makeCase('Sun', [2, 1, 1]));
        it('Boosts speed for Chlorophyll in Harsh Sun', makeCase('Harsh Sun', [2, 1, 1]));

        it('Boosts speed for Sand Rush in Sand', makeCase('Sand', [1, 2, 1]));

        it('Boosts speed for Swift Swim in Rain', makeCase('Rain', [1, 1, 2]));
        it('Boosts speed for Swift Swim in Heavy Rain', makeCase('Heavy Rain', [1, 1, 2]));
    });

    describe('getMoveEffectiveness works for all types and special cases', function () {
        var typeList = [ 'Normal',   'Fighting', 'Flying', 'Poison',
                         'Ground',   'Rock',     'Bug',    'Ghost',
                         'Steel',    'Fire',     'Water',  'Grass',
                         'Electric', 'Psychic',  'Ice',    'Dragon',
                         'Dark',     'Fairy' ];

        var typeChart = [
            [   1,   1,   1,   1,   1, 0.5,   1,   0, 0.5,   1,   1,   1,   1,   1,   1,   1,   1,   1 ],
            [   2,   1, 0.5, 0.5,   1,   2, 0.5,   0,   2,   1,   1,   1,   1, 0.5,   2,   1,   2, 0.5 ],
            [   1,   2,   1,   1,   1, 0.5,   2,   1, 0.5,   1,   1,   2, 0.5,   1,   1,   1,   1,   1 ],
            [   1,   1,   1, 0.5, 0.5, 0.5,   1, 0.5,   0,   1,   1,   2,   1,   1,   1,   1,   1,   2 ],
            [   1,   1,   0,   2,   1,   2, 0.5,   1,   2,   2,   1, 0.5,   2,   1,   1,   1,   1,   1 ],
            [   1, 0.5,   2,   1, 0.5,   1,   2,   1, 0.5,   2,   1,   1,   1,   1,   2,   1,   1,   1 ],
            [   1, 0.5, 0.5, 0.5,   1,   1,   1, 0.5, 0.5, 0.5,   1,   2,   1,   2,   1,   1,   2, 0.5 ],
            [   0,   1,   1,   1,   1,   1,   1,   2,   1,   1,   1,   1,   1,   2,   1,   1, 0.5,   1 ],
            [   1,   1,   1,   1,   1,   2,   1,   1, 0.5, 0.5, 0.5,   1, 0.5,   1,   2,   1,   1,   2 ],
            [   1,   1,   1,   1,   1, 0.5,   2,   1,   2, 0.5, 0.5,   2,   1,   1,   2, 0.5,   1,   1 ],
            [   1,   1,   1,   1,   2,   2,   1,   1,   1,   2, 0.5, 0.5,   1,   1,   1, 0.5,   1,   1 ],
            [   1,   1, 0.5, 0.5,   2,   2, 0.5,   1, 0.5, 0.5,   2, 0.5,   1,   1,   1, 0.5,   1,   1 ],
            [   1,   1,   2,   1,   0,   1,   1,   1,   1,   1,   2, 0.5, 0.5,   1,   1, 0.5,   1,   1 ],
            [   1,   2,   1,   2,   1,   1,   1,   1, 0.5,   1,   1,   1,   1, 0.5,   1,   1,   0,   1 ],
            [   1,   1,   2,   1,   2,   1,   1,   1, 0.5, 0.5, 0.5,   2,   1,   1, 0.5,   2,   1,   1 ],
            [   1,   1,   1,   1,   1,   1,   1,   1, 0.5,   1,   1,   1,   1,   1,   1,   2,   1,   0 ],
            [   1, 0.5,   1,   1,   1,   1,   1,   2,   1,   1,   1,   1,   1,   2,   1,   1, 0.5, 0.5 ],
            [   1,   2,   1, 0.5,   1,   1,   1,   1, 0.5, 0.5,   1,   1,   1,   1,   1,   2,   2,   1 ],
        ];

        it('All standard cases are properly handled', function () {
            var move = { name: 'Suspicious Odor' };
            var defender;

            for (var i=0; i<typeList.length; i++) {
                move.type = typeList[i];
                for (var j=0; j<typeList.length; j++) {
                    defender = typeList[j];
                    expect(damage.getMoveEffectiveness(move, defender)).to.equal(typeChart[i][j]);
                }
            }
        });

        it('Scrappy and Foresight cases are properly handled', function () {
            var move = { name: 'Spooooky' };
            var defender;
            var ghostTypeChart = JSON.parse(JSON.stringify(typeChart));
            ghostTypeChart[typeList.indexOf('Normal')][typeList.indexOf('Ghost')] = 1;
            ghostTypeChart[typeList.indexOf('Fighting')][typeList.indexOf('Ghost')] = 1;

            for (var i=0; i<typeList.length; i++) {
                move.type = typeList[i];
                for (var j=0; j<typeList.length; j++) {
                    defender = typeList[j];
                    expect(damage.getMoveEffectiveness(move, defender, true)).to.equal(ghostTypeChart[i][j]);
                }
            }
        });

        it('Gravity cases are properly handled', function () {
            var move = { name: 'Compost' };
            var defender;
            var gravityTypeChart = JSON.parse(JSON.stringify(typeChart));
            gravityTypeChart[typeList.indexOf('Ground')][typeList.indexOf('Flying')] = 1;

            for (var i=0; i<typeList.length; i++) {
                move.type = typeList[i];
                for (var j=0; j<typeList.length; j++) {
                    defender = typeList[j];
                    expect(damage.getMoveEffectiveness(move, defender, false, true)).to.equal(gravityTypeChart[i][j]);
                }
            }
        });

        it('Freeze-Dry cases are properly handled', function () {
            var move = { name: 'Freeze-Dry' };
            var defender;
            var freezeDryTypeChart = JSON.parse(JSON.stringify(typeChart));
            // Per Bulbapedia: "If used on a Water-type Pokémon, this move ignores the type effectiveness of this 
            // move's type against Water and treats it as being super effective against Water types instead (even 
            // during Inverse Battles and even if its type is changed)."
            for (var i=0; i<freezeDryTypeChart.length; i++) {
                freezeDryTypeChart[i][typeList.indexOf('Water')] = 2;
            }

            for (var i=0; i<typeList.length; i++) {
                move.type = typeList[i];
                for (var j=0; j<typeList.length; j++) {
                    defender = typeList[j];
                    expect(damage.getMoveEffectiveness(move, defender)).to.equal(freezeDryTypeChart[i][j]);
                }
            }            
        });

        it('Flying Press cases are properly handled', function () {
            var move = { name: 'Flying Press' };
            var fighting = typeList.indexOf('Fighting');
            var flying = typeList.indexOf('Flying');
            var defender;

            for (var j=0; j<typeList.length; j++) {
                defender = typeList[j];
                var expected = typeChart[fighting][j] * typeChart[flying][j];
                expect(damage.getMoveEffectiveness(move, defender)).to.equal(expected);
            }

        })

    });
});