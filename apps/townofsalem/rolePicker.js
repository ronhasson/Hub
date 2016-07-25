var Role = require('./roles');
exports.getRoles = function getRoles(num) {
    switch (num) {
        case 7:
            return [
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                Role.Godfather,
                Role.Mafioso
                randomizeBenignOrEvil()
            ];
            break;
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
    switch (randomInt(0, 2)) {
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
