function CALCULATE_DAMAGE_RBY(attacker, defender, move, field) {
    var description = {
        "attackerName": attacker.name,
        "moveName": move.name,
        "defenderName": defender.name
    };
    
    var EMPTY_RESULT = [
        0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0,
        0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0,
        0,0,0,0, 0,0,0
    ];
    if (move.bp === 0) {
        return {"damage":EMPTY_RESULT, "description":buildDescription(description)};
    }
    
    var lv = attacker.level;
    if (move.name === "Seismic Toss" || move.name === "Night Shade") {
        return {"damage":[
                    lv,lv,lv,lv, lv,lv,lv,lv, lv,lv,lv,lv, lv,lv,lv,lv,
                    lv,lv,lv,lv, lv,lv,lv,lv, lv,lv,lv,lv, lv,lv,lv,lv,
                    lv,lv,lv,lv, lv,lv,lv
                ], "description":buildDescription(description)};
    
    var typeEffectiveness = typeChart[move.type][defender.type1] *
            defender.type2 ? typeChart[move.type][defender.type2] : 1;
    
    if (typeEffectiveness === 0) {
        return {"damage":EMPTY_RESULT, "description":buildDescription(description)};
    }
    
    if (move.hits > 1) {
        description.hits = move.hits;
    }
    
    var isPhysical = typeChart[move.type].category === "Physical";
    var attackStat = isPhysical ? AT : SL;
    var defenseStat = isPhysical ? DF : SL;
    var at = attacker.stats[attackStat];
    var df = defender.stats[defenseStat];
    
    if (move.isCrit) {
        lv *= 2;
        description.isCritical = true;
    } else {
        if (attacker.boosts[attackStat] !== 0) {
            at = getModifiedStat(at, attacker.boosts[attackStat]);
            description.attackBoost = attacker.boosts[attackStat];
        }
        if (defender.boosts[defenseStat] !== 0) {
            df = getModifiedStat(df, defender.boosts[defenseStat]);
            description.defenseBoost = defender.boosts[defenseStat];
        }
        if (isPhysical && attacker.status === "Burned") {
            at = Math.floor(at / 2);
            description.isBurned = true;
        }
    }
    
    if (move.name === "Explosion" || move.name === "Selfdestruct") {
        df = Math.floor(df / 2);
    }
    
    if (at > 255 || df > 255) {
        at = Math.floor(at / 4);
        df = Math.floor(df / 4);
    }
    
    if (!move.isCrit) {
        if (isPhysical && field.isReflect) {
            at = Math.floor(at / 4);
            df = Math.floor(df / 2);
            description.isReflect = true;
        } else if (!isPhysical && field.isLightScreen) {
            at = Math.floor(at / 4);
            df = Math.floor(df / 2);
            description.isLightScreen = true;
        }
    }
    
    var baseDamage = Math.min(997, Math.floor(Math.floor(Math.floor(2 * lv / 5 + 2) * Math.max(1, at) * move.bp / Math.max(1, df)) / 50)) + 2;
    if (move.type === attacker.type1 || move.type === attacker.type2) {
        baseDamage = Math.floor(baseDamage * 1.5);
    }
    baseDamage = Math.floor(baseDamage * typeEffectiveness);
    // If baseDamage >= 768, don't apply random factor? I saw this somewhere months ago but now I can't find it :(
    var damage = [];
    for (var i = 217; i <= 255; i++) {
        damage[i-217] = Math.floor(baseDamage * i / 255);
    }
    return {"damage":damage, "description":buildDescription(description)};
}

function getModifiedStat(stat, mod) {
    return mod > 0 ? Math.min(999, Math.floor(stat * (2 + mod) / 2))
            : mod < 0 ? Math.max(1, Math.floor(stat * 2 / (2 - mod)))
            : stat;
}
