var roles = require('./roles');
var getRoles = function getRoles(num) {
    switch (num) {
        case 2:
            return [
                roles.Mafioso,
                roles.Godfather
            ];
        case 7:
            return [
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenignOrEvil()
            ];
        case 8:
            return [
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenign(),
                randomizeEvil()
            ];
        case 9:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenignOrEvil(),
                randomizeRandomNeutral()
            ];
        case 10:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenignOrEvil(),
                randomizeRandomNeutral(),
                randomizeAny()
            ];
        case 11:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenignOrEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 12:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 13:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 14:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
                randomizeRandomMafia(),
                randomizeBenign(),
                randomizeEvil(),
                randomizeKilling(),
                randomizeAny()
            ];
        case 15:
            return [
                roles.Jailor,
                randomizeTownInvestigative(),
                randomizeTownInvestigative(),
                randomizeTownSupport(),
                randomizeTownSupport(),
                randomizeTownProtective(),
                randomizeTownKilling(),
                randomizeRandomTown(),
                roles.Godfather,
                roles.Mafioso,
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
	if(!checkUniqueRoles(list, [roles.Veteran, roles.Mayor, roles.Retributionist, roles.Werewolf]))
	{
        list = getRoles(Object.keys(list).length);
        checkValidation(list);
    } else if (!checkVampireRoles(list)) {
        list = getRoles(Object.keys(list).length);
        checkValidation(list);
	}
    return list;
}

function checkVampireRoles(roleList) {
    if (roleList.includes(roles.VampireHunter) && !roleList.includes(roles.Vampire))
        return false;
	return true;
}

function checkUniqueRoles(roleList, uniqueRoles) {
    var count = 0;
	for (let role in uniqueRoles)
        if (roleList.indexOf(role) != roleList.lastIndexOf(role))
            return false;
    return true;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomizeAny() {
    return roles.listAny[Math.floor(Math.random()*roles.listAny.length)]
}

function randomizeRandomMafia() {
	return roles.listMafia[Math.floor(Math.random()*roles.listMafia.length)]
}

function randomizeRandomNeutral() {
    return roles.listNeutral[Math.floor(Math.random()*roles.listNeutral.length)]
}

function randomizeEvil() {
    return roles.listNeutralEvil[Math.floor(Math.random()*roles.listNeutralEvil.length)]
}

function randomizeBenign() {
    return roles.listNeutralBenign[Math.floor(Math.random()*roles.listNeutralBenign.length)]
}

function randomizeKilling() {
    return roles.listNeutral[Math.floor(Math.random()*roles.listNeutralKilling.length)]
}

function randomizeRandomTown() {
	return roles.listTown[Math.floor(Math.random()*roles.listTown.length)]
}

function randomizeTownInvestigative() {
	return roles.listTownInvestigative[Math.floor(Math.random()*roles.listTownInvestigative.length)]
}

function randomizeTownSupport() {
	return roles.listTownSupport[Math.floor(Math.random()*roles.listTownSupport.length)]
}

function randomizeTownKilling() {
	return roles.listTownKilling[Math.floor(Math.random()*roles.listTownKilling.length)]
}

function randomizeTownProtective() {
	return roles.listTownProtective[Math.floor(Math.random()*roles.listTownProtective.length)]
}

function randomizeBenignOrEvil() {
    return roles.listNeutralEvil.concat(roles.listNeutralBenign)[Math.floor(Math.random()*roles.listNeutralEvil.concat(roles.listNeutralBenign).length)]
}

module.exports = {
    checkValidation: checkValidation,
    getRoles: getRoles
}
