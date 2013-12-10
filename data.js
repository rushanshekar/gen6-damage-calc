function getTypeEffectiveness(attackType, targetType) {
    switch (attackType) {
        case 'Normal':
            return ['Rock', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 'Ghost' === targetType ? 0
                    : 1;
        case 'Grass':
            return ['Water', 'Ground', 'Rock'].indexOf(targetType) !== -1 ? 2
                    : ['Grass', 'Fire', 'Flying', 'Bug', 'Poison', 'Dragon', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Fire':
            return ['Grass', 'Ice', 'Bug', 'Steel'].indexOf(targetType) !== -1 ? 2
                    : ['Fire', 'Water', 'Rock', 'Dragon'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Water':
            return ['Fire', 'Ground', 'Rock'].indexOf(targetType) !== -1 ? 2
                    : ['Grass', 'Water', 'Dragon'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Electric':
            return ['Water', 'Flying'].indexOf(targetType) !== -1 ? 2
                    : ['Grass', 'Electric', 'Dragon'].indexOf(targetType) !== -1 ? 0.5
                    : 'Ground' === targetType ? 0
                    : 1;
        case 'Ice':
            return ['Grass', 'Flying', 'Ground', 'Dragon'].indexOf(targetType) !== -1 ? 2
                    : ['Fire', 'Water', 'Ice', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Flying':
            return ['Grass', 'Bug', 'Fighting'].indexOf(targetType) !== -1 ? 2
                    : ['Electric', 'Rock', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Bug':
            return ['Grass', 'Psychic', 'Dark'].indexOf(targetType) !== -1 ? 2
                    : ['Fire', 'Flying', 'Poison', 'Fighting', 'Ghost', 'Steel', 'Fairy'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Poison':
            return ['Grass', 'Fairy'].indexOf(targetType) !== -1 ? 2
                    : ['Poison', 'Ground', 'Rock', 'Ghost'].indexOf(targetType) !== -1 ? 0.5
                    : 'Steel' === targetType ? 0
                    : 1;
        case 'Ground':
            return ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'].indexOf(targetType) !== -1 ? 2
                    : ['Grass', 'Bug'].indexOf(targetType) !== -1 ? 0.5
                    : 'Flying' === targetType ? 0
                    : 1;
        case 'Rock':
            return ['Fire', 'Ice', 'Flying', 'Bug'].indexOf(targetType) !== -1 ? 2
                    : ['Ground', 'Fighting', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Fighting':
            return ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'].indexOf(targetType) !== -1 ? 2
                    : ['Flying', 'Bug', 'Poison', 'Psychic', 'Fairy'].indexOf(targetType) !== -1 ? 0.5
                    : 'Ghost' === targetType ? 0
                    : 1;
        case 'Psychic':
            return ['Poison', 'Fighting'].indexOf(targetType) !== -1 ? 2
                    : ['Psychic', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 'Dark' === targetType ? 0
                    : 1;
        case 'Ghost':
            return ['Psychic', 'Ghost'].indexOf(targetType) !== -1 ? 2
                    : 'Dark' === targetType ? 0.5
                    : 'Normal' === targetType ? 0
                    : 1;
        case 'Dragon':
            return 'Dragon' === targetType ? 2
                    : 'Steel' === targetType ? 0.5
                    : 'Fairy' === targetType ? 0
                    : 1;
        case 'Dark':
            return ['Psychic', 'Ghost'].indexOf(targetType) !== -1 ? 2
                    : ['Fighting', 'Dark', 'Fairy'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Steel':
            return ['Ice', 'Rock', 'Fairy'].indexOf(targetType) !== -1 ? 2
                    : ['Fire', 'Water', 'Electric', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        case 'Fairy':
            return ['Fighting', 'Dragon', 'Dark'].indexOf(targetType) !== -1 ? 2
                    : ['Fire', 'Poison', 'Steel'].indexOf(targetType) !== -1 ? 0.5
                    : 1;
        default:
            return 1;
    }
}

function getItemBoostType(item) {
    switch (item) {
        case 'Draco Plate':
        case 'Dragon Fang':
            return 'Dragon';
        case 'Dread Plate':
        case 'Black Glasses':
            return 'Dark';
        case 'Earth Plate':
        case 'Soft Sand':
            return 'Ground';
        case 'Fist Plate':
        case 'Black Belt':
            return 'Fighting';
        case 'Flame Plate':
        case 'Charcoal':
            return 'Fire';
        case 'Icicle Plate':
        case 'Never-Melt Ice':
            return 'Ice';
        case 'Insect Plate':
        case 'Silver Powder':
            return 'Bug';
        case 'Iron Plate':
        case 'Metal Coat':
            return 'Steel';
        case 'Meadow Plate':
        case 'Rose Incense':
        case 'Miracle Seed':
            return 'Grass';
        case 'Mind Plate':
        case 'Odd Incense':
        case 'Twisted Spoon':
            return 'Psychic';
        case 'Pixie Plate':
            return 'Fairy';
        case 'Sky Plate':
        case 'Sharp Beak':
            return 'Flying';
        case 'Splash Plate':
        case 'Sea Incense':
        case 'Wave Incense':
        case 'Mystic Water':
            return 'Water';
        case 'Spooky Plate':
        case 'Spell Tag':
            return 'Ghost';
        case 'Stone Plate':
        case 'Rock Incense':
        case 'Hard Stone':
            return 'Rock';
        case 'Toxic Plate':
        case 'Poison Barb':
            return 'Poison';
        case 'Zap Plate':
        case 'Magnet':
            return 'Electric';
        case 'Silk Scarf':
            return 'Normal';
        default:
            return '';
    }
}

function getBerryResistType(berry) {
    switch (berry) {
        case 'Chilan Berry':
            return 'Normal';
        case 'Occa Berry':
            return 'Fire';
        case 'Passho Berry':
            return 'Water';
        case 'Wacan Berry':
            return 'Electric';
        case 'Rindo Berry':
            return 'Grass';
        case 'Yache Berry':
            return 'Ice';
        case 'Chople Berry':
            return 'Fighting';
        case 'Kebia Berry':
            return 'Poison';
        case 'Shuca Berry':
            return 'Ground';
        case 'Coba Berry':
            return 'Flying';
        case 'Payapa Berry':
            return 'Psychic';
        case 'Tanga Berry':
            return 'Bug';
        case 'Charti Berry':
            return 'Rock';
        case 'Kasib Berry':
            return 'Ghost';
        case 'Haban Berry':
            return 'Dragon';
        case 'Colbur Berry':
            return 'Dark';
        case 'Babiri Berry':
            return 'Steel';
        case 'Roseli Berry':
            return 'Fairy';
        default:
            return '';
    }
}

function getFlingPower(item) {
    return item === 'Iron Ball' ? 130
        : item === 'Hard Stone' ? 100
        : item.indexOf('Plate') !== -1 || ['Deep Sea Tooth','Thick Club'].indexOf(item) !== -1 ? 90
        : ['Assault Vest','Weakness Policy'].indexOf(item) !== -1 ? 80
        : ['Poison Barb','Dragon Fang'].indexOf(item) !== -1 ? 70
        : ['Adamant Orb','Lustrous Orb','Macho Brace','Stick'].indexOf(item) !== -1 ? 60
        : item === 'Sharp Beak' ? 50
        : item === 'Eviolite' ? 40
        : ['Black Belt','Black Sludge','Black Glasses','Charcoal','Deep Sea Scale','Flame Orb',"King's Rock",
            'Life Orb','Light Ball','Magnet','Metal Coat','Miracle Seed','Mystic Water','Never-Melt Ice',
            'Razor Fang','Soul Dew','Spell Tag','Toxic Orb','Twisted Spoon'].indexOf(item) !== -1 ? 30
        : 10;
}

function getNaturalGift(item) {
    var gift = {
        'Apicot Berry' : {'t':'Ground','p':100},
        'Babiri Berry' : {'t':'Steel','p':80},
        'Belue Berry' : {'t':'Electric','p':100},
        'Charti Berry' : {'t':'Rock','p':80},
        'Chesto Berry' : {'t':'Water','p':80},
        'Chilan Berry' : {'t':'Normal','p':80},
        'Chople Berry' : {'t':'Fighting','p':80},
        'Coba Berry' : {'t':'Flying','p':80},
        'Colbur Berry' : {'t':'Dark','p':80},
        'Custap Berry' : {'t':'Ghost','p':100},
        'Durin Berry' : {'t':'Water','p':100},
        'Enigma Berry' : {'t':'Bug','p':100},
        'Ganlon Berry' : {'t':'Ice','p':100},
        'Haban Berry' : {'t':'Dragon','p':80},
        'Jaboca Berry' : {'t':'Dragon','p':100},
        'Kasib Berry' : {'t':'Ghost','p':80},
        'Kebia Berry' : {'t':'Poison','p':80},
        'Kee Berry' : {'t':'Fairy','p':100},
        'Lansat Berry' : {'t':'Flying','p':100},
        'Leppa Berry' : {'t':'Fighting','p':80},
        'Liechi Berry' : {'t':'Grass','p':100},
        'Lum Berry' : {'t':'Flying','p':80},
        'Maranga Berry' : {'t':'Dark','p':100},
        'Micle Berry' : {'t':'Rock','p':100},
        'Occa Berry' : {'t':'Fire','p':80},
        'Oran Berry' : {'t':'Poison','p':80},
        'Passho Berry' : {'t':'Water','p':80},
        'Payapa Berry' : {'t':'Psychic','p':80},
        'Petaya Berry' : {'t':'Poison','p':100},
        'Rawst Berry' : {'t':'Grass','p':80},
        'Rindo Berry' : {'t':'Grass','p':80},
        'Roseli Berry' : {'t':'Fairy','p':80},
        'Rowap Berry' : {'t':'Dark','p':100},
        'Salac Berry' : {'t':'Fighting','p':100},
        'Shuca Berry' : {'t':'Ground','p':80},
        'Sitrus Berry' : {'t':'Psychic','p':80},
        'Starf Berry' : {'t':'Psychic','p':100},
        'Tanga Berry' : {'t':'Bug','p':80},
        'Wacan Berry' : {'t':'Electric','p':80},
        'Watmel Berry' : {'t':'Fire','p':100},
        'Yache Berry' : {'t':'Ice','p':80}
    }[item];
    return gift ? gift : {'t':'Normal','p':1};
}

var NATURES = {
    'Adamant':['at','sa'],
    'Bashful':['',''],
    'Bold':['df','at'],
    'Brave':['at','sp'],
    'Calm':['sd','at'],
    'Careful':['sd','sa'],
    'Docile':['',''],
    'Gentle':['sd','df'],
    'Hardy':['',''],
    'Hasty':['sp','df'],
    'Impish':['df','sa'],
    'Jolly':['sp','sa'],
    'Lax':['df','sd'],
    'Lonely':['at','df'],
    'Mild':['sa','df'],
    'Modest':['sa','at'],
    'Naive':['sp','sd'],
    'Naughty':['at','sd'],
    'Quiet':['sa','sp'],
    'Quirky':['',''],
    'Rash':['sa','sd'],
    'Relaxed':['df','sp'],
    'Sassy':['sd','sp'],
    'Serious':['',''],
    'Timid':['sp','at']
};

var MOVES = {
    'Acid Spray':[40,'Poison','Special'],
    'Acrobatics':[55,'Flying','Physical'],
    'Aerial Ace':[60,'Flying','Physical'],
    'Aeroblast':[100,'Flying','Special'],
    'Air Cutter':[60,'Flying','Special'],
    'Air Slash':[75,'Flying','Special'],
    'Ancient Power':[60,'Rock','Special'],
    'Aqua Jet':[40,'Water','Physical'],
    'Aqua Tail':[90,'Water','Physical'],
    'Arm Thrust':[15,'Fighting','Physical'],
    'Assurance':[60,'Dark','Physical'],
    'Attack Order':[90,'Bug','Physical'],
    'Aura Sphere':[80,'Fighting','Special'],
    'Avalanche':[120,'Ice','Physical'],
    'Bite':[60,'Dark','Physical'],
    'Blaze Kick':[85,'Fire','Physical'],
    'Blizzard':[110,'Ice','Special'],
    'Blue Flare':[130,'Fire','Special'],
    'Body Slam':[85,'Normal','Physical'],
    'Bolt Strike':[130,'Electric','Physical'],
    'Bonemerang':[50,'Ground','Physical'],
    'Boomburst':[140,'Normal','Special'],
    'Bounce':[85,'Flying','Physical'],
    'Brave Bird':[120,'Flying','Physical'],
    'Brick Break':[75,'Fighting','Physical'],
    'Bug Bite':[60,'Bug','Physical'],
    'Bug Buzz':[90,'Bug','Special'],
    'Bulldoze':[60,'Ground','Physical'],
    'Bullet Punch':[40,'Steel','Physical'],
    'Bullet Seed':[25,'Grass','Physical'],
    'Charge Beam':[50,'Electric','Special'],
    'Chatter':[65,'Flying','Special'],
    'Circle Throw':[60,'Fighting','Physical'],
    'Clear Smog':[50,'Poison','Special'],
    'Close Combat':[120,'Fighting','Physical'],
    'Crabhammer':[100,'Water','Physical'],
    'Cross Chop':[100,'Fighting','Physical'],
    'Cross Poison':[70,'Poison','Physical'],
    'Crunch':[80,'Dark','Physical'],
    'Dark Pulse':[80,'Dark','Special'],
    'Dazzling Gleam':[80,'Fairy','Special'],
    'Discharge':[80,'Electric','Special'],
    'Doom Desire':[140,'Steel','Special'],
    'Double Hit':[35,'Normal','Physical'],
    'Double-Edge':[120,'Normal','Physical'],
    'Draco Meteor':[130,'Dragon','Special'],
    'Dragon Claw':[80,'Dragon','Physical'],
    'Dragon Pulse':[85,'Dragon','Special'],
    'Dragon Rush':[100,'Dragon','Physical'],
    'Dragon Tail':[60,'Dragon','Physical'],
    'Drain Punch':[75,'Fighting','Physical'],
    'Drill Peck':[80,'Flying','Physical'],
    'Drill Run':[80,'Ground','Physical'],
    'Dual Chop':[40,'Dragon','Physical'],
    'Dynamic Punch':[100,'Fighting','Physical'],
    'Earth Power':[90,'Ground','Special'],
    'Earthquake':[100,'Ground','Physical'],
    'Electro Ball':[1,'Electric','Special'],
    'Energy Ball':[90,'Grass','Special'],
    'Eruption':[150,'Fire','Special'],
    'Explosion':[250,'Normal','Physical'],
    'Extrasensory':[80,'Psychic','Special'],
    'Extreme Speed':[80,'Normal','Physical'],
    'Facade':[70,'Normal','Physical'],
    'Fake Out':[40,'Normal','Physical'],
    'Feint':[30,'Normal','Physical'],
    'Feint Attack':[60,'Dark','Physical'],
    'Fiery Dance':[80,'Fire','Special'],
    'Fire Blast':[110,'Fire','Special'],
    'Fire Fang':[65,'Fire','Physical'],
    'Fire Punch':[75,'Fire','Physical'],
    'Flame Charge':[50,'Fire','Physical'],
    'Flame Wheel':[60,'Fire','Physical'],
    'Flamethrower':[90,'Fire','Special'],
    'Flare Blitz':[120,'Fire','Physical'],
    'Flash Cannon':[80,'Steel','Special'],
    'Fling':[1,'Dark','Physical'],
    'Flying Press':[80,'Fighting','Physical'],
    'Focus Blast':[120,'Fighting','Special'],
    'Focus Punch':[150,'Fighting','Physical'],
    'Force Palm':[60,'Fighting','Physical'],
    'Foul Play':[95,'Dark','Physical'],
    'Freeze Dry':[70,'Ice','Special'],
    'Freeze Shock':[140,'Ice','Physical'],
    'Frost Breath':[60,'Ice','Special'],
    'Frustration':[102,'Normal','Physical'],
    'Fusion Bolt':[100,'Electric','Physical'],
    'Fusion Flare':[100,'Fire','Special'],
    'Gear Grind':[50,'Steel','Physical'],
    'Giga Drain':[75,'Grass','Special'],
    'Giga Impact':[150,'Normal','Physical'],
    'Glaciate':[65,'Ice','Special'],
    'Grass Knot':[1,'Grass','Special'],
    'Gunk Shot':[120,'Poison','Physical'],
    'Gyro Ball':[1,'Steel','Physical'],
    'Hammer Arm':[100,'Fighting','Physical'],
    'Head Charge':[120,'Normal','Physical'],
    'Head Smash':[150,'Rock','Physical'],
    'Headbutt':[70,'Normal','Physical'],
    'Heat Wave':[95,'Fire','Special'],
    'Heavy Slam':[1,'Steel','Physical'],
    'Hex':[65,'Ghost','Special'],
    'Hidden Power Bug':[60,'Bug','Special'],
    'Hidden Power Dark':[60,'Dark','Special'],
    'Hidden Power Dragon':[60,'Dragon','Special'],
    'Hidden Power Electric':[60,'Electric','Special'],
    'Hidden Power Fighting':[60,'Fighting','Special'],
    'Hidden Power Fire':[60,'Fire','Special'],
    'Hidden Power Flying':[60,'Flying','Special'],
    'Hidden Power Ghost':[60,'Ghost','Special'],
    'Hidden Power Grass':[60,'Grass','Special'],
    'Hidden Power Ground':[60,'Ground','Special'],
    'Hidden Power Ice':[60,'Ice','Special'],
    'Hidden Power Poison':[60,'Poison','Special'],
    'Hidden Power Psychic':[60,'Psychic','Special'],
    'Hidden Power Rock':[60,'Rock','Special'],
    'Hidden Power Steel':[60,'Steel','Special'],
    'Hidden Power Water':[60,'Water','Special'],
    'High Jump Kick':[130,'Fighting','Physical'],
    'Horn Leech':[75,'Grass','Physical'],
    'Hurricane':[110,'Flying','Special'],
    'Hydro Pump':[110,'Water','Special'],
    'Hyper Beam':[150,'Normal','Special'],
    'Hyper Voice':[90,'Normal','Special'],
    'Ice Beam':[90,'Ice','Special'],
    'Ice Fang':[65,'Ice','Physical'],
    'Ice Punch':[75,'Ice','Physical'],
    'Ice Shard':[40,'Ice','Physical'],
    'Icicle Crash':[85,'Ice','Physical'],
    'Icicle Spear':[25,'Ice','Physical'],
    'Icy Wind':[55,'Ice','Special'],
    'Incinerate':[60,'Fire','Special'],
    'Iron Head':[80,'Steel','Physical'],
    'Iron Tail':[100,'Steel','Physical'],
    'Judgment':[100,'Normal','Special'],
    'Jump Kick':[100,'Fighting','Physical'],
    'Knock Off':[65,'Dark','Physical'],
    'Lava Plume':[80,'Fire','Special'],
    'Leaf Blade':[90,'Grass','Physical'],
    'Leaf Storm':[130,'Grass','Special'],
    'Low Kick':[1,'Fighting','Physical'],
    'Low Sweep':[65,'Fighting','Physical'],
    'Mach Punch':[40,'Fighting','Physical'],
    'Magma Storm':[120,'Fire','Special'],
    'Megahorn':[120,'Bug','Physical'],
    'Meteor Mash':[90,'Steel','Physical'],
    'Moonblast':[95,'Fairy','Special'],
    'Muddy Water':[90,'Water','Special'],
    'Natural Gift':[1,'Normal','Physical'],
    'Nature Power':[80,'Normal','Special'],
    'Night Daze':[85,'Dark','Special'],
    'Night Shade':[100,'Ghost','Special'],
    'Night Slash':[70,'Dark','Physical'],
    'Oblivion Wing':[80,'Flying','Special'],
    'Outrage':[120,'Dragon','Physical'],
    'Overheat':[130,'Fire','Special'],
    'Payback':[50,'Dark','Physical'],
    'Petal Dance':[120,'Grass','Special'],
    'Pin Missile':[25,'Bug','Physical'],
    'Play Rough':[90,'Fairy','Physical'],
    'Pluck':[60,'Flying','Physical'],
    'Poison Jab':[80,'Poison','Physical'],
    'Power Gem':[80,'Rock','Special'],
    'Power Whip':[120,'Grass','Physical'],
    'Power-Up Punch':[40,'Fighting','Physical'],
    'Psychic':[90,'Psychic','Special'],
    'Psycho Boost':[140,'Psychic','Special'],
    'Psycho Cut':[70,'Psychic','Physical'],
    'Psyshock':[80,'Psychic','Special'],
    'Psystrike':[100,'Psychic','Special'],
    'Punishment':[60,'Dark','Physical'],
    'Pursuit':[40,'Dark','Physical'],
    'Quick Attack':[40,'Normal','Physical'],
    'Rapid Spin':[20,'Normal','Physical'],
    'Razor Shell':[75,'Water','Physical'],
    'Relic Song':[75,'Normal','Special'],
    'Retaliate':[70,'Normal','Physical'],
    'Return':[102,'Normal','Physical'],
    'Revenge':[120,'Fighting','Physical'],
    'Reversal':[1,'Fighting','Physical'],
    'Rock Blast':[25,'Rock','Physical'],
    'Rock Climb':[90,'Normal','Physical'],
    'Rock Slide':[75,'Rock','Physical'],
    'Rock Smash':[40,'Fighting','Physical'],
    'Sacred Fire':[100,'Fire','Physical'],
    'Sacred Sword':[90,'Fighting','Physical'],
    'Scald':[80,'Water','Special'],
    'Searing Shot':[100,'Fire','Special'],
    'Secret Sword':[85,'Fighting','Special'],
    'Seed Bomb':[80,'Grass','Physical'],
    'Seed Flare':[120,'Grass','Special'],
    'Seismic Toss':[100,'Fighting','Physical'],
    'Self-Destruct':[200,'Normal','Physical'],
    'Shadow Ball':[80,'Ghost','Special'],
    'Shadow Claw':[70,'Ghost','Physical'],
    'Shadow Force':[120,'Ghost','Physical'],
    'Shadow Punch':[60,'Ghost','Physical'],
    'Shadow Sneak':[40,'Ghost','Physical'],
    'Shock Wave':[60,'Electric','Special'],
    'Signal Beam':[75,'Bug','Special'],
    'Sky Attack':[140,'Flying','Physical'],
    'Sky Uppercut':[85,'Fighting','Physical'],
    'Sludge Bomb':[90,'Poison','Special'],
    'Sludge Wave':[95,'Poison','Special'],
    'Smack Down':[50,'Rock','Physical'],
    'Snarl':[55,'Dark','Special'],
    'Solar Beam':[120,'Grass','Special'],
    'Spacial Rend':[100,'Dragon','Special'],
    'Spark':[65,'Electric','Physical'],
    'Steel Wing':[70,'Steel','Physical'],
    'Stomp':[65,'Normal','Physical'],
    'Stone Edge':[100,'Rock','Physical'],
    'Stored Power':[20,'Psychic','Special'],
    'Storm Throw':[60,'Fighting','Physical'],
    'Sucker Punch':[80,'Dark','Physical'],
    'Superpower':[120,'Fighting','Physical'],
    'Surf':[90,'Water','Special'],
    'Swift':[60,'Normal','Special'],
    'Tackle':[50,'Normal','Physical'],
    'Tail Slap':[25,'Normal','Physical'],
    'Thief':[60,'Dark','Physical'],
    'Thrash':[120,'Normal','Physical'],
    'Thunder':[110,'Electric','Special'],
    'Thunder Fang':[65,'Electric','Physical'],
    'Thunder Punch':[75,'Electric','Physical'],
    'Thunderbolt':[90,'Electric','Special'],
    'Tri Attack':[80,'Normal','Special'],
    'U-turn':[70,'Bug','Physical'],
    'V-create':[180,'Fire','Physical'],
    'Vacuum Wave':[40,'Fighting','Special'],
    'Volt Switch':[70,'Electric','Special'],
    'Volt Tackle':[120,'Electric','Physical'],
    'Wake-Up Slap':[70,'Fighting','Physical'],
    'Water Pulse':[60,'Water','Special'],
    'Water Shuriken':[15,'Water','Physical'],
    'Water Spout':[150,'Water','Special'],
    'Waterfall':[80,'Water','Physical'],
    'Weather Ball':[50,'Normal','Special'],
    'Wild Charge':[90,'Electric','Physical'],
    'Wood Hammer':[120,'Grass','Physical'],
    'X-Scissor':[80,'Bug','Physical'],
    'Zen Headbutt':[80,'Psychic','Physical']
};

function isBulletMove(moveName) {
    return ['Acid Spray', 'Aura Sphere', 'Bullet Seed', 'Electro Ball', 'Energy Ball', 'Focus Blast', 'Gyro Ball',
            'Seed Bomb', 'Shadow Ball', 'Sludge Bomb', 'Weather Ball'].indexOf(moveName) !== -1;
}

function isSoundMove(moveName) {
    return ['Boomburst', 'Bug Buzz', 'Chatter', 'Hyper Voice', 'Relic Song', 'Snarl'].indexOf(moveName) !== -1;
}

function isRecoilMove(moveName) {
    return ['Brave Bird', 'Double-Edge', 'Flare Blitz', 'Head Charge', 'Head Smash', 'High Jump Kick', 'Jump Kick',
            'Volt Tackle', 'Wild Charge', 'Wood Hammer'].indexOf(moveName) !== -1;
}

function isPunchMove(moveName) {
    return ['Bullet Punch', 'Drain Punch', 'Dynamic Punch', 'Fire Punch', 'Focus Punch', 'Hammer Arm',
            'Ice Punch', 'Mach Punch', 'Meteor Mash', 'Power-Up Punch', 'Shadow Punch', 'Sky Uppercut',
            'Thunder Punch'].indexOf(moveName) !== -1;
}

function isSheerForceMove(moveName) {
    return ['Acid Spray', 'Air Slash', 'Ancient Power', 'Bite', 'Blaze Kick', 'Blizzard', 'Blue Flare',
            'Body Slam', 'Bolt Strike', 'Bounce', 'Bug Buzz', 'Bulldoze', 'Charge Beam', 'Chatter',
            'Cross Poison', 'Crunch', 'Dark Pulse', 'Discharge', 'Dragon Rush', 'Dynamic Punch',
            'Earth Power', 'Energy Ball', 'Extrasensory', 'Fake Out', 'Fiery Dance', 'Fire Blast',
            'Fire Fang', 'Fire Punch', 'Flame Charge', 'Flame Wheel', 'Flamethrower', 'Flare Blitz',
            'Flash Cannon', 'Focus Blast', 'Force Palm', 'Freeze Dry', 'Freeze Shock', 'Glaciate',
            'Gunk Shot', 'Headbutt', 'Heat Wave', 'Hurricane', 'Ice Beam', 'Ice Fang', 'Ice Punch',
            'Icicle Crash', 'Icy Wind', 'Iron Head', 'Iron Tail', 'Lava Plume', 'Low Sweep', 'Meteor Mash',
            'Moonblast', 'Muddy Water', 'Night Daze', 'Play Rough', 'Poison Jab', 'Power-Up Punch',
            'Psychic', 'Razor Shell', 'Relic Song', 'Rock Climb', 'Rock Slide', 'Rock Smash',
            'Sacred Fire', 'Scald', 'Searing Shot', 'Seed Flare', 'Shadow Ball', 'Signal Beam',
            'Sky Attack', 'Sludge Bomb', 'Sludge Wave', 'Snarl', 'Spark', 'Steel Wing', 'Stomp',
            'Thunder', 'Thunder Fang', 'Thunder Punch', 'Thunderbolt', 'Tri Attack', 'Volt Tackle',
            'Water Pulse', 'Waterfall', 'Zen Headbutt'].indexOf(moveName) !== -1;
}

function isPulseMove(moveName) {
    return ['Aura Sphere', 'Dark Pulse', 'Dragon Pulse', 'Water Pulse'].indexOf(moveName) !== -1;
}

function isBiteMove(moveName) {
    return ['Bite', 'Crunch', 'Fire Fang', 'Ice Fang', 'Thunder Fang'].indexOf(moveName) !== -1;
}

function isContactMove(move) {
    return ['Grass Knot', 'Petal Dance'].indexOf(move.name) !== -1 ||
            (move.category === 'Physical' && ['Attack Order', 'Bonemerang', 'Bulldoze', 'Bullet Seed',
            'Earthquake', 'Explosion', 'Feint', 'Fling', 'Freeze Shock', 'Fusion Bolt', 'Gear Grind',
            'Gunk Shot', 'Ice Shard', 'Icicle Crash', 'Icicle Spear', 'Natural Gift', 'Pin Missile',
            'Psycho Cut', 'Rock Blast', 'Rock Slide', 'Sacred Fire', 'Seed Bomb', 'Sky Attack',
            'Self-Destruct', 'Smack Down', 'Stone Edge'].indexOf(move.name) === -1);
}

function isSpreadMove(moveName) {
    return ['Air Cutter', 'Blizzard', 'Boomburst', 'Bulldoze', 'Dazzling Gleam', 'Discharge', 'Earthquake', 'Eruption',
            'Explosion', 'Glaciate', 'Heat Wave', 'Hyper Voice', 'Icy Wind', 'Incinerate', 'Lava Plume',
            'Muddy Water', 'Nature Power', 'Relic Song', 'Rock Slide', 'Searing Shot', 'Self-Destruct',
            'Sludge Wave', 'Snarl', 'Surf', 'Swift', 'Water Spout'].indexOf(moveName) !== -1;
}
