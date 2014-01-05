var AT = "at", DF = "df", SA = "sa", SD = "sd", SP = "sp";
var STATS = [AT, DF, SA, SD, SP];

// input field validation
var bounds = {
    "level":[0,100],
    "base":[1,255],
    "evs":[0,252],
    "ivs":[0,31],
    "move-bp":[0,999]
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

$(".ability").bind("keyup change", function() {
    $(this).closest(".poke-info").find(".move-hits").val($(this).val() === 'Skill Link' ? 5 : 3);
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
    var moveName = $(this).val();
    var move = moves[moveName] || moves['(No Move)'];
    var moveGroupObj = $(this).parent();
    moveGroupObj.children(".move-bp").val(move.bp);
    moveGroupObj.children(".move-type").val(move.type);
    moveGroupObj.children(".move-cat").val(move.category);
    moveGroupObj.children(".move-crit").prop("checked", move.alwaysCrit === true);
    if (move.isMultiHit) {
        moveGroupObj.children(".move-hits").show();
        moveGroupObj.children(".move-hits").val($(this).closest(".poke-info").find(".ability").val() === 'Skill Link' ? 5 : 3);
    } else {
        moveGroupObj.children(".move-hits").hide();
    }
});

// auto-update set details on select
$(".set-selector").bind("keyup change", function() {
    var fullSetName = $(this).val();
    var pokemonName, setName;
    if (fullSetName.indexOf("(") !== -1) {
        pokemonName = fullSetName.substring(0, fullSetName.indexOf(" ("));
        setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));
    } else {
        pokemonName = fullSetName;
        setName = "Usage";
    }
    var pokemon = pokedex[pokemonName];
    if (pokemon) {
        var pokeObj = $(this).closest(".poke-info");
        pokeObj.find(".type1").val(pokemon.t1);
        pokeObj.find(".type2").val(pokemon.t2);
        pokeObj.find(".hp .base").val(pokemon.bs.hp);
        var i;
        for (i = 0; i < STATS.length; i++) {
            pokeObj.find("." + STATS[i] + " .base").val(pokemon.bs[STATS[i]]);
        }
        pokeObj.find(".weight").val(pokemon.w);
        pokeObj.find(".boost").val(0);
        pokeObj.find(".percent-hp").val(100);
        pokeObj.find(".status").val("Healthy");
        $(".status").change();
        var moveObj;
        if (pokemonName in setdex && setName in setdex[pokemonName]) {
            var set = setdex[pokemonName][setName];
            pokeObj.find(".level").val(set.level);
            pokeObj.find(".hp .evs").val((set.evs && typeof set.evs.hp !== "undefined") ? set.evs.hp : 0);
            pokeObj.find(".hp .ivs").val((set.ivs && typeof set.ivs.hp !== "undefined") ? set.ivs.hp : 31);
            for (i = 0; i < STATS.length; i++) {
                pokeObj.find("." + STATS[i] + " .evs").val((set.evs && typeof set.evs[STATS[i]] !== "undefined") ? set.evs[STATS[i]] : 0);
                pokeObj.find("." + STATS[i] + " .ivs").val((set.ivs && typeof set.ivs[STATS[i]] !== "undefined") ? set.ivs[STATS[i]] : 31);
            }
            setSelectValueIfValid(pokeObj.find(".nature"), set.nature, "");
            setSelectValueIfValid(pokeObj.find(".ability"), pokemon.ab ? pokemon.ab : set.ability, "");
            setSelectValueIfValid(pokeObj.find(".item"), set.item, "");
            for (i = 0; i < 4; i++) {
                moveObj = pokeObj.find(".move" + (i+1) + " .move-selector");
                setSelectValueIfValid(moveObj, set.moves[i], "(No Move)");
                moveObj.change();
            }
        } else {
            pokeObj.find(".level").val(100);
            pokeObj.find(".hp .evs").val(0);
            pokeObj.find(".hp .ivs").val(31);
            for (i = 0; i < STATS.length; i++) {
                pokeObj.find("." + STATS[i] + " .evs").val(0);
                pokeObj.find("." + STATS[i] + " .ivs").val(31);
            }
            pokeObj.find(".nature").val("Hardy");
            setSelectValueIfValid(pokeObj.find(".ability"), pokemon.ab, "");
            pokeObj.find(".item").val("");
            for (i = 0; i < 4; i++) {
                moveObj = pokeObj.find(".move" + (i+1) + " .move-selector");
                moveObj.val("(No Move)");
                moveObj.change();
            }
        }
        calcHP(pokeObj);
        calcStats(pokeObj);
    }
});

function setSelectValueIfValid(select, value, fallback) {
    select.val(select.children("option[value='" + value + "']").length !== 0 ? value : fallback);
}

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
    var result, minDamage, maxDamage, minPercent, maxPercent, percentText;
    var highestMaxPercent = -1;
    var bestResult;
    for (var i = 0; i < 4; i++) {
        result = damageResults[0][i];
        minDamage = result.damage[0] * p1.moves[i].hits;
        maxDamage = result.damage[15] * p1.moves[i].hits;
        minPercent = Math.floor(minDamage * 1000 / p2.maxHP) / 10;
        maxPercent = Math.floor(maxDamage * 1000 / p2.maxHP) / 10;
        result.damageText = minDamage + "-" + maxDamage + " (" + minPercent + " - " + maxPercent + "%)";
        result.koChanceText = p1.moves[i].bp === 0 ? 'nice move'
                : getKOChanceText(result.damage, p2, field.getSide(1), p1.moves[i].hits, p1.ability === 'Bad Dreams');
        $(resultLocations[0][i].move + " + label").text(p1.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[0][i].damage).text(minPercent + " - " + maxPercent + "%");
        if (maxPercent > highestMaxPercent) {
            highestMaxPercent = maxPercent;
            bestResult = $(resultLocations[0][i].move);
        }
        
        result = damageResults[1][i];
        minDamage = result.damage[0] * p2.moves[i].hits;
        maxDamage = result.damage[15] * p2.moves[i].hits;
        minPercent = Math.floor(minDamage * 1000 / p1.maxHP) / 10;
        maxPercent = Math.floor(maxDamage * 1000 / p1.maxHP) / 10;
        result.damageText = minDamage + "-" + maxDamage + " (" + minPercent + " - " + maxPercent + "%)";
        result.koChanceText = p2.moves[i].bp === 0 ? 'nice move'
                : getKOChanceText(result.damage, p1, field.getSide(0), p2.moves[i].hits, p2.ability === 'Bad Dreams');
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

function getKOChanceText(damage, defender, field, hits, isBadDreams) {
    if (isNaN(damage[0])) {
        return 'something broke; please tell Honko';
    }
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
    
    // multi-hit moves have too many possibilities for brute-forcing to work, so reduce it to a 16-point distribution
    var qualifier = '';
    if (hits > 1) {
        qualifier = 'approx. ';
        console.log("Reducing " + hits + " hits for " + damage);
        damage = getDistribution(damage, hits);
        console.log("Reduced to " + damage);
    }
    
    var c = getKOChance(damage, defender.maxHP - hazards, 0, 1, defender.maxHP, toxicCounter);
    var afterText = hazardText.length > 0 ? ' after ' + serializeText(hazardText) : '';
    if (c === 1) {
        return 'guaranteed OHKO' + afterText;
    } else if (c > 0) {
        return qualifier + Math.round(c * 1000) / 10 + '% chance to OHKO' + afterText;
    }
    
    afterText = hazardText.length > 0 || eotText.length > 0 ? ' after ' + serializeText(hazardText.concat(eotText)) : '';
    var i;
    for (i = 2; i <= 4; i++) {
        c = getKOChance(damage, defender.maxHP - hazards, eot, i, defender.maxHP, toxicCounter);
        if (c === 1) {
            return 'guaranteed ' + i + 'HKO' + afterText;
        } else if (c > 0) {
            return qualifier + Math.round(c * 1000) / 10 + '% chance to ' + i + 'HKO' + afterText;
        }
    }
    
    for (i = 5; i <= 9; i++) {
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
//    console.log("Predicted for damage " + damage + ", hits " + hits + ": " + total);
    return total;
}

function getDistribution(d, h) {
    if (h === 2) {
        return [
            d[0]*h, squash(d,1,4,h), squash(d,2,5,h), squash(d,3,6,h),
            squash(d,4,7,h), squash(d,5,7,h), squash(d,5,8,h), squash(d,6,8,h),
            squash(d,7,9,h), squash(d,7,10,h), squash(d,8,10,h), squash(d,8,11,h),
            squash(d,9,12,h), squash(d,10,13,h), squash(d,11,14,h), d[15]*h
        ];
    } else {
        return [
            d[0]*h, squash(d,1,7,h), squash(d,3,7,h), squash(d,4,7,h),
            squash(d,5,7,h), squash(d,5,8,h), squash(d,5,9,h), squash(d,6,9,h),
            squash(d,6,9,h), squash(d,6,10,h), squash(d,7,10,h), squash(d,8,10,h),
            squash(d,8,11,h), squash(d,8,12,h), squash(d,8,14,h), d[15]*h
        ];
    }
}

function squash(arr, startIndex, endIndex, multiplier) {
    var sum = 0;
    for (var i = startIndex; i <= endIndex; i++) {
        sum += arr[i];
    }
    return Math.round(sum * multiplier / (1 + endIndex - startIndex));
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
    var setName = pokeInfo.find(".set-selector").val();
    if (setName.indexOf("(") === -1) {
        this.name = setName;
    } else {
        this.name = setName.substring(0, setName.indexOf(" ("));
    }
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
        getMoveDetails(pokeInfo.find(".move1")),
        getMoveDetails(pokeInfo.find(".move2")),
        getMoveDetails(pokeInfo.find(".move3")),
        getMoveDetails(pokeInfo.find(".move4"))
    ];
    this.weight = +pokeInfo.find(".weight").val();
}

function getMoveDetails(moveInfo) {
    var moveName = moveInfo.find(".move-selector").val();
    var defaultDetails = moves[moveName];
    return $.extend({}, defaultDetails, {
        name: moveName,
        bp: ~~moveInfo.find(".move-bp").val(),
        type: moveInfo.find(".move-type").val(),
        category: moveInfo.find(".move-cat").val(),
        isCrit: moveInfo.find(".move-crit").prop("checked"),
        hits: defaultDetails.isMultiHit ? ~~moveInfo.find(".move-hits").val() : defaultDetails.isTwoHit ? 2 : 1
    });
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

var gen, pokedex, setdex, typeChart, moves, abilities, items;

$(".gen").change(function () {
    gen = ~~$(this).val();
    switch (gen) {
        case 1:
            pokedex = POKEDEX_RBY;
            setdex = SETDEX_XY;
            typeChart = TYPE_CHART_RBY;
            moves = MOVES_RBY;
            items = [];
            abilities = [];
            break;
        case 2:
            pokedex = POKEDEX_GSC;
            setdex = SETDEX_XY;
            typeChart = TYPE_CHART_GSC;
            moves = MOVES_GSC;
            items = ITEMS_GSC;
            abilities = [];
            break;
        case 3:
            pokedex = POKEDEX_ADV;
            setdex = SETDEX_XY;
            typeChart = TYPE_CHART_GSC;
            moves = MOVES_ADV;
            items = ITEMS_ADV;
            abilities = ABILITIES_ADV;
            break;
        case 4:
            pokedex = POKEDEX_DPP;
            setdex = SETDEX_XY;
            typeChart = TYPE_CHART_GSC;
            moves = MOVES_DPP;
            items = ITEMS_DPP;
            abilities = ABILITIES_DPP;
            break;
        case 5:
            pokedex = POKEDEX_BW;
            setdex = SETDEX_BW;
            typeChart = TYPE_CHART_GSC;
            moves = MOVES_BW;
            items = ITEMS_BW;
            abilities = ABILITIES_BW;
            break;
        default:
            pokedex = POKEDEX_XY;
            setdex = SETDEX_XY;
            typeChart = TYPE_CHART_XY;
            moves = MOVES_XY;
            items = ITEMS_XY;
            abilities = ABILITIES_XY;
    }
    var setOptions = getSetOptions();
    $("select.set-selector").find("option").remove().end().append(setOptions);
    var typeOptions = getSelectOptions(Object.keys(typeChart));
    $("select.type1, select.move-type").find("option").remove().end().append(typeOptions);
    $("select.type2").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
    var moveOptions = getSelectOptions(Object.keys(moves), true);
    $("select.move-selector").find("option").remove().end().append(moveOptions);
    var abilityOptions = getSelectOptions(abilities, true);
    $("select.ability").find("option").remove().end().append("<option value=\"\">(other)</option>" + abilityOptions);
    var itemOptions = getSelectOptions(items, true);
    $("select.item").find("option").remove().end().append("<option value=\"\">(none)</option>" + itemOptions);
    $(".set-selector").change();
});

function getSetOptions() {
    var pokeOptions = Object.keys(pokedex);
    pokeOptions.sort();
    var r = '';
    for (var i = 0; i < pokeOptions.length; i++) {
        var pokemon = pokeOptions[i];
        if (pokemon in setdex) {
            var setOptions = Object.keys(setdex[pokemon]);
            for (var j = 0; j < setOptions.length; j++) {
                var setOptionName = pokemon + (setOptions[j] === 'Usage' ? '' : ' (' + setOptions[j] + ')');
                r += '<option value="' + setOptionName + '">' + setOptionName + '</option>';
            }
        } else {
            r += '<option value="' + pokemon + '">' + pokemon + '</option>';
        }
    }
    return r;
}

function getSelectOptions(arr, sort) {
    if (sort) {
        arr.sort();
    }
    var r = '';
    for (var i = 0; i < arr.length; i++) {
        r += '<option value="' + arr[i] + '">' + arr[i] + '</option>';
    }
    return r;
}

$(document).ready(function() {
    $("#gen6").prop("checked", true);
    $("#gen6").change();
    $("input.calc-trigger").bind("keyup", calculate);
    $("select.calc-trigger").bind("change keyup", calculate);
    calculate();
});
