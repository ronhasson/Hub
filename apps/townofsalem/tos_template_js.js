var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rolePicker = require("./apps/townofsalem/rolePicker.js");
var roles = require("./apps/townofsalem/roles.js");
requestChangeRemotePage("tos");
var players = [];
var voteList = [];
var guiltyVoters = [];
var innoVoters = [];
var playerOnTrial = null;
var dayOne = false; //TODO: BACK TO TRUE YOU FOCKING FOCK
var voteCounter = 0;
var votingTimer = 30;
var stopVotingTime = false;
var inno = 0;
var guilty = 0;
var OG_mafioso_transformed = false;
var phase = "Discussion";
var isDay = true;
var dayCounter = 0;
var dousedTargets = [];
var winners = [];
function discussion() {
    dayCounter++;
    checkNightAbilities();
    UnjailPlayer(); //unjails jailed player
    votingTimer = 30;
    voteCounter = 0;
    stopVotingTime = false;
    phase = "Discussion";
    var timer;
    if (dayOne)
        timer = 15;
    else
        timer = 5;
    sendEmit("changePhase", {
        time: timer,
        phase: "Discussion"
    });
    isDay = true;
    var interval = setInterval(function () {
        if (--timer < -5) {
            clearInterval(interval);
            if (dayOne) {
                dayOne = false;
                night();
            }
            else {
                voting();
            }
            return;
        }
    }, 1000);
}
function voting() {
    phase = "Voting";
    sendEmit("changePhase", {
        time: votingTimer,
        phase: "Voting"
    });
    guiltyVoters = [];
    innoVoters = [];
    var interval = setInterval(function () {
        if (stopVotingTime) {
            clearInterval(interval);
            defense();
            return;
        }
        if (--votingTimer < -5 || voteCounter > 6) {
            clearInterval(interval);
            night();
            return;
        }
    }, 1000);
}
function defense() {
    phase = "Defense";
    sendEmit("changePhase", {
        time: 5,
        phase: "Defense"
    });
    var timer = 5;
    var interval = setInterval(function () {
        if (--timer < -5) {
            clearInterval(interval);
            judgement();
            return;
        }
    }, 1000);
}
function judgement() {
    inno = 0;
    guilty = 0;
    phase = "Judgement";
    sendEmit("changePhase", {
        time: 10,
        phase: "Judgement",
        defendant: playerOnTrial.username
    });
    var timer = 10;
    var interval = setInterval(function () {
        if (--timer < -5) {
            clearInterval(interval);
            showJudgementResults();
            if (guilty > inno) {
                lastWords();
            }
            else {
                playerOnTrial = null;
                stopVotingTime = false;
                voting();
            }
            return;
        }
    }, 1000);
}
function lastWords() {
    phase = "Last Words";
    sendEmit("changePhase", {
        time: 5,
        phase: "Last Words"
    });
    var timer = 5;
    var interval = setInterval(function () {
        if (--timer < -5) {
            clearInterval(interval);
            hangPlayer();
            night();
            return;
        }
    }, 1000);
}
function night() {
    checkDayAbilities();
    alertOnAbilityCount();
    phase = "Night";
    sendEmit("changePhase", {
        time: 40,
        phase: "Night"
    });
    isDay = false;
    var timer = 40;
    var interval = setInterval(function () {
        if (--timer < -5) {
            clearInterval(interval);
            discussion();
            return;
        }
    }, 1000);
}
function sendMessageToPlayers(data) {
    if (data.hasOwnProperty("message") && data.hasOwnProperty("player")) {
        if (UID_Exists(data.player.uid)) {
            var msg = data.message;
            if (msg.substring(0, 3) == "/w ") {
                var temp = data.message;
                var un = msg.split(" ")[1];
                if (usernameExists(un)) {
                    var actual_msg = temp.substring(3, temp.length);
                    sendEmit('getMessage', {
                        username: data.player.username + " is whispering to ",
                        message: un
                    });
                    sendToSocketId('getMessage', {
                        username: data.player.username + " is whispering to ",
                        message: actual_msg
                    }, players[getIndexByUID(data.player.uid)].socketid);
                    sendToSocketId('getMessage', {
                        username: data.player.username + " is whispering to ",
                        message: actual_msg
                    }, players[getIndexByUsername(un)].socketid);
                    for (var k = 0; k < players.length; k++) {
                        if (players[k].role.name == roles.Blackmailer.name
                            || players[k].role.name == roles.Spy.name) {
                            sendToSocketId('getMessage', {
                                username: data.player.username + " is whispering to ",
                                message: actual_msg
                            }, players[k].socketid);
                        }
                    }
                }
            }
            else {
                if (phase != "Last Words" && phase != "Defense") {
                    if (players[getIndexByUID(data.player.uid)].blackmailed) {
                        sendToSocketId('getMessage', {
                            username: "",
                            message: "You are blackmailed."
                        }, players[getIndexByUID(data.player.uid)].socketid);
                    }
                    else {
                        var sender_player = players[getIndexByUID(data.player.uid)];
                        for (var i = 0; i < players.length; i++) {
                            var temp_player = players[i];
                            if (temp_player.uid == sender_player.uid) {
                                sendToSocketId('getMessage', {
                                    username: sender_player.username + ": ",
                                    message: data.message
                                }, temp_player.socketid);
                            }
                            else if (!isDay) {
                                if (sender_player.isded) {
                                    if (temp_player.isded)
                                        sendToSocketId('getMessage', {
                                            username: sender_player.username + ": ",
                                            message: data.message
                                        }, temp_player.socketid);
                                    else if (temp_player.role.name == roles.Medium.name)
                                        sendToSocketId('getMessage', {
                                            username: sender_player.username + ": ",
                                            message: data.message
                                        }, temp_player.socketid);
                                    else if (sender_player.role.name == roles.Medium.name && temp_player.username == sender_player.targetPlayer)
                                        sendToSocketId('getMessage', {
                                            username: "Medium" + ": ",
                                            message: data.message
                                        }, temp_player.socketid);
                                }
                                else if (temp_player.role.name == roles.Medium.name && temp_player.targetPlayer == sender_player.username) {
                                    sendToSocketId('getMessage', {
                                        username: sender_player.username + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.role.name == roles.Medium.name && temp_player.isded) {
                                    sendToSocketId('getMessage', {
                                        username: "Medium" + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.role.name == roles.Jailor.name && temp_player.username == players[getJailedIndex()].username) {
                                    sendToSocketId('getMessage', {
                                        username: "Jailor" + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.inJail && temp_player.role.name == roles.Jailor.name) {
                                    sendToSocketId('getMessage', {
                                        username: sender_player.username + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.role.team == "mafia" && temp_player.role.team == "mafia") {
                                    sendToSocketId('getMessage', {
                                        username: sender_player.username + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.role.team == "mafia" && temp_player.role.name == roles.Spy.name) {
                                    sendToSocketId('getMessage', {
                                        username: "Mafia" + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.role.name == roles.Vampire.name && temp_player.role.name == roles.Vampire.name) {
                                    sendToSocketId('getMessage', {
                                        username: sender_player.username + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (sender_player.role.name == roles.Vampire.name && temp_player.role.name == roles.VampireHunter.name) {
                                    sendToSocketId('getMessage', {
                                        username: "Vampire" + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                            }
                            else {
                                if (!sender_player.isded) {
                                    sendToSocketId('getMessage', {
                                        username: sender_player.username + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                                else if (temp_player.isded) {
                                    sendToSocketId('getMessage', {
                                        username: sender_player.username + ": ",
                                        message: data.message
                                    }, temp_player.socketid);
                                }
                            }
                        }
                    }
                }
                else {
                    if (playerOnTrial.username == data.player.username) {
                        if (players[getIndexByUID(data.player.uid)].blackmailed) {
                            sendEmit('getMessage', {
                                username: data.player.username + ": ",
                                message: "I am blackmailed."
                            });
                        }
                        else {
                            sendEmit('getMessage', {
                                username: data.player.username + ": ",
                                message: data.message
                            });
                        }
                    }
                }
            }
        }
    }
}
function sendVotingMessage(username, targetUsername, message) {
    sendEmit('getVotingMessage', {
        message: username + message + targetUsername
    });
}
function getIndexByUID(UID) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].uid == UID)
            return i;
    }
    return -1;
}
function getIndexByUsername(_username) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].username == _username)
            return i;
    }
    return -1;
}
function usernameExists(_username) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].username == _username) {
            return true;
        }
    }
    return false;
}
function UID_Exists(UID) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].uid == UID) {
            return true;
        }
    }
    return false;
}
function compare(a, b) {
    if (a.priority < b.priority) {
        return -1;
    }
    if (a.priority > b.priority) {
        return 1;
    }
    return 0;
}
function checkNightAbilities() {
    var jesters = getArrayIndexByRole("Jester");
    for (var indx = 0; indx < jesters.length; indx++) {
        if (players[jesters[indx]].diedToday && players[jesters[indx]].targetPlayer == "") {
            players[jesters[indx]].targetPlayer = guiltyVoters[Math.floor(Math.random() * guiltyVoters.length)];
        }
    }
    var sortedByPriority = players.sort(compare);
    console.log(sortedByPriority);
    for (var i = 0; i < sortedByPriority.length; i++) {
        if (!sortedByPriority[i].witched && sortedByPriority[i].priority != 0 && (sortedByPriority[i].targetPlayer != "" || ((sortedByPriority[i].role.name == roles.Werewolf.name && dayCounter % 2 == 0)
            || (players[getIndexByUsername(sortedByPriority[i].username)].roleBlocked && sortedByPriority[i].role.name == roles.SerialKiller.name) || (sortedByPriority[i].role.name == roles.Arsonist.name)))
            && (!sortedByPriority[i].isded || (sortedByPriority[i].role.name == roles.Jester.name && sortedByPriority[i].diedToday))
            && (!sortedByPriority[i].inJail || (sortedByPriority[i].role.name == roles.Werewolf.name || sortedByPriority[i].role.name == roles.SerialKiller.name))) {
            players[getIndexByUsername(sortedByPriority[i].username)].useAbility();
        }
    }
    var arsonists = getArrayIndexByRole("Arsonist");
    for (var i = 0; i < arsonists.length; i++) {
        if (players[arsonists[i]].cleanYourself) {
            for (var j = 0; j < dousedTargets.length; j++) {
                if (dousedTargets[j] == players[arsonists[i]].username) {
                    dousedTargets.splice(j, 1);
                }
            }
        }
    }
    for (var i = 0; i < arsonists.length; i++) {
        if (players[arsonists[i]].ignite) {
            for (var j = 0; j < dousedTargets.length; j++) {
                players[getIndexByUsername(dousedTargets[j])].diedTonight = true;
            }
            dousedTargets = [];
        }
    }
    for (var i = 0; i < arsonists.length; i++) {
        if (players[arsonists[i]].dousedTarget != "") {
            dousedTargets.push(players[arsonists[i]].dousedTarget);
        }
    }
    var executioners = getArrayIndexByRole("Executioner");
    for (var i = 0; i < executioners.length; i++) {
        if (players[getIndexByUsername(players[executioners[i]].target)].diedTonight) {
            players[executioners[i]].role = roles.Jester;
            classifyPlayer(getIndexByUID(players[executioners[i]].uid), players[executioners[i]].role.name);
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].diedTonight) {
            players[i].isded = true;
            players[i].diedTonight = false;
        }
        else if (!players[i].isded) {
            players[i].cleaned = false;
        }
        players[i].inJail = false;
        players[i].targetPlayer = "";
    }
    var mafList = [];
    var vampList = [];
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "mafia" && !players[i].isded) {
            players[i].mafiaList = mafList;
        }
        else if (players[i].role.name == roles.Vampire.name && !players[i].isded) {
            players[i].vampireList = vampList;
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "mafia") {
            var _maflist = new Object();
            for (var j = 0; j < players[i].mafiaList.length; j++) {
                _maflist[j] = { role: players[i].mafiaList[j].role, username: players[i].mafiaList.username, uid: players[i].mafiaList.uid, inJail: players[i].mafiaList.inJail, targetPlayer: players[i].targetPlayer };
            }
            sendToSocketId("updateAfterNight", {
                player: { role: players[i].role, username: players[i].username, uid: players[i].uid, inJail: players[i].inJail, mafiaList: _maflist, targetPlayer: players[i].targetPlayer },
                canUseAbility: players[i].abilityCounter < players[i].role.abilitylimit
            }, players[i].socketid);
        }
        else if (players[i].role.name == roles.Vampire.name) {
            var _vamplist = new Object();
            for (var j = 0; j < players[i].vampireList.length; j++) {
                _vamplist[j] = { role: players[i].vampireList[j].role, username: players[i].vampireList[j].username, uid: players[i].vampireList[j].uid, inJail: players[i].vampireList[j].inJail, targetPlayer: players[i].targetPlayer };
            }
            sendToSocketId("updateAfterNight", {
                player: { role: players[i].role, username: players[i].username, uid: players[i].uid, inJail: players[i].inJail, vampireList: _vamplist, targetPlayer: players[i].targetPlayer },
                canUseAbility: players[i].abilityCounter < players[i].role.abilitylimit
            }, players[i].socketid);
        }
        else {
            sendToSocketId("updateAfterNight", {
                player: { role: players[i].role, username: players[i].username, uid: players[i].uid, inJail: players[i].inJail, targetPlayer: players[i].targetPlayer },
                canUseAbility: players[i].abilityCounter < players[i].role.abilitylimit
            }, players[i].socketid);
        }
    }
    var deadlist = {}; //should i save it as class variable
    var Janitor_deadlist = {};
    for (var i = 0; i < players.length; i++) {
        if (players[i].isded) {
            var deadrole;
            if (players[i].cleaned) {
                deadrole = null;
            }
            else {
                deadrole = players[i].role;
            }
            deadlist[i] = { username: players[i].username, role: deadrole, will: players[i].will, deathnote: players[i].howIDied };
            Janitor_deadlist[i] = { username: players[i].username, role: players[i].role, will: players[i].will, deathnote: players[i].howIDied };
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.name == roles.Janitor.name) {
            sendToSocketId("updateDeadList", {
                deadlist: Janitor_deadlist
            }, players[i].socketid);
        }
        else {
            sendToSocketId("updateDeadList", {
                deadlist: deadlist
            }, players[i].socketid);
        }
    }
    var gf_index = getArrayIndexByRole("Godfather");
    if (gf_index[0] == -1) {
        var mafioso_index = getArrayIndexByRole("Mafioso");
        if (mafioso_index[0] != -1 && OG_mafioso_transformed) {
            classifyPlayer(mafioso_index[0], roles.Godfather.name);
            OG_mafioso_transformed = true;
        }
        else {
            var all_maf = [];
            for (var i = 0; i < players.length; i++) {
                if (players[i].role.team == "mafia") {
                    all_maf.push(i);
                }
            }
            if (all_maf.length != 0) {
                classifyPlayer(all_maf[Math.floor(Math.random() * all_maf.length)], roles.Mafioso.name);
            }
        }
    }
    isGameOver();
}
function UnjailPlayer() {
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.name == roles.Jailor.name) {
            if (players[i].targetPlayer != "") {
                sendToSocketId("jailOrUnjailPlayer", false, players[getIndexByUsername(players[i].targetPlayer)].socketid);
                sendToSocketId("updateTargetPlayer", "", players[i].socketid);
                players[getIndexByUsername(players[i].targetPlayer)].inJail = false;
                players[i].targetPlayer = "";
            }
        }
    }
}
function alertOnAbilityCount() {
    for (var i = 0; i < players.length; i++) {
        if (!players[i].isded) {
            if (players[i].role.name == roles.Jailor.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " executions left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Vigilante.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " bullets left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Bodyguard.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " bullet proof vests left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Doctor.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " self heals left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Retributionist.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " ressurections left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Veteran.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " alerts left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Disguiser.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " disguises left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Forger.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " forgeries left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Janitor.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " cleanings left.", players[i].socketid);
            }
            else if (players[i].role.name == roles.Survivor.name) {
                alertMessage("You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " bullet proof vests left.", players[i].socketid);
            }
        }
    }
}
function checkDayAbilities() {
    for (var i = 0; i < players.length; i++) {
        players[i].roleBlocked = false;
        players[i].blackmailed = false;
        players[i].framed = false;
        players[i].witched = false;
        players[i].forged = false;
        players[i].usingAbility = false;
        if (players[i].role.name == roles.Witch.name || players[i].role.name == roles.Transporter.name) {
            players[i].target2 = "";
        }
        if (players[i].role.name == roles.Arsonist.name) {
            players[i].dousedTarget = "";
            players[i].cleanYourself = false;
            players[i].ignite = false;
        }
        if (players[i].role.name == roles.Jailor.name && !players[i].isded) {
            if (players[i].targetPlayer != "") {
                if (!players[getIndexByUsername(players[i].targetPlayer)].isded) {
                    players[getIndexByUsername(players[i].targetPlayer)].inJail = true;
                    players[getIndexByUsername(players[i].targetPlayer)].roleBlocked = true;
                    sendToSocketId("jailOrUnjailPlayer", true, players[getIndexByUsername(players[i].targetPlayer)].socketid);
                    sendToSocketId("updateTargetPlayer", players[i].targetPlayer, players[i].socketid);
                    alertMessage("You dragged your target to jail.", players[i].socketid);
                    alertMessage("You were hauled off to jail", players[getIndexByUsername(players[i].targetPlayer)].socketid);
                    players[i].targetPlayer = "";
                }
            }
            else {
                alertMessage("You did not use your day ability.", players[i].socketid);
            }
        }
        else if (players[i].role.name == roles.Medium.name) {
            if (players[i].isded && players[i].targetPlayer != "") {
                if (!players[getIndexByUsername(players[i].targetPlayer)].isded) {
                    sendToSocketId("updateTargetPlayer", players[i].targetPlayer, players[i].socketid);
                    sendToSocketId("cannotUseAbility", {}, players[i].socketid);
                }
            }
        }
        else if (players[i].role.name == roles.Mayor.name) {
            if (players[i].abilityCounter == 0) {
                alertMessage("You did not use your day ability.", players[i].socketid);
            }
        }
    }
}
function Button1(data) {
    if (data.hasOwnProperty("player") && data.hasOwnProperty("targetname")) {
        if (usernameExists(data.targetname) && UID_Exists(data.player.uid)) {
            if (isDay) {
                if (phase == "Voting" && data.targetname != players[getIndexByUID(data.player.uid)].username && !players[getIndexByUID(data.player.uid)].isded && !players[getIndexByUsername(data.targetname)].isded) {
                    var i = getIndexByUsername(data.targetname);
                    var playerIndex = getIndexByUID(data.player.uid);
                    if (voteList[playerIndex].votingTo == null) {
                        voteList[playerIndex].votingTo = players[i];
                        if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe += 3;
                        }
                        else {
                            voteList[i].votesToMe++;
                        }
                        sendVotingMessage(data.player.username, data.targetname + ".", " has voted against ");
                    }
                    else if (voteList[playerIndex].votingTo.username != data.targetname) {
                        if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe += 3;
                            voteList[getIndexByUID(voteList[playerIndex].votingTo.uid)].votesToMe -= 3;
                        }
                        else {
                            voteList[i].votesToMe++;
                            voteList[getIndexByUID(voteList[playerIndex].votingTo.uid)].votesToMe--;
                        }
                        voteList[playerIndex].votingTo = players[i];
                        sendVotingMessage(data.player.username, data.targetname + ".", " has changed their vote to ");
                    }
                    else if (voteList[playerIndex].votingTo.username == data.targetname) {
                        if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe -= 3;
                        }
                        else {
                            voteList[i].votesToMe--;
                        }
                        voteList[playerIndex].votingTo = null;
                        sendVotingMessage(data.player.username, "", " has canceled their vote.");
                    }
                    shouldGetOnTrial(i);
                }
                else if (phase == "Judgement") {
                    if (!players[getIndexByUID(data.player.uid)].isded) {
                        var msg = "";
                        if (guiltyVoters.indexOf(data.player.username) == -1) {
                            msg = " has voted.";
                            guilty++;
                            if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                                guilty += 2;
                            }
                            guiltyVoters.push(data.player.username);
                            if (innoVoters.indexOf(data.player.username) != -1) {
                                innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                                msg = " has changed their vote.";
                                inno--;
                                if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                                    inno -= 2;
                                }
                            }
                        }
                        else {
                            msg = " has canceled their vote.";
                            guilty--;
                            if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                                guilty -= 2;
                            }
                            guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                        }
                        sendVotingMessage(data.player.username, "", msg);
                    }
                }
            }
            else {
                //if player isnt dead and has a night ability: set target name
                var playerIndex = getIndexByUID(data.player.uid);
                var targetIndex = getIndexByUsername(data.targetname);
                var abilityPlayer = players[playerIndex];
                var targetPlayer = players[targetIndex];
                if (abilityPlayer.hanged && abilityPlayer.role.name == roles.Jester.name && abilityPlayer.abilityCounter == 0) {
                    if (abilityPlayer.targetPlayer == data.targetname) {
                        alertMessage("You have canceled your decision.", abilityPlayer.socketid);
                        players[playerIndex].targetPlayer = "";
                    }
                    else {
                        players[playerIndex].targetPlayer = data.targetname;
                        alertMessage("You have decided to kill " + data.targetname + " tonight.", abilityPlayer.socketid);
                    }
                }
                else if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Jailor.name && abilityPlayer.abilityCounter < abilityPlayer.role.abilitylimit) {
                    var jailedIndex = getJailedIndex();
                    if (jailedIndex != -1) {
                        if (targetPlayer.username == players[jailedIndex].username) {
                            if (players[playerIndex].targetPlayer == "") {
                                players[playerIndex].targetPlayer = targetPlayer.username;
                                alertMessage("You have decided to execute your target", abilityPlayer.socketid);
                                alertMessage("The Jailor decided to execute you", targetPlayer.socketid);
                            }
                            else {
                                players[playerIndex].targetPlayer = "";
                                alertMessage("You have canceled your decision", abilityPlayer.socketid);
                                alertMessage("The Jailor canceled his decision", targetPlayer.socketid);
                            }
                        }
                    }
                }
                else if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Werewolf.name && dayCounter % 2 == 0) {
                    players[playerIndex].targetPlayer = targetPlayer.username;
                }
                else if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Forger.name) {
                    if (data.targetname == abilityPlayer.username && abilityPlayer.targetPlayer != "") {
                        if (data.hasOwnProperty("forgedWill")) {
                            players[playerIndex].forgedWill = data.forgedWill;
                            alertMessage("Will forgery confirmed", abilityPlayer.socketid);
                        }
                    }
                    else {
                        players[playerIndex].targetPlayer = data.targetname;
                        alertMessage("Forging " + targetPlayer.username + "'s will.", abilityPlayer.socketid);
                    }
                }
                else if (!abilityPlayer.isded && abilityPlayer.role.priority != 0) {
                    if (abilityPlayer.role.name == roles.Doctor.name || abilityPlayer.role.name == roles.Bodyguard.name) {
                        if (data.targetname != abilityPlayer.username) {
                            if (abilityPlayer.targetPlayer == data.targetname) {
                                alertMessage("You have canceled your decision.", abilityPlayer.socketid);
                                players[playerIndex].targetPlayer = "";
                            }
                            else if (abilityPlayer.role.name == roles.Doctor.name && targetPlayer.role.name == roles.Mayor.name && targetPlayer.abilityCounter == 1) {
                                players[playerIndex].targetPlayer = data.targetname;
                                alertMessage("You have decided to use your ability on " + data.targetname + " tonight.", abilityPlayer.socketid);
                            }
                        }
                        else if (abilityPlayer.abilityCounter < abilityPlayer.role.abilitylimit) {
                            if (abilityPlayer.targetPlayer == abilityPlayer.username) {
                                alertMessage("You have canceled your decision.", abilityPlayer.socketid);
                                players[playerIndex].targetPlayer = "";
                            }
                            else {
                                players[playerIndex].targetPlayer = data.targetname;
                                alertMessage("You have decided to use your ability on yourself tonight.", abilityPlayer.socketid);
                            }
                        }
                    }
                    else if (abilityPlayer.abilityCounter < abilityPlayer.role.abilitylimit) {
                        if (abilityPlayer.targetPlayer == data.targetname) {
                            alertMessage("You have canceled your decision.", abilityPlayer.socketid);
                            players[playerIndex].targetPlayer = "";
                        }
                        else {
                            players[playerIndex].targetPlayer = data.targetname;
                            alertMessage("You have decided to use your ability on " + data.targetname + " tonight.", abilityPlayer.socketid);
                        }
                    }
                }
            }
        }
    }
}
function updatePlayerWill(data) {
    if (data.hasOwnProperty("player") && data.hasOwnProperty("willText")) {
        if (UID_Exists(data.player.uid)) {
            players[getIndexByUID(data.player.uid)].will = data.willText;
        }
    }
}
function Button2(data) {
    if (data.hasOwnProperty("player") && data.hasOwnProperty("targetname")) {
        if (usernameExists(data.targetname) && UID_Exists(data.player.uid)) {
            if (isDay) {
                if (phase == "Judgement" && playerOnTrial.username == data.targetname) {
                    if (!players[getIndexByUID(data.player.uid)].isded) {
                        var msg = "";
                        if (innoVoters.indexOf(data.player.username) == -1) {
                            msg = " has voted.";
                            inno++;
                            if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                                inno += 2;
                            }
                            innoVoters.push(data.player.username);
                            if (guiltyVoters.indexOf(data.player.username) != -1) {
                                guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                                msg = " has changed their vote.";
                                guilty--;
                                if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                                    guilty -= 2;
                                }
                            }
                        }
                        else {
                            inno--;
                            if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                                inno -= 2;
                            }
                            innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                            msg = " has canceled their vote.";
                        }
                        sendVotingMessage(data.player.username, "", msg);
                    }
                }
            }
            else {
                var playerIndex = getIndexByUID(data.player.uid);
                var targetIndex = getIndexByUsername(data.targetname);
                var abilityPlayer = players[playerIndex];
                var targetPlayer = players[targetIndex];
                if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Forger.name && abilityPlayer.targetPlayer != "") {
                    players[playerIndex].forgedWill = "";
                    players[playerIndex].targetPlayer = "";
                    alertMessage("Forgery canceled.", abilityPlayer.socketid);
                }
                if (!abilityPlayer.isded && abilityPlayer.role.priority != 0 && (abilityPlayer.role.name == roles.Witch.name || abilityPlayer.role.name == roles.Transporter.name)) {
                    if (abilityPlayer.targetPlayer == data.targetname) {
                        alertMessage("You have canceled your decision.", abilityPlayer.socketid);
                        players[playerIndex].target2 = "";
                    }
                    else {
                        players[playerIndex].target2 = data.targetname;
                        alertMessage("Your second target will be " + data.targetname, abilityPlayer.socketid);
                    }
                }
            }
        }
    }
}
function alertMessage(str, socketid) {
    sendToSocketId('getMessage', {
        username: "",
        message: str
    }, socketid);
}
function sunButton(data) {
    if (data.hasOwnProperty("player") && data.hasOwnProperty("targetname")) {
        if (isDay && usernameExists(data.targetname) && UID_Exists(data.player.uid)) {
            var abilityPlayerIndex = getIndexByUID(data.player.uid);
            var targetPlayerIndex = getIndexByUsername(data.targetname);
            if (players[abilityPlayerIndex].role.name == roles.Mayor.name && !players[abilityPlayerIndex].isded && players[abilityPlayerIndex].abilityCounter == 0) {
                sendVotingMessage(players[abilityPlayerIndex].username, "", " has revealed himself as the Mayor!.");
                players[abilityPlayerIndex].abilityCounter++;
                sendToSocketId("cannotUseAbility", {}, players[abilityPlayerIndex].socketid);
            }
            else if (players[abilityPlayerIndex].role.name == roles.Jailor.name && !players[targetPlayerIndex].isded && !players[abilityPlayerIndex].isded) {
                if (data.targetname != players[abilityPlayerIndex].targetPlayer) {
                    players[abilityPlayerIndex].targetPlayer = data.targetname;
                    alertMessage("You have decided to jail " + data.targetname + " tonight.", players[abilityPlayerIndex].socketid);
                }
                else {
                    alertMessage("You will no longer jail " + data.targetname + " tonight.", players[abilityPlayerIndex].socketid);
                    players[abilityPlayerIndex].targetPlayer = "";
                }
            }
            else if (players[abilityPlayerIndex].role.name == roles.Medium.name && players[abilityPlayerIndex].isded && !players[targetPlayerIndex].isded && players[abilityPlayerIndex].abilityCounter == 0) {
                if (players[abilityPlayerIndex].targetPlayer != data.targetname) {
                    players[abilityPlayerIndex].targetPlayer = data.targetname;
                    players[abilityPlayerIndex].abilityCounter++;
                    alertMessage("You have decided to seance " + data.targetname + " tonight.", players[abilityPlayerIndex].socketid);
                }
                else {
                    alertMessage("You will no longer seance " + data.targetname + " tonight.", players[abilityPlayerIndex].socketid);
                    players[abilityPlayerIndex].targetPlayer = "";
                    players[abilityPlayerIndex].abilityCounter--;
                }
            }
        }
    }
}
function shouldGetOnTrial(index) {
    var playersAlive = 0;
    for (var i = 0; i < players.length; i++) {
        if (!players[i].isded) {
            playersAlive++;
        }
    }
    if (voteList[index].votesToMe > (playersAlive / 2)) {
        voteCounter++;
        stopVotingTime = true;
        playerOnTrial = players[index];
        for (var i = 0; i < players.length; i++) {
            voteList[i].votesToMe = 0;
            voteList[i].votingTo = null;
        }
        console.log("on trial baby: " + playerOnTrial.username);
    }
}
function showJudgementResults() {
    for (var i = 0; i < innoVoters.length; i++) {
        sendVotingMessage(innoVoters[i], "", " voted innocent.");
    }
    for (var i = 0; i < guiltyVoters.length; i++) {
        sendVotingMessage(guiltyVoters[i], "", " voted guilty.");
    }
    for (var i = 0; i < players.length; i++) {
        if (guiltyVoters.indexOf(players[i].username) == -1 && innoVoters.indexOf(players[i].username) == -1 && playerOnTrial.username != players[i].username) {
            sendVotingMessage(players[i].username, "", " abstained.");
        }
    }
}
function hangPlayer() {
    console.log("about to fucking die baby: " + playerOnTrial.username);
    players[getIndexByUID(playerOnTrial.uid)].hanged = true;
    players[getIndexByUID(playerOnTrial.uid)].isded = true;
    var Executioners = getArrayIndexByRole("Executioner");
    for (var i = 0; i < Executioners.length; i++) {
        if (players[Executioners[i]].target == players[getIndexByUID(playerOnTrial.uid)].username && !players[Executioners[i]].isded) {
            winners.push(players[Executioners[i]].username);
        }
    }
    if (players[getIndexByUID(playerOnTrial.uid)].role.name == roles.Jester.name) {
        players[getIndexByUID(playerOnTrial.uid)].diedToday = true;
        var jester_guilty_voters = {};
        for (var index = 0; index < guiltyVoters.length; index++) {
            jester_guilty_voters[index] = guiltyVoters[i];
        }
        sendToSocketId('jesterHanged', {
            jester_hanged_today: true,
            guilty_voters: jester_guilty_voters
        }, players[getIndexByUID(playerOnTrial.uid)].socketid);
        winners.push(players[getIndexByUID(playerOnTrial.uid)].username);
    }
    sendVotingMessage(playerOnTrial.username, "", " has died. rip in pepperonies");
    players[getIndexByUID(playerOnTrial.uid)].howIDied = "iz jus a prank, y u heff 2 b med";
    var deadlist = {}; //should i save it as class variable
    var Janitor_deadlist = {};
    for (var i = 0; i < players.length; i++) {
        if (players[i].isded) {
            var deadrole;
            if (players[i].cleaned) {
                deadrole = null;
            }
            else {
                deadrole = players[i].role;
            }
            deadlist[i] = { username: players[i].username, role: deadrole, will: players[i].will, deathnote: players[i].howIDied };
            Janitor_deadlist[i] = { username: players[i].username, role: players[i].role, will: players[i].will, deathnote: players[i].howIDied };
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.name == roles.Janitor.name) {
            sendToSocketId("updateDeadList", {
                deadlist: Janitor_deadlist
            }, players[i].socketid);
        }
        else {
            sendToSocketId("updateDeadList", {
                deadlist: deadlist
            }, players[i].socketid);
        }
    }
    var executioners = getArrayIndexByRole("Executioner");
    for (var i = 0; i < executioners.length; i++) {
        if (players[getIndexByUsername(players[executioners[i]].target)] == players[getIndexByUID(playerOnTrial.uid)].username && !players[executioners[i]].isded) {
            players[executioners[i]].role = roles.Jester;
            classifyPlayer(getIndexByUID(players[executioners[i]].uid), players[executioners[i]].role.name);
            sendToSocketId("updateAfterNight", {
                player: { role: players[executioners[i]].role, username: players[executioners[i]].username, uid: players[executioners[i]].uid, inJail: players[executioners[i]].inJail, targetPlayer: players[executioners[i]].targetPlayer },
                isded: false,
                canUseAbility: true
            }, players[executioners[i]].socketid);
        }
    }
    // show will and role
    // put in graveyard (2 buttons will and deathnote)
    playerOnTrial = null;
    isGameOver();
}
function isGameOver() {
    var townWin = true;
    var mafiaWin = true;
    var skWin = true;
    var arsoWin = true;
    var wwWin = true;
    var draw = true;
    var witchExists = false;
    var vigWithBullets = false;
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.name == roles.Witch.name) {
            witchExists = true;
        }
        if (players[i].role.name == roles.Vigilante.name && players[i].abilityCounter < players[i].role.abilitylimit) {
            vigWithBullets = true;
        }
        if (players[i].role.team == "mafia" || players[i].role.name == roles.Werewolf.name || players[i].role.name == roles.Arsonist.name || players[i].role.name == roles.SerialKiller.name) {
            townWin = false;
        }
        if (witchExists && vigWithBullets) {
            townWin = false;
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "town" || players[i].role.name == roles.Werewolf.name || players[i].role.name == roles.Arsonist.name || players[i].role.name == roles.SerialKiller.name) {
            mafiaWin = false;
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "town" || players[i].role.name == roles.Werewolf.name || players[i].role.name == roles.Arsonist.name || players[i].role.team == "mafia") {
            skWin = false;
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "town" || players[i].role.name == roles.Werewolf.name || players[i].role.name == roles.SerialKiller.name || players[i].role.team == "mafia") {
            arsoWin = false;
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "town" || players[i].role.name == roles.Arsonist.name || players[i].role.name == roles.SerialKiller.name || players[i].role.team == "mafia") {
            wwWin = false;
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (!players[i].isded && players[i].role.name != roles.Survivor.name) {
            draw = false;
        }
    }
    if (townWin) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.team == "town" || players[i].role.name == roles.Survivor.name) {
                winners.push(players[i].username);
            }
        }
        sendEmit("getMessage", {
            username: "",
            message: "Town won! The winners are:"
        });
        for (var i = 0; i < winners.length; i++) {
            sendEmit("getMessage", {
                username: "",
                message: winners[i]
            });
        }
    }
    if (mafiaWin) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.team == "mafia" || players[i].role.name == roles.Survivor.name || players[i].role.name == roles.Witch.name) {
                winners.push(players[i].username);
            }
        }
        sendEmit("getMessage", {
            username: "",
            message: "Mafia won! The winners are:"
        });
        for (var i = 0; i < winners.length; i++) {
            sendEmit("getMessage", {
                username: "",
                message: winners[i]
            });
        }
    }
    if (skWin) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.name == roles.SerialKiller.name || players[i].role.name == roles.Survivor.name || players[i].role.name == roles.Witch.name) {
                winners.push(players[i].username);
            }
        }
        sendEmit("getMessage", {
            username: "",
            message: "Serial Killer won! The winners are:"
        });
        for (var i = 0; i < winners.length; i++) {
            sendEmit("getMessage", {
                username: "",
                message: winners[i]
            });
        }
    }
    if (arsoWin) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.name == roles.Arsonist.name || players[i].role.name == roles.Survivor.name || players[i].role.name == roles.Witch.name) {
                winners.push(players[i].username);
            }
        }
        sendEmit("getMessage", {
            username: "",
            message: "Arsonist won! The winners are:"
        });
        for (var i = 0; i < winners.length; i++) {
            sendEmit("getMessage", {
                username: "",
                message: winners[i]
            });
        }
    }
    if (wwWin) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.name == roles.Werewolf.name || players[i].role.name == roles.Survivor.name || players[i].role.name == roles.Witch.name) {
                winners.push(players[i].username);
            }
        }
        sendEmit("getMessage", {
            username: "",
            message: "Arsonist won! The winners are:"
        });
        for (var i = 0; i < winners.length; i++) {
            sendEmit("getMessage", {
                username: "",
                message: winners[i]
            });
        }
    }
    if (draw) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.name == roles.Survivor.name) {
                winners.push(players[i].username);
            }
        }
        sendEmit("getMessage", {
            username: "",
            message: "I won! The winners are:"
        });
        for (var i = 0; i < winners.length; i++) {
            sendEmit("getMessage", {
                username: "",
                message: winners[i]
            });
        }
    }
}
function updatePlayerDeathnote(data) {
    if (data.hasOwnProperty("player") && data.hasOwnProperty("deathnoteText")) {
        if (UID_Exists(data.player.uid)) {
            players[getIndexByUID(data.player.uid)].deathnote = data.deathnoteText;
        }
    }
}
function start() {
    for (var i = 0; i < players.length; i++) {
        if (players[i].username == "") {
            players.splice(i, 1);
            i--;
        }
    }
    var _roleslist;
    _roleslist = rolePicker.getRoles(Object.keys(players).length);
    _roleslist = rolePicker.checkValidation(_roleslist);
    _roleslist.shuffle();
    var j = 0;
    var mafList = [];
    var vampList = [];
    var _nameList = [];
    for (var i = 0; i < players.length; i++) {
        classifyPlayer(i, _roleslist[j].name, players[i].username);
        players[i].role = _roleslist[j];
        voteList[i] = new VoteInfo();
        if (players[i].role.team == "mafia") {
            mafList.push(players[i]);
        }
        else if (players[i].role.name == roles.Vampire.name) {
            vampList.push(players[i]);
        }
        _nameList.push(players[i].username);
        j++;
    }
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "mafia") {
            players[i].mafiaList = mafList;
        }
        else if (players[i].role.name == roles.Vampire.name) {
            players[i].vampireList = vampList;
        }
        players[i].nameList = _nameList;
    }
    for (var i = 0; i < players.length; i++) {
        var _namelist2 = arrToObj(_nameList);
        if (players[i].role.team == "mafia") {
            var _maflist = new Object();
            for (var j = 0; j < players[i].mafiaList.length; j++) {
                _maflist[j] = { role: players[i].mafiaList[j].role, username: players[i].mafiaList.username, uid: players[i].mafiaList.uid, inJail: players[i].mafiaList.inJail, targetPlayer: players[i].targetPlayer };
            }
            sendToSocketId("startGame", {
                player: { role: players[i].role, username: players[i].username, uid: players[i].uid, inJail: players[i].inJail, mafiaList: _maflist, targetPlayer: players[i].targetPlayer },
                roles: roles,
                nameList: _namelist2
            }, players[i].socketid);
        }
        else if (players[i].role.name == roles.Vampire.name) {
            var _vamplist = new Object();
            for (var j = 0; j < players[i].vampireList.length; j++) {
                _vamplist[j] = { role: players[i].vampireList[j].role, username: players[i].vampireList[j].username, uid: players[i].vampireList[j].uid, inJail: players[i].vampireList[j].inJail, targetPlayer: players[i].targetPlayer };
            }
            sendToSocketId("startGame", {
                player: { role: players[i].role, username: players[i].username, uid: players[i].uid, inJail: players[i].inJail, vampireList: _vamplist, targetPlayer: players[i].targetPlayer },
                roles: roles,
                nameList: _namelist2
            }, players[i].socketid);
        }
        else {
            sendToSocketId("startGame", {
                player: { role: players[i].role, username: players[i].username, uid: players[i].uid, inJail: players[i].inJail, targetPlayer: players[i].targetPlayer },
                roles: roles,
                nameList: _namelist2
            }, players[i].socketid);
        }
    }
    discussion();
}
function arrToObj(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] != undefined) {
            rv[i] = arr[i];
        }
    }
    return rv;
}
function classifyPlayer(index, rolename, _username) {
    if (_username === void 0) { _username = ""; }
    var temp_uid = players[index].uid;
    var temp_socketid = players[index].socketid;
    var temp_usrname = players[index].username;
    switch (rolename) {
        case "Troll":
            players[index] = new Troll(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Jailor":
            players[index] = new Jailor(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Medium":
            players[index] = new Medium(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Transporter":
            players[index] = new Transporter(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Witch":
            players[index] = new Witch(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Veteran":
            players[index] = new Veteran(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Escort":
            players[index] = new Escort(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Consort":
            players[index] = new Consort(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Doctor":
            players[index] = new Doctor(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Janitor":
            players[index] = new Janitor(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Retributionist":
            players[index] = new Retributionist(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Forger":
            players[index] = new Forger(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Consigliere":
            players[index] = new Consigliere(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Blackmailer":
            players[index] = new Blackmailer(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Framer":
            players[index] = new Framer(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Bodyguard":
            players[index] = new Bodyguard(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Godfather":
            players[index] = new Godfather(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Mafioso":
            players[index] = new Mafioso(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "SerialKiller":
            players[index] = new SerialKiller(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "VampireHunter":
            players[index] = new VampireHunter(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Jester":
            players[index] = new Jester(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Vigilante":
            players[index] = new Vigilante(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Disguiser":
            players[index] = new Disguiser(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Amnesiac":
            players[index] = new Amnesiac(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Arsonist":
            players[index] = new Arsonist(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Survivor":
            players[index] = new Survivor(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Sheriff":
            players[index] = new Sheriff(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Lookout":
            players[index] = new Lookout(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Investigator":
            players[index] = new Investigator(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Vampire":
            players[index] = new Vampire(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Werewolf":
            players[index] = new Werewolf(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Executioner":
            players[index] = new Executioner(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
        case "Spy":
            players[index] = new Spy(temp_uid, temp_socketid, temp_usrname);
            players[index].username = _username;
            break;
    } //TODO: add troll
}
Array.prototype.shuffle = function () {
    var input = this;
    for (var i = input.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
};
function getArrayIndexByRole(role) {
    var arr = [];
    for (var i = 0; i < players.length; i++) {
        if (role == players[i].role.name && !players[i].isded) {
            arr.push(i);
        }
    }
    return arr;
}
function addPlayer(uid, socketid) {
    var p = new Player(uid, socketid);
    p.roleList = roles;
    players.push(p);
}
var VoteInfo = (function () {
    function VoteInfo() {
        this.votingTo = null;
        this.votesToMe = 0;
    }
    return VoteInfo;
}());
function goingToKill(killerUN, targetUN) {
    var bgs = [];
    var docs = [];
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.name == roles.Bodyguard.name) {
            if (players[i].targetPlayer == targetUN && players[i].usingAbility) {
                bgs.push(i);
            }
        }
        else if (players[i].role.name == roles.Doctor.name) {
            if (players[i].targetPlayer == targetUN && players[i].usingAbility) {
                docs.push(i);
            }
        }
    }
    if (bgs.length != 0) {
        if (docs.length != 0) {
            for (var indx = 0; indx < docs.length; i++) {
                alertMessage("Your target was attacked last night!", players[indx].socketid);
            }
        }
        var bg_docs = [];
        var attacker_docs = [];
        var rand_bg_indx = Math.floor(Math.random() * bgs.length);
        var attacker_index = getIndexByUsername(killerUN);
        players[bgs[rand_bg_indx]].usingAbility = false;
        alertMessage("You were attacked last night but a Bodyguard fought off your attacker!", players[bgs[rand_bg_indx]].socketid);
        for (var i = 0; i < players.length; i++) {
            if (players[i].role.name == roles.Doctor.name && players[i].usingAbility && players[i].targetPlayer == players[bgs[rand_bg_indx]].username) {
                bg_docs.push[i];
            }
            else if (players[i].role.name == roles.Doctor.name && players[i].usingAbility && players[i].targetPlayer == players[attacker_index].username) {
                attacker_docs.push(i);
            }
        }
        if (bg_docs.length == 0) {
            players[bgs[rand_bg_indx]].diedTonight = true;
            players[bgs[rand_bg_indx]].howIDied = players[getIndexByUsername(killerUN)].deathnote;
            alertMessage("You were attacked protecting your target", players[bgs[rand_bg_indx]].socketid);
        }
        else {
            for (var i = 0; i < bg_docs.length; i++) {
                alertMessage("Your target was attacked!", players[bg_docs[i]].socketid);
            }
        }
        if (attacker_docs.length == 0) {
            players[attacker_index].diedTonight = true;
            players[attacker_index].howIDied = players[bgs[rand_bg_indx]].deathnote;
            alertMessage("You were killed by a Bodyguard!", players[getIndexByUsername(killerUN)].socketid);
        }
        else {
            for (var i = 0; i < attacker_docs.length; i++) {
                alertMessage("Your target was attacked!", players[attacker_docs[i]].socketid);
            }
        }
    }
    else if (docs.length != 0) {
        for (var indx = 0; indx < docs.length; i++) {
            alertMessage("Your target was attacked last night!", players[indx].socketid);
        }
        alertMessage("You were attacked but someone nursed you back to health!", players[getIndexByUsername(targetUN)].socketid);
    }
    else {
        players[getIndexByUsername(targetUN)].diedTonight = true;
        players[getIndexByUsername(targetUN)].howIDied = players[getIndexByUsername(killerUN)].deathnote;
    }
}
var Player = (function () {
    //add priority
    function Player(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        this.roleList = [];
        this.nameList = [];
        this.username = "";
        this.isded = false;
        this.hanged = false;
        this.roleBlocked = false; //check if needed
        this.blackmailed = false;
        this.inJail = false;
        this.cleaned = false;
        this.framed = false;
        this.witched = false;
        this.forged = false;
        this.usingAbility = false;
        this.abilityCounter = 0;
        this.targetPlayer = "";
        this.will = ""; //check if needed + deathnote
        this.howIDied = "";
        this.diedTonight = false;
        this.uid = _uid;
        this.socketid = _socketid;
        this.username = usrname;
        this.abilityCounter = 0;
        this.usingAbility = false;
    }
    return Player;
}());
function getJailedIndex() {
    for (var i = 0; i < players.length; i++) {
        if (players[i].inJail) {
            return i;
        }
    }
    return -1;
}
var Jailor = (function (_super) {
    __extends(Jailor, _super);
    function Jailor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    Jailor.prototype.useAbility = function () {
        var jailedTargetIndex = getJailedIndex();
        if (jailedTargetIndex != -1 && players[jailedTargetIndex].role.name != "Troll" && dayCounter > 1) {
            if (players[jailedTargetIndex].username == this.targetPlayer && !this.roleBlocked && this.abilityCounter < this.role.abilitylimit) {
                alertMessage("You were executed by the Jailor", players[jailedTargetIndex].socketid);
                this.usingAbility = true;
                players[getIndexByUsername(this.targetPlayer)].diedTonight = true;
                players[getIndexByUsername(this.targetPlayer)].howIDied = this.deathnote;
                this.abilityCounter++;
                if (players[getIndexByUsername(this.targetPlayer)].role.team == "town") {
                    this.abilityCounter = 3;
                }
            }
        }
    };
    return Jailor;
}(Player));
var Medium = (function (_super) {
    __extends(Medium, _super);
    function Medium(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Medium;
}(Player));
var Transporter = (function (_super) {
    __extends(Transporter, _super);
    function Transporter(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.target2 = ""; //for button2
    }
    Transporter.prototype.useAbility = function () {
        //TODO: what happens when you transport someone with a ww on rampage in his own house. read wiki page
        //else if this happens ^ and add else if to bottom statement \.'./
        if (this.targetPlayer != "" && this.target2 != "") {
            if (!players[getIndexByUsername(this.targetPlayer)].inJail && !players[getIndexByUsername(this.target2)].inJail) {
                this.usingAbility = true;
                var homeRampageWW1 = (players[getIndexByUsername(this.targetPlayer)].role.name == roles.Werewolf.name && players[getIndexByUsername(this.targetPlayer)].targetPlayer == this.targetPlayer
                    && !players[getIndexByUsername(this.targetPlayer)].roleBlocked);
                var homeRampageWW2 = (players[getIndexByUsername(this.target2)].role.name == roles.Werewolf.name && players[getIndexByUsername(this.target2)].targetPlayer == this.target2
                    && !players[getIndexByUsername(this.target2)].roleBlocked);
                if (homeRampageWW1 && dayCounter % 2 == 0) {
                    players[getIndexByUsername(this.target2)].isded = true;
                }
                if (homeRampageWW2 && dayCounter % 2 == 0) {
                    players[getIndexByUsername(this.targetPlayer)].isded = true;
                }
                for (var i = 0; i < players.length; i++) {
                    if (players[i].targetPlayer == this.targetPlayer && players[i].role.name != roles.Survivor.name && players[i].role.name != roles.Veteran.name && !homeRampageWW1) {
                        players[i].targetPlayer = this.target2;
                    }
                    else if (players[i].targetPlayer == this.target2 && players[i].role.name != roles.Survivor.name && players[i].role.name != roles.Veteran.name && !homeRampageWW2) {
                        players[i].targetPlayer = this.targetPlayer;
                    }
                }
                if (!homeRampageWW1) {
                    alertMessage("You were transported to another location.", players[getIndexByUsername(this.targetPlayer)].socketid);
                }
                if (!homeRampageWW2) {
                    alertMessage("You were transported to another location.", players[getIndexByUsername(this.target2)].socketid);
                }
            }
        }
    };
    return Transporter;
}(Player));
var Witch = (function (_super) {
    __extends(Witch, _super);
    function Witch(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.target2 = "";
    }
    Witch.prototype.useAbility = function () {
        if (players[getIndexByUsername(this.targetPlayer)].role.name != roles.Transporter.name
            && players[getIndexByUsername(this.targetPlayer)].role.name != roles.Veteran.name && !players[getIndexByUsername(this.targetPlayer)].roleBlocked) {
            var target_p = players[getIndexByUsername(this.targetPlayer)];
            if (target_p.inJail) {
                alertMessage("Someone tried to control you, but you are jailed!", players[getIndexByUsername(this.targetPlayer)].socketid);
                alertMessage("One of your targets is jailed!", this.socketid);
            }
            else {
                if (target_p.role.name == roles.Jailor.name) {
                    if (target_p.abilityCounter < target_p.role.abilitylimit) {
                        if (players[getIndexByUsername(this.target2)].inJail) {
                            players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.target2;
                        }
                        else {
                            players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
                        }
                        alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                    }
                }
                else if (target_p.role.name == roles.Retributionist.name) {
                    players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
                    players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.target2;
                    players[getIndexByUsername(this.targetPlayer)].witched = true;
                    alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                }
                else if (target_p.role.name == roles.Medium.name) {
                    players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.target2;
                    players[getIndexByUsername(this.targetPlayer)].witched = true;
                    alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                }
                else if (target_p.role.name == roles.Jester.name) {
                    players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.target2;
                    players[getIndexByUsername(this.targetPlayer)].witched = true;
                    alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                }
                else if (target_p.role.name == roles.Amnesiac.name) {
                    players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
                    players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.target2;
                    players[getIndexByUsername(this.targetPlayer)].witched = true;
                    alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                }
                else if (target_p.role.name == roles.Survivor.name) {
                    if (target_p.abilityCounter < target_p.role.abilitylimit) {
                        players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.targetPlayer;
                        players[getIndexByUsername(this.targetPlayer)].witched = true;
                        alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                        players[getIndexByUsername(this.targetPlayer)].useAbility();
                    }
                }
                else if (target_p.role.name == roles.Werewolf.name) {
                    if (!players[getIndexByUsername(this.targetPlayer)].roleBlocked && players[getIndexByUsername(this.targetPlayer)].targetPlayer != ""
                        && players[getIndexByUsername(this.targetPlayer)].targetPlayer != players[getIndexByUsername(this.targetPlayer)].username) {
                        players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.targetPlayer;
                        players[getIndexByUsername(this.targetPlayer)].witched = true;
                        alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                        players[getIndexByUsername(this.targetPlayer)].useAbility();
                    }
                }
                else if (target_p.role.priority != 0) {
                    players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.target2;
                    players[getIndexByUsername(this.targetPlayer)].witched = true;
                    alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                    players[getIndexByUsername(this.targetPlayer)].useAbility();
                }
            }
        }
        else if (players[getIndexByUsername(this.targetPlayer)].role.name == roles.Transporter.name || players[getIndexByUsername(this.targetPlayer)].role.name == roles.Veteran.name) {
            alertMessage("A Witch tried to control you but you are immune.", players[getIndexByUsername(this.targetPlayer)].socketid);
        }
    };
    return Witch;
}(Player));
var Veteran = (function (_super) {
    __extends(Veteran, _super);
    function Veteran(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    Veteran.prototype.useAbility = function () {
        if (this.abilityCounter < this.role.abilitylimit) {
            this.abilityCounter++;
            var all_docs = getArrayIndexByRole("Doctor");
            this.usingAbility = true;
            for (var i = 0; i < players.length; i++) {
                if (players[i].targetPlayer == this.username) {
                    alertMessage("You shot someone who visited you last night!", this.socketid);
                    var current_docs = [];
                    for (var j = 0; j < all_docs.length; j++) {
                        if (all_docs[j].targetPlayer == players[i].username && all_docs[j].usingAbility) {
                            current_docs.push(i);
                        }
                    }
                    if (current_docs.length == 0) {
                        players[i].diedTonight = true;
                        players[i].howIDied = this.deathnote;
                    }
                    else {
                        for (var k = 0; k < current_docs.length; k++) {
                            alertMessage("Your target has been attacked!", players[all_docs[current_docs[k]]].socketid);
                        }
                        alertMessage("You were attacked but someone nursed you back to health!", players[i].socketid);
                    }
                }
            }
        }
    };
    return Veteran;
}(Player));
var Escort = (function (_super) {
    __extends(Escort, _super);
    function Escort(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Escort.prototype.useAbility = function () {
        var target_p = players[getIndexByUsername(this.targetPlayer)];
        if (target_p.role.name == roles.Veteran.name || target_p.role.name == roles.Witch.name || target_p.role.name == roles.Transporter.name
            || target_p.role.name == roles.Consort.name || target_p.role.name == roles.Escort.name || target_p.role.name == roles.Troll.name) {
            alertMessage("Someone tried to role block you but you are immune!", target_p.socketid);
        }
        else if (!target_p.inJail) {
            this.usingAbility = true;
            players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
            alertMessage("Someone occupied your night. You were role blocked!", target_p.socketid);
        }
    };
    return Escort;
}(Player));
var Consort = (function (_super) {
    __extends(Consort, _super);
    function Consort(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Consort.prototype.useAbility = function () {
        var target_p = players[getIndexByUsername(this.targetPlayer)];
        if (target_p.role.name == roles.Veteran.name || target_p.role.name == roles.Witch.name || target_p.role.name == roles.Transporter.name
            || target_p.role.name == roles.Consort.name || target_p.role.name == roles.Escort.name || target_p.role.name == roles.Troll.name) {
            alertMessage("Someone tried to role block you but you are immune!", target_p.socketid);
        }
        else if (!target_p.inJail) {
            this.usingAbility = true;
            players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
            alertMessage("Someone occupied your night. You were role blocked!", target_p.socketid);
        }
    };
    return Consort;
}(Player));
var Doctor = (function (_super) {
    __extends(Doctor, _super);
    function Doctor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.success_heal = false;
    }
    Doctor.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            if (this.targetPlayer == this.username) {
                if (this.abilityCounter < this.role.abilitylimit) {
                    this.usingAbility = true;
                    this.abilityCounter++;
                }
            }
            else if (!(players[getIndexByUsername(this.targetPlayer)].role.name == roles.Mayor.name && players[getIndexByUsername(this.targetPlayer)].abilityCounter != 0)) {
                this.usingAbility = true;
            }
        }
    };
    return Doctor;
}(Player));
var Janitor = (function (_super) {
    __extends(Janitor, _super);
    function Janitor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Janitor.prototype.useAbility = function () {
        if (!this.roleBlocked && this.abilityCounter < this.role.abilitylimit) {
            this.usingAbility = true;
            this.abilityCounter++;
            players[getIndexByUsername(this.targetPlayer)].cleaned = true;
        }
    };
    return Janitor;
}(Player));
var Retributionist = (function (_super) {
    __extends(Retributionist, _super);
    function Retributionist(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Retributionist.prototype.useAbility = function () {
        if (players[getIndexByUsername(this.targetPlayer)].role.team == "town"
            && !players[getIndexByUsername(this.targetPlayer)].cleaned && !this.roleBlocked && players[getIndexByUsername(this.targetPlayer)].isded) {
            classifyPlayer(getIndexByUID(players[getIndexByUsername(this.targetPlayer)].uid), players[getIndexByUsername(this.targetPlayer)].role.name);
            this.abilityCounter++;
            sendEmit("getMessage", {
                username: "",
                message: this.targetPlayer + " has been resurrected!"
            });
        }
    };
    return Retributionist;
}(Player));
var Forger = (function (_super) {
    __extends(Forger, _super);
    function Forger(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.forgedWill = "";
    }
    Forger.prototype.useAbility = function () {
        if (!this.roleBlocked && this.abilityCounter < this.role.abilitylimit) {
            this.usingAbility = true;
            players[getIndexByUsername(this.targetPlayer)].forged = true;
            this.abilityCounter++;
        }
    };
    return Forger;
}(Player));
var Consigliere = (function (_super) {
    __extends(Consigliere, _super);
    function Consigliere(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Consigliere.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            alertMessage(players[getIndexByUsername(this.targetPlayer)].role.cons_result, this.socketid);
        }
    };
    return Consigliere;
}(Player));
var Blackmailer = (function (_super) {
    __extends(Blackmailer, _super);
    function Blackmailer(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Blackmailer.prototype.useAbility = function () {
        if (!this.roleBlocked && !players[getIndexByUsername(this.targetPlayer)].inJail) {
            this.usingAbility = true;
            players[getIndexByUsername(this.targetPlayer)].blackmailed = true;
        }
    };
    return Blackmailer;
}(Player));
var Framer = (function (_super) {
    __extends(Framer, _super);
    function Framer(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Framer.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            this.usingAbility = true;
            players[getIndexByUsername(this.targetPlayer)].framed = true;
        }
    };
    return Framer;
}(Player));
var Bodyguard = (function (_super) {
    __extends(Bodyguard, _super);
    function Bodyguard(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Bodyguard.prototype.useAbility = function () {
        if (!this.roleBlocked && !players[getIndexByUsername(this.targetPlayer)].inJail) {
            if (this.targetPlayer == this.username) {
                if (this.abilityCounter < this.role.abilitylimit) {
                    this.usingAbility = true;
                    this.abilityCounter++;
                }
            }
            else {
                this.usingAbility = true;
            }
        }
    };
    return Bodyguard;
}(Player));
var Godfather = (function (_super) {
    __extends(Godfather, _super);
    function Godfather(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    Godfather.prototype.useAbility = function () {
        var indx = getIndexByUsername(this.targetPlayer);
        if (!this.roleBlocked) {
            var mafioso_index = -1;
            for (var i = 0; i < this.mafiaList.length; i++) {
                if (this.mafiaList[i].role.name == roles.Mafioso.name && !players[getIndexByUsername(this.mafiaList[i].username)].roleBlocked) {
                    mafioso_index = i;
                }
            }
            if (mafioso_index == -1) {
                if (isNightImmune(getIndexByUsername(this.targetPlayer))) {
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].role.name == roles.Doctor.name && players[i].targetPlayer == this.targetPlayer && players[i].usingAbility) {
                            alertMessage("Your target was attacked!", players[i].socketid);
                        }
                    }
                    alertMessage("Your target was immune to your attack!", this.socketid);
                    alertMessage("Someone tried to attack you but you are immune at night!", players[getIndexByUsername(this.targetPlayer)].socketid);
                }
                else {
                    goingToKill(this.username, this.targetPlayer);
                }
            }
            else {
                players[mafioso_index].targetPlayer = this.targetPlayer;
            }
        }
    };
    return Godfather;
}(Player));
function isNightImmune(index) {
    return (players[index].role.name == roles.Veteran.name && players[index].targetPlayer == players[index].username)
        || players[index].role.name == roles.Werewolf.name || players[index].role.name == roles.Godfather.name || players[index].role.name == roles.Arsonist.name
        || players[index].role.name == roles.SerialKiller.name || (players[index].role.name == roles.Bodyguard.name && players[index].targetPlayer == players[index].username && players[index].usingAbility)
        || (players[index].role.name == roles.Survivor.name && players[index].targetPlayer == players[index].username && players[index].usingAbility) || players[index].role.name == roles.Executioner.name
        || players[index].inJail || players[index].role.name == roles.Troll.name;
}
var Mafioso = (function (_super) {
    __extends(Mafioso, _super);
    function Mafioso(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    Mafioso.prototype.useAbility = function () {
        var indx = getIndexByUsername(this.targetPlayer);
        //if not roleblocked and not attacking role that cannot die tonight
        if (!this.roleBlocked) {
            if (isNightImmune(getIndexByUsername(this.targetPlayer))) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].role.name == roles.Doctor.name && players[i].targetPlayer == this.targetPlayer && players[i].usingAbility) {
                        alertMessage("Your target was attacked!", players[i].socketid);
                    }
                }
                alertMessage("Your target was immune to your attack!", this.socketid);
                alertMessage("Someone tried to attack you but you are immune at night!", players[getIndexByUsername(this.targetPlayer)].socketid);
            }
            else {
                goingToKill(this.username, this.targetPlayer);
            }
        }
    };
    return Mafioso;
}(Player));
var SerialKiller = (function (_super) {
    __extends(SerialKiller, _super);
    function SerialKiller(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    SerialKiller.prototype.useAbility = function () {
        if (this.inJail) {
            if (!players[getArrayIndexByRole("Jailor")[0]].usingAbility) {
                goingToKill(this.username, players[getArrayIndexByRole("Jailor")[0]].username);
            }
            if (this.roleBlocked) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].targetPlayer == this.username && (players[i].role.name == roles.Escort.name || players[i].role.name == roles.Consort.name)) {
                        goingToKill(this.username, players[i].username);
                    }
                }
            }
        }
        else if (this.roleBlocked) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].targetPlayer == this.username && (players[i].role.name == roles.Escort.name || players[i].role.name == roles.Consort.name)) {
                    goingToKill(this.username, players[i].username);
                    alertMessage("Someone role blocked you, so you attacked them!", this.socketid);
                    if (this.targetPlayer == players[i].username) {
                        alertMessage("you were attacked by a Serial Killer", players[i].socketid);
                    }
                    else {
                        alertMessage("you were attacked by the Serial Killer you visited", players[i].socketid);
                    }
                }
            }
        }
        else {
            if (isNightImmune(getIndexByUsername(this.targetPlayer))) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].role.name == roles.Doctor.name && players[i].targetPlayer == this.targetPlayer && players[i].usingAbility) {
                        alertMessage("Your target was attacked!", players[i].socketid);
                    }
                }
                alertMessage("Your target was immune to your attack!", this.socketid);
                alertMessage("Someone tried to attack you but you are immune at night!", players[getIndexByUsername(this.targetPlayer)].socketid);
            }
            else {
                goingToKill(this.username, this.targetPlayer);
            }
        }
    };
    return SerialKiller;
}(Player));
var VampireHunter = (function (_super) {
    __extends(VampireHunter, _super);
    function VampireHunter(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    VampireHunter.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            if (players[getIndexByUsername(this.targetPlayer)].role.name == roles.Vampire.name) {
                goingToKill(this.username, this.targetPlayer);
            }
        }
    };
    return VampireHunter;
}(Player));
var Jester = (function (_super) {
    __extends(Jester, _super);
    function Jester(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Jester.prototype.useAbility = function () {
        if (this.diedToday) {
            players[getIndexByUsername(this.targetPlayer)].diedTonight = true;
            this.diedToday = false;
            sendToSocketId('jesterHanged', {
                jester_hanged_today: false
            }, players[getIndexByUID(playerOnTrial.uid)].socketid);
        }
    };
    return Jester;
}(Player));
var Vigilante = (function (_super) {
    __extends(Vigilante, _super);
    function Vigilante(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
        this.willDie = false; //if kills town
    }
    Vigilante.prototype.useAbility = function () {
        if ((dayCounter > 1 || this.witched) && this.abilityCounter < this.role.abilitylimit && !this.roleBlocked) {
            var index = getIndexByUsername(this.targetPlayer);
            if (isNightImmune(index)) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].role.name == roles.Doctor.name && players[i].targetPlayer == players[index].username && players[i].usingAbility) {
                        alertMessage("Your target was attacked!", players[i].socketid);
                    }
                }
            }
            else {
                goingToKill(this.username, this.targetPlayer);
            }
        }
    };
    return Vigilante;
}(Player));
var Disguiser = (function (_super) {
    __extends(Disguiser, _super);
    function Disguiser(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Disguiser.prototype.useAbility = function () {
        if (players[getIndexByUsername(this.targetPlayer)].diedTonight && this.abilityCounter < this.role.abilitylimit && !this.roleBlocked) {
            this.usingAbility = true;
            var myun = this.username;
            var targetun = players[getIndexByUsername(this.targetPlayer)].username;
            var temp = players[getIndexByUsername(this.targetPlayer)];
            var targetindex = getIndexByUsername(this.targetPlayer);
            var myindex = getIndexByUsername(this.username);
            players[targetindex] = this;
            players[myindex] = temp;
            players[myindex].username = myun;
            players[targetindex].username = targetun;
        }
    };
    return Disguiser;
}(Player));
var Amnesiac = (function (_super) {
    __extends(Amnesiac, _super);
    function Amnesiac(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Amnesiac.prototype.useAbility = function () {
        if (this.abilityCounter < this.role.abilitylimit && !this.roleBlocked && !this.diedTonight && players[getIndexByUsername(this.targetPlayer)].role.name != roles.Mafioso.name
            && !players[getIndexByUsername(this.targetPlayer)].role.unique) {
            this.role = players[getIndexByUsername(this.targetPlayer)].role;
            classifyPlayer(getIndexByUID(this.uid), this.role.name);
            sendEmit("getMessage", {
                username: "",
                message: "An Amnesiac remembered he was a " + this.role.name
            });
        }
    };
    return Amnesiac;
}(Player));
var Arsonist = (function (_super) {
    __extends(Arsonist, _super);
    function Arsonist(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
        this.dousedTarget = "";
        this.cleanYourself = false;
        this.ignite = false;
    }
    Arsonist.prototype.useAbility = function () {
        if (!this.roleBlocked && !this.inJail) {
            this.usingAbility = true;
            if (this.targetPlayer == "") {
                this.cleanYourself = true;
            }
            else if (this.targetPlayer == this.username) {
                this.ignite = true;
            }
            else {
                var bgs = [];
                for (var i = 0; i < players.length; i++) {
                    if (players[i].role.name == roles.Bodyguard.name) {
                        if (players[i].targetPlayer == this.targetPlayer && players[i].usingAbility) {
                            bgs.push(i);
                        }
                    }
                }
                if (bgs.length != 0) {
                    var bg_docs = [];
                    var attacker_docs = [];
                    var rand_bg_indx = Math.floor(Math.random() * bgs.length);
                    var attacker_index = getIndexByUsername(this.username);
                    players[bgs[rand_bg_indx]].usingAbility = false;
                    alertMessage("You were attacked last night but a Bodyguard fought off your attacker!", players[bgs[rand_bg_indx]].socketid);
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].role.name == roles.Doctor.name && players[i].usingAbility && players[i].targetPlayer == players[bgs[rand_bg_indx]].username) {
                            bg_docs.push[i];
                        }
                        else if (players[i].role.name == roles.Doctor.name && players[i].usingAbility && players[i].targetPlayer == players[attacker_index].username) {
                            attacker_docs.push(i);
                        }
                    }
                    if (bg_docs.length == 0) {
                        players[bgs[rand_bg_indx]].diedTonight = true;
                        players[bgs[rand_bg_indx]].howIDied = this.deathnote;
                        alertMessage("You were attacked protecting your target", players[bgs[rand_bg_indx]].socketid);
                    }
                    else {
                        for (var i = 0; i < bg_docs.length; i++) {
                            alertMessage("Your target was attacked!", players[bg_docs[i]].socketid);
                        }
                    }
                    if (attacker_docs.length == 0) {
                        players[attacker_index].diedTonight = true;
                        players[attacker_index].howIDied = players[bgs[rand_bg_indx]].deathnote;
                        alertMessage("You were killed by a Bodyguard!", players[getIndexByUsername(this.username)].socketid);
                    }
                    else {
                        for (var i = 0; i < attacker_docs.length; i++) {
                            alertMessage("Your target was attacked!", players[attacker_docs[i]].socketid);
                        }
                    }
                }
                else {
                    if (!players[getIndexByUsername(this.targetPlayer)].inJail) {
                        this.dousedTarget = this.targetPlayer;
                    }
                    else {
                        alertMessage("Your target was immune to your attack!", this.socketid);
                    }
                }
            }
        }
    };
    return Arsonist;
}(Player));
var Survivor = (function (_super) {
    __extends(Survivor, _super);
    function Survivor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Survivor.prototype.useAbility = function () {
        if (this.abilityCounter < this.role.abilitylimit && !this.roleBlocked) {
            this.abilityCounter++;
            this.usingAbility = true;
        }
    };
    return Survivor;
}(Player));
var Sheriff = (function (_super) {
    __extends(Sheriff, _super);
    function Sheriff(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Sheriff.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            if (players[getIndexByUsername(this.targetPlayer)].framed) {
                alertMessage("Your target is a member of the Mafia.", this.socketid);
            }
            else {
                if (players[getIndexByUsername(this.targetPlayer)].role.name == roles.SerialKiller.name) {
                    alertMessage("Your target is a Serial Killer!", this.socketid);
                }
                else if (players[getIndexByUsername(this.targetPlayer)].role.name == roles.Werewolf.name && dayCounter % 2 == 0) {
                    alertMessage("Your target is a Werewolf.", this.socketid);
                }
                else {
                    alertMessage("Your target is not suspicious.", this.socketid);
                }
            }
        }
    };
    return Sheriff;
}(Player));
var Lookout = (function (_super) {
    __extends(Lookout, _super);
    function Lookout(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Lookout.prototype.useAbility = function () {
        for (var i = 0; i < players.length; i++) {
            if (players[i].targetPlayer == this.targetPlayer) {
                var doc_onself = players[i].role.name == roles.Doctor.name && players[i].targetPlayer == players[i].username && players[i].usingAbility;
                var bg_onself = players[i].role.name == roles.Bodyguard.name && players[i].targetPlayer == players[i].username && players[i].usingAbility;
                if (this.username != players[i].username && !(players[i].role.name == roles.Disguiser.name && players[i].usingAbility) &&
                    (players[i].targetPlayer != players[i].username || doc_onself || bg_onself)) {
                    alertMessage(players[i].username + " visited your target last night!", this.socketid);
                }
            }
        }
    };
    return Lookout;
}(Player));
var Investigator = (function (_super) {
    __extends(Investigator, _super);
    function Investigator(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Investigator.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            if (players[getIndexByUsername(this.targetPlayer)].framed) {
                alertMessage("Your target may not be what they seem. They could be: Framer/Vampire/Jester", this.socketid);
            }
            else {
                alertMessage(players[getIndexByUsername(this.targetPlayer)].role.invest_result, this.socketid);
            }
        }
    };
    return Investigator;
}(Player));
var Vampire = (function (_super) {
    __extends(Vampire, _super);
    function Vampire(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.youngest = false;
    }
    Vampire.prototype.useAbility = function () {
    };
    return Vampire;
}(Player));
var Werewolf = (function (_super) {
    __extends(Werewolf, _super);
    function Werewolf(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    Werewolf.prototype.useAbility = function () {
        alertMessage("The light of the full moon has caused you to turn into a rampaging Werewolf!", this.socketid);
        if (this.inJail) {
            if (!players[getArrayIndexByRole("Jailor")[0]].usingAbility) {
                goingToKill(this.username, players[getArrayIndexByRole("Jailor")[0]].username);
                for (var i = 0; i < players.length; i++) {
                    if (players[i].targetPlayer == players[getArrayIndexByRole("Jailor")[0]].username && players[i].usingAbility) {
                        goingToKill(this.username, players[i].username);
                    }
                }
            }
        }
        else {
            if (this.targetPlayer == "" || this.roleBlocked) {
                this.targetPlayer = this.username;
                if (this.roleBlocked) {
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].targetPlayer == this.username && (players[i].role.name == roles.Escort.name || players[i].role.name == roles.Consort.name)) {
                            goingToKill(this.username, players[i].username);
                        }
                    }
                }
            }
            if (this.targetPlayer == this.username) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].targetPlayer == this.username) {
                        if (players[i].role.name == roles.Bodyguard.name) {
                            goingToKill(players[i].username, this.username);
                        }
                        goingToKill(this.username, players[i].username);
                    }
                }
            }
            else {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].targetPlayer == this.targetPlayer) {
                        goingToKill(this.username, players[i].username);
                    }
                }
            }
        }
    };
    return Werewolf;
}(Player));
var Executioner = (function (_super) {
    __extends(Executioner, _super);
    function Executioner(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.target = "";
        this.target = getExecutionerTarget();
    }
    return Executioner;
}(Player));
var Troll = (function (_super) {
    __extends(Troll, _super);
    function Troll(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Troll;
}(Player));
var Spy = (function (_super) {
    __extends(Spy, _super);
    function Spy(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    Spy.prototype.useAbility = function () {
        if (!this.roleBlocked) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].role.team == "mafia" && !players[i].isded && players[i].usingAbility) {
                    alertMessage(players[i].username + "visited " + players[i].targetPlayer + " last night", this.socketid);
                }
            }
        }
    };
    return Spy;
}(Player));
function getExecutionerTarget() {
    var possible_targets = [];
    for (var i = 0; i < players.length; i++) {
        if (players[i].role.team == "town" && players[i].role.name != roles.Mayor.name && players[i].role.name != roles.Spy.name && !players[i].isded) {
            possible_targets.push(players[i].username);
        }
    }
    return possible_targets[Math.floor(Math.random() * possible_targets.length)];
}
function checkUserName(data) {
    console.log('raeched here ');
    if (data.hasOwnProperty("usr") && data.hasOwnProperty("uid")) {
        if (data.usr == "") {
            sendEmit("requestUserNCallBack", {
                flag: true,
                usr: data.usr,
                uid: data.uid
            });
            return false;
        }
        for (var i = 0; i < players.length; i++) {
            var player2 = players[i];
            if (player2.username == data.usr) {
                sendEmit("requestUserNCallBack", {
                    flag: true,
                    usr: data.usr,
                    uid: data.uid
                });
                return false;
            }
        }
        for (var i = 0; i < players.length; i++) {
            if (players[i].uid == data.uid) {
                players[i].username = data.usr;
            }
        }
        sendEmit("requestUserNCallBack", {
            flag: false,
            usr: data.usr,
            uid: data.uid
        });
        displayUsers();
    }
}
function displayUsers() {
    var disp = document.getElementById("usersInGame");
    disp.innerHTML = "";
    for (var i = 0; i < players.length; i++) {
        if (players[i].username != "") {
            disp.innerHTML += "<a class='playerWait' onclick='removePlayer(\"" + i + "\")'>" + players[i].username + "</a></br>";
        }
    }
}
function removePlayer(index) {
    players.splice(index, 1);
    displayUsers();
}
