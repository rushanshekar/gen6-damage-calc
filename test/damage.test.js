var fs     = require('fs');
var expect = require('chai').expect;
var extend = require('jquery-extend');
require('blanket');

describe('damage', function() {
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


    before(function () {
        eval(fs.readFileSync('damage.js', 'utf8'));

        // For countBoosts
        eval(fs.readFileSync('stat_data.js', 'utf8'));
        var STATS = STATS_GSC;

        // Turn it into a module definition
        damage = {
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
        'use strict';
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

    describe('checkInfiltrator assigns field side data properly', function () {
        'use strict';
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
        'use strict';
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
        'use strict';
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
        'use strict';
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
        'use strict';
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

    
});