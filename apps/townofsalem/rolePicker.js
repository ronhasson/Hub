var Role = require('./roles');
var getRoles = function getRoles(num) {
    switch (num) {
        case 3:
            return [
                Role.Mayor,
                Role.Mafioso,
                Role.Framer
          ];
        case 7:
            return [
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenignOrEvil()
            ];
        case 8:
            return [
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenign(),
                randomizeEvil()
            ];
        case 9:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenignOrEvil(),
                randomizeRandomNeutral()
            ];
        case 10:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenignOrEvil(),
                randomizeRandomNeutral(),
                randomizeAny()
            ];
        case 11:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenignOrEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 12:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 13:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 14:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeRandomMafia(),
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 15:
            return [
                Role.Jailor,
                randomizeTownInvestigative(),
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso,
                randomizeRandomMafia(),
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
    }
}
var list;
var checkValidation = function checkValidation(roleList) {
    list = roleList;
    if (!checkUniqueRoles(list, Role.Veteran)) {
        list = getRoles(Object.keys(list).length);
        checkValidation(list);
    }
    else if (!checkUniqueRoles(list, Role.Mayor)) {
        list = getRoles(Object.keys(list).length);
        checkValidation(list);
    }
    else if (!checkUniqueRoles(list, Role.Retributionist)) {
        list = getRoles(Object.keys(list).length);
        checkValidation(list);
    }
    else if (!checkUniqueRoles(list, Role.Werewolf)) {
        list = getRoles(Object.keys(list).length);
        checkValidation(list);
    }
    else if (!checkVampireRoles(list)) {
        list = getRoles(Object.keys(list).length);
        //console.log("new list:  "+list);
        checkValidation(list);
    }
    return list;
}

function checkVampireRoles(roleList) {
    var vampire = 0;
    var vampireHunter = 0;
    //console.log("checkVampire");
    for (let role in roleList) {
        if (roleList[role] == Role.Vampire) {
            vampire++;
            //console.log("v++ ," + vampire);
        }
        if (roleList[role] == Role.VampireHunter) {
            vampireHunter++;
            //console.log("vh++ ," + vampireHunter);
        }
    }
    if ((vampire > 0) || (vampire == 0 && vampireHunter == 0)) {
        //console.log("true  -  " +vampire + ":" + vampireHunter);
        return true;
    }
    //console.log("false  -  " +vampire + ":" + vampireHunter);
    return false;
}

function checkUniqueRoles(roleList, uniqueRole) {
    var count = 0;
    for (let role in roleList) {
        if (roleList[role] == uniqueRole) {
            count++;
        }
    }
    if (count > 1) {
        return false;
    }
    return true;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomizeAny() {
    switch (randomInt(0, 30)) {
        case 0:
            return Role.Investigator;
        case 1:
            return Role.Lookout;
        case 2:
            return Role.Sheriff;
        case 3:
            return Role.Spy;
        case 4:
            return Role.VampireHunter;
        case 5:
            return Role.Veteran;
        case 6:
            return Role.Vigilante;
        case 7:
            return Role.Bodyguard;
        case 8:
            return Role.Doctor;
        case 9:
            return Role.Escort;
        case 10:
            return Role.Mayor;
        case 11:
            return Role.Medium;
        case 12:
            return Role.Retributionist;
        case 13:
            return Role.Transporter;
        case 14:
            return Role.Executioner;
        case 15:
            return Role.Jester;
        case 16:
            return Role.Witch;
        case 17:
            return Role.Troll;
        case 18:
            return Role.Amnesiac;
        case 19:
            return Role.Survivor;
        case 20:
            return Role.Arsonist;
        case 21:
            return Role.SerialKiller;
        case 22:
            return Role.Werewolf;
        case 23:
            return Role.Disguiser;
        case 24:
            return Role.Forger;
        case 25:
            return Role.Framer;
        case 26:
            return Role.Janitor;
        case 27:
            return Role.Blackmailer;
        case 28:
            return Role.Consigliere;
        case 29:
            return Role.Consort;
        case 30:
            return Role.Vampire;
    }
}

function randomizeRandomMafia() {
    switch (randomInt(0, 6)) {
        case 0:
            return Role.Disguiser;
        case 1:
            return Role.Forger;
        case 2:
            return Role.Framer;
        case 3:
            return Role.Janitor;
        case 4:
            return Role.Blackmailer;
        case 5:
            return Role.Consigliere;
        case 6:
            return Role.Consort;
    }
}

function randomizeRandomNeutral() {
    switch (randomInt(0, 8)) {
        case 0:
            return Role.Executioner;
        case 1:
            return Role.Jester;
        case 2:
            return Role.Witch;
        case 3:
            return Role.Troll;
        case 4:
            return Role.Amnesiac;
        case 5:
            return Role.Survivor;
        case 6:
            return Role.Arsonist;
        case 7:
            return Role.SerialKiller;
        case 8:
            return Role.Werewolf;
    }
}

function randomizeEvil() {
    switch (randomInt(0, 3)) {
        case 0:
            return Role.Executioner;
        case 1:
            return Role.Jester;
        case 2:
            return Role.Witch;
        case 3:
            return Role.Troll;
    }
}

function randomizeBenign() {
    switch (randomInt(0, 1)) {
        case 0:
            return Role.Amnesiac;
            //return Role.Vampire;
        case 1:
            return Role.Survivor;
    }
}

function randomizeKilling() {
    switch (randomInt(0, 2)) {
        case 0:
            return Role.Arsonist;
        case 1:
            return Role.SerialKiller;
        case 2:
            return Role.Werewolf;
    }
}

function randomizeRandomTown() {
    switch (randomInt(0, 13)) {
        case 0:
            return Role.Investigator;
        case 1:
            return Role.Lookout;
        case 2:
            return Role.Sheriff;
        case 3:
            return Role.Spy;
        case 4:
            return Role.VampireHunter;
        case 5:
            return Role.Veteran;
        case 6:
            return Role.Vigilante;
        case 7:
            return Role.Bodyguard;
        case 8:
            return Role.Doctor;
        case 9:
            return Role.Escort;
        case 10:
            return Role.Mayor;
        case 11:
            return Role.Medium;
        case 12:
            return Role.Retributionist;
        case 13:
            return Role.Transporter;
    }
}

function randomizeTownInvestigative() {
    switch (randomInt(0, 3)) {
        case 0:
            return Role.Investigator;
        case 1:
            return Role.Lookout;
        case 2:
            return Role.Sheriff;
        case 3:
            return Role.Spy;
    }
}

function randomizeTownSupport() {
    switch (randomInt(0, 4)) {
        case 0:
            return Role.Escort;
        case 1:
            return Role.Mayor;
        case 2:
            return Role.Medium;
        case 3:
            return Role.Retributionist;
        case 4:
            return Role.Transporter;
    }
}

function randomizeTownKilling() {
    switch (randomInt(0, 2)) {
        case 0:
            return Role.VampireHunter;
        case 1:
            return Role.Veteran;
        case 2:
            return Role.Vigilante;
    }
}

function randomizeTownProtective() {
    switch (randomInt(0, 1)) {
        case 0:
            return Role.Bodyguard;
        case 1:
            return Role.Doctor;
    }
}

function randomizeBenignOrEvil() {
    switch (randomInt(0, 5)) {
        case 0:
            return Role.Amnesiac;
        case 1:
            return Role.Survivor;
        case 2:
            return Role.Executioner;
        case 3:
            return Role.Jester;
        case 4:
            return Role.Witch;
        case 5:
            return Role.Troll;
    }
}

module.exports = {
    checkValidation: checkValidation,
    getRoles: getRoles
}
