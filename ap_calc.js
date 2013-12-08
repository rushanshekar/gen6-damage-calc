var AT = "at", DF = "df", SA = "sa", SD = "sd", SP = "sp";
var STATS = [AT, DF, SA, SD, SP];

// input field validation
var bounds = {
    "level":[0,100],
    "base":[1,255],
    "evs":[0,252],
    "ivs":[0,31],
    "move-bp":[0,250]
};
for (var bounded in bounds) {
    if (bounds.hasOwnProperty(bounded)) {
        attachValidation(bounded, bounds[bounded][0], bounds[bounded][1]);
    }
}
function attachValidation(clazz, min, max) {
    $("." + clazz).keyup(function() {
        validate($(this), min, max);
    });
}

function validate(obj, min, max) {
    obj.val(Math.max(min, Math.min(max, ~~obj.val())));
}

// auto-calc stats and current HP on change
$(".level").keyup(function() {
    var poke = $(this).closest(".poke-info");
    calcHP(poke);
    calcStats(poke);
});
$(".nature").change(function() {
    var poke = $(this).closest(".poke-info");
    calcStats(poke);
});
$(".hp .base, .hp .evs, .hp .ivs").keyup(function() {
    var poke = $(this).closest(".poke-info");
    calcHP(poke);
});
function calcHP(poke) {
    var hp = poke.find(".hp");
    var total;
    var base = ~~hp.find(".base").val();
    if (base === 1) {
        total = 1;
    } else {
        var level = ~~poke.find(".level").val();
        var evs = ~~hp.find(".evs").val();
        var ivs = ~~hp.find(".ivs").val();
        total = Math.floor((base * 2 + ivs + Math.floor(evs / 4)) * level / 100) + level + 10;
    }
    hp.find(".total").text(total);
    poke.find(".max-hp").text(total);
    calcCurrentHP(poke, total, ~~poke.find(".percent-hp").val());
}
for (var i = 0; i < STATS.length; i++) {
    attachStatCalcing(STATS[i]);
}
function attachStatCalcing(stat) {
    $("." + stat + " .base, ." + stat + " .evs, ." + stat + " .ivs").keyup(function() {
        calcStat($(this).closest(".poke-info"), stat);
    });
}
function calcStats(poke) {
    for (var i = 0; i < STATS.length; i++) {
        calcStat(poke, STATS[i]);
    }
}
function calcStat(poke, statName) {
    var stat = poke.find("." + statName);
    var level = ~~poke.find(".level").val();
    var base = ~~stat.find(".base").val();
    var evs = ~~stat.find(".evs").val();
    var ivs = ~~stat.find(".ivs").val();
    var natureMods = NATURES[poke.find(".nature").val()];
    var nature = natureMods[0] === statName ? 1.1 : natureMods[1] === statName ? 0.9 : 1;
    var total = Math.floor((Math.floor((base * 2 + ivs + Math.floor(evs / 4)) * level / 100) + 5) * nature);
    stat.find(".total").text(total);
}
function calcCurrentHP(poke, max, percent) {
    var current = Math.ceil(percent * max / 100);
    poke.find(".current-hp").val(current);
}
function calcPercentHP(poke, max, current) {
    var percent = Math.floor(100 * current / max);
    poke.find(".percent-hp").val(percent);
}
$(".current-hp").keyup(function() {
    var max = $(this).parent().children(".max-hp").text();
    validate($(this), 0, max);
    var current = $(this).val();
    calcPercentHP($(this).parent(), max, current);
});
$(".percent-hp").keyup(function() {
    var max = $(this).parent().children(".max-hp").text();
    validate($(this), 0, 100);
    var percent = $(this).val();
    calcCurrentHP($(this).parent(), max, percent);
});

$(".status").bind("keyup change", function() {
    if ($(this).val() === 'Badly Poisoned') {
        $(this).parent().children(".toxic-counter").show();
    } else {
        $(this).parent().children(".toxic-counter").hide();
    }
});

// auto-update move details on select
$(".move-selector").bind("keyup change", function() {
    var move = MOVES[$(this).val()];
    if (move) {
        $(this).parent().children(".move-bp").val(move[0]);
        $(this).parent().children(".move-type").val(move[1]);
        $(this).parent().children(".move-cat").val(move[2]);
        var isAlwaysCritMove = $(this).val() === 'Frost Breath' || $(this).val() === 'Storm Throw';
        $(this).parent().children(".move-crit").prop("checked", isAlwaysCritMove);
    }
});

// auto-update set details on select
$(".set-selector").bind("keyup change", function() {
    var pokemon = POKEDEX[$(this).val()];
    if (pokemon) {
        var pokeObj = $(this).closest(".poke-info");
        pokeObj.find(".type1").val(pokemon.t1);
        pokeObj.find(".type2").val(pokemon.t2);
        pokeObj.find(".hp .base").val(pokemon.bs.hp);
        for (var i = 0; i < STATS.length; i++) {
            pokeObj.find("." + STATS[i] + " .base").val(pokemon.bs[STATS[i]]);
        }
        pokeObj.find(".weight").val(pokemon.w);
        calcHP(pokeObj);
        calcStats(pokeObj);
    }
});

var resultLocations = [[],[]];
for (var i = 0; i < 4; i++) {
    resultLocations[0].push({
        "move":"#resultMoveL" + (i+1),
        "damage":"#resultDamageL" + (i+1)
    });
    resultLocations[1].push({
        "move":"#resultMoveR" + (i+1),
        "damage":"#resultDamageR" + (i+1)
    });
}

var damageResults;
function calculate() {
    var p1 = new Pokemon($("#p1"));
    var p2 = new Pokemon($("#p2"));
    var field = new Field();
    damageResults = getDamageResults(p1, p2, field);
    var result, minPercent, maxPercent, percentText;
    var highestMaxPercent = -1;
    var bestResult;
    for (var i = 0; i < 4; i++) {
        result = damageResults[0][i];
        minPercent = Math.floor(result.damage[0] * 1000 / p2.maxHP) / 10;
        maxPercent = Math.floor(result.damage[15] * 1000 / p2.maxHP) / 10;
        result.damageText = result.damage[0] + "-" + result.damage[15] + " (" + minPercent + " - " + maxPercent + "%)";
        result.koChanceText = p1.moves[i].bp === 0 ? 'nice move'
                : getKOChanceText(result.damage, p2, field.getSide(1), p1.ability === 'Bad Dreams');
        $(resultLocations[0][i].move + " + label").text(p1.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[0][i].damage).text(minPercent + " - " + maxPercent + "%");
        if (maxPercent > highestMaxPercent) {
            highestMaxPercent = maxPercent;
            bestResult = $(resultLocations[0][i].move);
        }
        
        result = damageResults[1][i];
        minPercent = Math.floor(result.damage[0] * 1000 / p1.maxHP) / 10;
        maxPercent = Math.floor(result.damage[15] * 1000 / p1.maxHP) / 10;
        result.damageText = result.damage[0] + "-" + result.damage[15] + " (" + minPercent + " - " + maxPercent + "%)";
        result.koChanceText = p2.moves[i].bp === 0 ? 'nice move'
                : getKOChanceText(result.damage, p1, field.getSide(0), p2.ability === 'Bad Dreams');
        $(resultLocations[1][i].move + " + label").text(p2.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[1][i].damage).text(minPercent + " - " + maxPercent + "%");
        if (maxPercent > highestMaxPercent) {
            highestMaxPercent = maxPercent;
            bestResult = $(resultLocations[1][i].move);
        }
    }
    bestResult.prop("checked", true);
    bestResult.change();
    $("#resultHeaderL").text(p1.name + "'s Moves (select one to show detailed results)");
    $("#resultHeaderR").text(p2.name + "'s Moves (select one to show detailed results)");
}

$(".result-move").change(function() {
    if (damageResults) {
        var result = findDamageResult($(this));
        if (result) {
            $("#mainResult").text(result.description + ": " + result.damageText + " -- " + result.koChanceText);
            $("#damageValues").text("(" + result.damage.join(", ") + ")");
        }
    }
});

function findDamageResult(resultMoveObj) {
    var selector = "#" + resultMoveObj.attr("id");
    for (var i = 0; i < resultLocations.length; i++) {
        for (var j = 0; j < resultLocations[i].length; j++) {
            if (resultLocations[i][j].move === selector) {
                return damageResults[i][j];
            }
        }
    }
}

function getKOChanceText(damage, defender, field, isBadDreams) {
    if (damage[damage.length-1] === 0) {
        return 'aim for the horn next time';
    }
    if (damage[0] >= defender.maxHP) {
        return 'guaranteed OHKO';
    }
    
    var hazards = 0;
    var hazardText = [];
    if (field.isSR && defender.ability !== 'Magic Guard') {
        var effectiveness = getTypeEffectiveness('Rock', defender.type1) * getTypeEffectiveness('Rock', defender.type2);
        hazards += Math.floor(effectiveness * defender.maxHP / 8);
        hazardText.push('Stealth Rock');
    }
    if ([defender.type1, defender.type2].indexOf('Flying') === -1 &&
            ['Magic Guard', 'Levitate'].indexOf(defender.ability) === -1 && defender.item !== 'Air Balloon') {
        if (field.spikes === 1) {
            hazards += Math.floor(defender.maxHP / 8);
            hazardText.push('1 layer of Spikes');
        } else if (field.spikes === 2) {
            hazards += Math.floor(defender.maxHP / 6);
            hazardText.push('2 layers of Spikes');
        } else if (field.spikes === 3) {
            hazards += Math.floor(defender.maxHP / 4);
            hazardText.push('3 layers of Spikes');
        }
    }
    
    var eot = 0;
    var eotText = [];
    if (field.weather === 'Sun') {
        if (defender.ability === 'Dry Skin' || defender.ability === 'Solar Power') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push(defender.ability + ' damage');
        }
    } else if (field.weather === 'Rain') {
        if (defender.ability === 'Dry Skin') {
            eot += Math.floor(defender.maxHP / 8);
            eotText.push('Dry Skin recovery');
        } else if (defender.ability === 'Rain Dish') {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Rain Dish recovery');
        }
    } else if (field.weather === 'Sand') {
        if (['Rock', 'Ground', 'Steel'].indexOf(defender.type1) === -1 &&
                ['Rock', 'Ground', 'Steel'].indexOf(defender.type2) === -1 &&
                ['Magic Guard', 'Overcoat', 'Sand Force', 'Sand Rush', 'Sand Veil'].indexOf(defender.ability) === -1 &&
                defender.item !== 'Safety Goggles') {
            eot -= Math.floor(defender.maxHP / 16);
            eotText.push('sandstorm damage');
        }
    } else if (field.weather === 'Hail') {
        if (defender.ability === 'Ice Body') {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Ice Body recovery');
        } else if (defender.type1 !== 'Ice' && defender.type2 !== 'Ice' &&
                ['Magic Guard', 'Overcoat', 'Snow Cloak'].indexOf(defender.ability) === -1 &&
                defender.item !== 'Safety Goggles') {
            eot -= Math.floor(defender.maxHP / 16);
            eotText.push('hail damage');
        }
    }
    if (defender.item === 'Leftovers') {
        eot += Math.floor(defender.maxHP / 16);
        eotText.push('Leftovers recovery');
    } else if (defender.item === 'Black Sludge') {
        if (defender.type1 === 'Poison' || defender.type2 === 'Poison') {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Black Sludge recovery');
        } else if (defender.ability !== 'Magic Guard' && defender.ability !== 'Klutz') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push('Black Sludge damage');
        }
    }
    var toxicCounter = 0;
    if (defender.status === 'Poisoned') {
        if (defender.ability === 'Poison Heal') {
            eot += Math.floor(defender.maxHP / 8);
            eotText.push('Poison Heal');
        } else if (defender.ability !== 'Magic Guard') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push('poison damage');
        }
    } else if (defender.status === 'Badly Poisoned') {
        if (defender.ability === 'Poison Heal') {
            eot += Math.floor(defender.maxHP / 8);
            eotText.push('Poison Heal');
        } else if (defender.ability !== 'Magic Guard') {
            eotText.push('toxic damage');
            toxicCounter = defender.toxicCounter;
        }
    } else if (defender.status === 'Burned') {
        if (defender.ability === 'Heatproof') {
            eot -= Math.floor(defender.maxHP / 16);
            eotText.push('reduced burn damage');
        } else if (defender.ability !== 'Magic Guard') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push('burn damage');
        }
    } else if (defender.status === 'Asleep' && isBadDreams && defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxHP / 8);
        eotText.push('Bad Dreams');
    }
    
    var c = getKOChance(damage, defender.maxHP - hazards, 0, 1, defender.maxHP, toxicCounter);
    var afterText = hazardText.length > 0 ? ' after ' + serializeText(hazardText) : '';
    if (c === 1) {
        return 'guaranteed OHKO' + afterText;
    } else if (c > 0) {
        return Math.round(c * 1000) / 10 + '% chance to OHKO' + afterText;
    }
    
    afterText = hazardText.length > 0 || eotText.length > 0 ? ' after ' + serializeText(hazardText.concat(eotText)) : '';
    var i;
    for (i = 2; i <= 4; i++) {
        c = getKOChance(damage, defender.maxHP - hazards, eot, i, defender.maxHP, toxicCounter);
        if (c === 1) {
            return 'guaranteed ' + i + 'HKO' + afterText;
        } else if (c > 0) {
            return Math.round(c * 1000) / 10 + '% chance to ' + i + 'HKO' + afterText;
        }
    }
    
    for (i = 5; i <= 10; i++) {
        if (predictTotal(damage[0], eot, i, toxicCounter, defender.maxHP) >= defender.maxHP - hazards) {
            return 'guaranteed ' + i + 'HKO' + afterText;
        } else if (predictTotal(damage[damage.length-1], eot, i, toxicCounter, defender.maxHP) >= defender.maxHP - hazards) {
            return 'possible ' + i + 'HKO' + afterText;
        }
    }
    
    return 'possibly the worst move ever';
}

function getKOChance(damage, hp, eot, hits, maxHP, toxicCounter) {
    var n = damage.length;
    var minDamage = damage[0];
    var maxDamage = damage[n-1];
    var i;
    if (hits === 1) {
        if (maxDamage < hp) {
            return 0;
        }
        for (i = 0; i < n; i++) {
            if (damage[i] >= hp) {
                return (n-i)/n;
            }
        }
    }
    if (predictTotal(maxDamage, eot, hits, toxicCounter, maxHP) < hp) {
        return 0;
    } else if (predictTotal(minDamage, eot, hits, toxicCounter, maxHP) >= hp) {
        return 1;
    }
    var toxicDamage = 0;
    if (toxicCounter > 0) {
        toxicDamage = Math.floor(toxicCounter * maxHP / 16);
        toxicCounter++;
    }
    var sum = 0;
    for (i = 0; i < n; i++) {
        var c = getKOChance(damage, hp - damage[i] + eot - toxicDamage, eot, hits - 1, maxHP, toxicCounter);
        if (c === 1) {
            sum += (n-i);
            break;
        } else {
            sum += c;
        }
    }
    return sum/n;
}

function predictTotal(damage, eot, hits, toxicCounter, maxHP) {
    var toxicDamage = 0;
    if (toxicCounter > 0) {
        for (var i = 0; i < hits-1; i++) {
            toxicDamage += Math.floor((toxicCounter + i) * maxHP / 16);
        }
    }
    var total = (damage * hits) - (eot * (hits - 1)) + toxicDamage;
    console.log("Predicted for damage " + damage + ", hits " + hits + ": " + total);
    return total;
}

function serializeText(arr) {
    if (arr.length === 0) {
        return '';
    } else if (arr.length === 1) {
        return arr[0];
    } else if (arr.length === 2) {
        return arr[0] + " and " + arr[1];
    } else {
        var text = '';
        for (var i = 0; i < arr.length-1; i++) {
            text += arr[i] + ', ';
        }
        return text + 'and ' + arr[arr.length-1];
    }
}

function Pokemon(pokeInfo) {
    this.name = pokeInfo.find(".set-selector").val();
    this.type1 = pokeInfo.find(".type1").val();
    this.type2 = pokeInfo.find(".type2").val();
    this.level = ~~pokeInfo.find(".level").val();
    this.maxHP = ~~pokeInfo.find(".hp .total").text();
    this.curHP = ~~pokeInfo.find(".current-hp").val();
    this.HPEVs = ~~pokeInfo.find(".hp .evs").val();
    this.rawStats = [];
    this.boosts = [];
    this.stats = [];
    this.evs = [];
    for (var i = 0; i < STATS.length; i++) {
        this.rawStats[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .total").text();
        this.boosts[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .boost").val();
        this.evs[STATS[i]] = ~~pokeInfo.find("." + STATS[i] + " .evs").val();
    }
    this.nature = pokeInfo.find(".nature").val();
    this.ability = pokeInfo.find(".ability").val();
    this.item = pokeInfo.find(".item").val();
    this.status = pokeInfo.find(".status").val();
    this.toxicCounter = this.status === 'Badly Poisoned' ? ~~pokeInfo.find(".toxic-counter").val() : 0;
    this.moves = [
        new Move(pokeInfo.find(".move1")),
        new Move(pokeInfo.find(".move2")),
        new Move(pokeInfo.find(".move3")),
        new Move(pokeInfo.find(".move4"))
    ];
    this.weight = +pokeInfo.find(".weight").val();
}

function Move(moveInfo) {
    this.name = moveInfo.find(".move-selector").val();
    this.bp = ~~moveInfo.find(".move-bp").val();
    this.type = moveInfo.find(".move-type").val();
    this.category = moveInfo.find(".move-cat").val();
    this.isCrit = moveInfo.find(".move-crit").prop("checked");
}

function Field() {
    var format = $("input:radio[name='format']:checked").val();
    var weather = $("input:radio[name='weather']:checked").val();
    var isGravity = $("#gravity").prop("checked");
    var isSR = [$("#srL").prop("checked"), $("#srR").prop("checked")];
    var spikes = [~~$("input:radio[name='spikesL']:checked").val(), ~~$("input:radio[name='spikesR']:checked").val()];
    var isReflect = [$("#reflectL").prop("checked"), $("#reflectR").prop("checked")];
    var isLightScreen = [$("#lightScreenL").prop("checked"), $("#lightScreenR").prop("checked")];
    var isForesight = [$("#foresightL").prop("checked"), $("#foresightR").prop("checked")];
    var isHelpingHand = [$("#helpingHandR").prop("checked"), $("#helpingHandL").prop("checked")]; // affects attacks against opposite side
    
    this.getWeather = function() {
        return weather;
    };
    this.clearWeather = function() {
        weather = "";
    };
    this.getSide = function(i) {
        return new Side(format, weather, isGravity, isSR[i], spikes[i], isReflect[i], isLightScreen[i], isForesight[i], isHelpingHand[i]);
    };
}

function Side(format, weather, isGravity, isSR, spikes, isReflect, isLightScreen, isForesight, isHelpingHand) {
    this.format = format;
    this.weather = weather;
    this.isGravity = isGravity;
    this.isSR = isSR;
    this.spikes = spikes;
    this.isReflect = isReflect;
    this.isLightScreen = isLightScreen;
    this.isForesight = isForesight;
    this.isHelpingHand = isHelpingHand;
}

$(document).ready(function() {
    calcHP($("#p1"));
    calcHP($("#p2"));
    calcStats($("#p1"));
    calcStats($("#p2"));
    $(".status").change();
    $(".calc-trigger").bind("keyup change", calculate);
    calculate();
});
