function getRoles(num) {
    switch (num) {
        case 7:
            return new [] {
                randomizeTownInvestigative(),
                    randomizeTownSupport(),
                    randomizeTownKilling(),
                    randomizeRandomTown(),
                    Role.Godfather,
                    Role.Mafioso,
                    randomizeRandomBenignOrEvil()
            };
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomizeTownInvestigative() {
    switch (randomInt(0, 2)) {
        case 0:
            return Role.Investigator;
        case 1:
            return Role.Sheriff;
        case 2:
            return Role.Spy;
    }
}
