declare function require(name: string);
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

var phase = "Discussion";

var isDay = true;
var dayCounter = 0;

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
            } else {
                voting();
            }
            return;
        }
    }, 1000);
}

function voting() { //everyone alive can vote
    phase = "Voting";
    sendEmit("changePhase", {
        time: votingTimer,
        phase: "Voting"
    });
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

function defense() { //only trailled person can talk
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

function judgement() { //everyone alive can vote
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
            } else {
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


function sendMessageToPlayers(data) { //ALWAYS USE THE NAME PROPERTY
    if (data.hasOwnProperty("message") && data.hasOwnProperty("player")) {
        if (UID_Exists(data.player.uid)) {
            if (phase != "Last Words" && phase != "Defense") {
                var sender_player = players[getIndexByUID(data.player.uid)];
                for (var i = 0; i < players.length; i++) {
                    let temp_player = players[i];
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
                        else if (sender_player.role.name == roles.Jailor.name && temp_player.username == sender_player.targetPlayer) {
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
            else {
                if (playerOnTrial.username == data.player.username) {
                    sendEmit('getMessage', {
                        username: data.player.username + ": ",
                        message: data.message
                    });
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
    var sortedByPriority = players.sort(compare);
    console.log(sortedByPriority);
    for (var i = 0; i < sortedByPriority.length; i++) {
        if (sortedByPriority[i].priority != 0 && (sortedByPriority[i].targetPlayer != "" || sortedByPriority[i].role.name == roles.Werewolf.name)) {
            sortedByPriority[i].useAbility();
        }
    }
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
        if (players[i].role.name == roles.Jailor.name && !players[i].isded) {
            if (players[i].targetPlayer != "") {
                if (!players[getIndexByUsername(players[i].targetPlayer)].isded) {
                    players[getIndexByUsername(players[i].targetPlayer)].inJail = true;
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
                if (phase == "Voting" && data.targetname != players[getIndexByUID(data.player.uid)].username && !players[getIndexByUID(data.player.uid)].isded && !players[getIndexByUsername(data.targetname)].isded) { //voting
                    var i = getIndexByUsername(data.targetname);
                    var playerIndex = getIndexByUID(data.player.uid);
                    if (voteList[playerIndex].votingTo == null) {
                        voteList[playerIndex].votingTo = players[i];
                        if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe += 3;
                        } else {
                            voteList[i].votesToMe++;
                        }
                        sendVotingMessage(data.player.username, data.targetname + ".", " has voted against ");
                    } else if (voteList[playerIndex].votingTo.username != data.targetname) {
                        if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe += 3;
                            voteList[getIndexByUID(voteList[playerIndex].votingTo.uid)].votesToMe -= 3;
                        } else {
                            voteList[i].votesToMe++;
                            voteList[getIndexByUID(voteList[playerIndex].votingTo.uid)].votesToMe--;
                        }
                        voteList[playerIndex].votingTo = players[i];
                        sendVotingMessage(data.player.username, data.targetname + ".", " has changed their vote to ");
                    } else if (voteList[playerIndex].votingTo.username == data.targetname) {
                        if (players[getIndexByUID(data.player.uid)].role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe -= 3;
                        } else {
                            voteList[i].votesToMe--;
                        }
                        voteList[playerIndex].votingTo = null;
                        sendVotingMessage(data.player.username, "", " has canceled their vote.");
                    }
                    shouldGetOnTrial(i);
                } else if (phase == "Judgement") { //judgement
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
            } else { //night
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
                            players[playerIndex].targetPlayer = targetPlayer.username;
                        }
                    }
                }
                else if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Werewolf.name && dayCounter % 2 == 0) {
                    players[playerIndex].targetPlayer = targetPlayer.username;
                }
                else if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Forger.name) {
                    if (data.targetname == abilityPlayer.username && abilityPlayer.targetPlayer != "") {
                        if (data.hasOwnProperty("forgedWill")) {
                            players[playerIndex].willText = data.forgedWill;
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
    if (data.hasOwnProperty("player") && data.hasOwnProperty("targetname")) {
        if (usernameExists(data.targetname) && UID_Exists(data.player.uid)) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid == data.player.uid && !players[i].isded) {
                    players[i].will = data.willText;
                }
            }
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
                        } else {
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
            } else { //night
                var playerIndex = getIndexByUID(data.player.uid);
                var targetIndex = getIndexByUsername(data.targetname);
                var abilityPlayer = players[playerIndex];
                var targetPlayer = players[targetIndex];
                if (!abilityPlayer.isded && abilityPlayer.role.name == roles.Forger.name && abilityPlayer.targetPlayer != "") {
                    players[playerIndex].willText = "";
                    players[playerIndex].targetPlayer = "";
                    alertMessage("Forgery canceled.", abilityPlayer.socketid);
                }
                if (!abilityPlayer.isded && abilityPlayer.role.priority != 0 && (abilityPlayer.role.name == roles.Witch.name || abilityPlayer.role.name == roles.Transporter.name)) { //2nd buttons dont have ability limits
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
        // go on trial
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
    guiltyVoters = [];
    innoVoters = [];
}

function hangPlayer() {
    console.log("about to fucking die baby: " + playerOnTrial.username);
    players[getIndexByUID(playerOnTrial.uid)].hanged = true;
    players[getIndexByUID(playerOnTrial.uid)].isded = true;
    sendVotingMessage(playerOnTrial.username, "", " has died. rip in pepperonies");
    players[getIndexByUID(playerOnTrial.uid)].howIDied = "iz jus a prank, y u heff to b med";
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
    sendEmit("updateDeadList", deadlist);
    // show will and role
    // put in graveyard (2 buttons will and deathnote)
    playerOnTrial = null;
}

function updatePlayerDeathnote(data) {
    if (data.hasOwnProperty("player") && data.hasOwnProperty("targetname")) {
        if (usernameExists(data.targetname) && UID_Exists(data.player.uid)) {
            for (var i = 0; i < players.length; i++) {
                if (data.player.uid == players[i].uid && players[i].role.canKill && !players[i].isded) {
                    players[i].deathnote = data.deathnoteText;
                }
            }
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
        classifyPlayer(i, _roleslist[j]);
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
        var _namelist2 = arrToObj(_nameList)
        if (players[i].role.team == "mafia") {
            var _maflist = new Object();
            for (var j = 0; j < players[i].mafiaList.length; j++) {
                _maflist[j] = { role: players[i].mafiaList[j].role, username: players[i].mafiaList.username, uid: players[i].mafiaList.uid, inJail: players[i].mafiaList.inJail, targetPlayer: players[i].targetPlayer }
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
                _vamplist[j] = { role: players[i].vampireList[j].role, username: players[i].vampireList[j].username, uid: players[i].vampireList[j].uid, inJail: players[i].vampireList[j].inJail, targetPlayer: players[i].targetPlayer }
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
        if (arr[i] != undefined) { //just to make sure
            rv[i] = arr[i];
        }
    }
    return rv;
}

function classifyPlayer(index, rolename) {
    var temp_uid = players[index].uid;
    var temp_socketid = players[index].socketid;
    var temp_usrname = players[index].username;
    switch (rolename) {
        case "Jailor":
            players[index] = new Jailor(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Medium":
            players[index] = new Medium(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Transporter":
            players[index] = new Transporter(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Witch":
            players[index] = new Witch(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Veteran":
            players[index] = new Veteran(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Escort":
            players[index] = new Escort(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Consort":
            players[index] = new Consort(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Doctor":
            players[index] = new Doctor(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Janitor":
            players[index] = new Janitor(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Retributionist":
            players[index] = new Retributionist(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Forger":
            players[index] = new Forger(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Consigliere":
            players[index] = new Consigliere(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Blackmailer":
            players[index] = new Blackmailer(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Framer":
            players[index] = new Framer(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Bodyguard":
            players[index] = new Bodyguard(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Godfather":
            players[index] = new Godfather(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Mafioso":
            players[index] = new Mafioso(temp_uid, temp_socketid, temp_usrname);
            break;
        case "SerialKiller":
            players[index] = new SerialKiller(temp_uid, temp_socketid, temp_usrname);
            break;
        case "VampireHunter":
            players[index] = new VampireHunter(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Jester":
            players[index] = new Jester(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Vigilante":
            players[index] = new Vigilante(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Disguiser":
            players[index] = new Disguiser(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Amnesiac":
            players[index] = new Amnesiac(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Arsonist":
            players[index] = new Arsonist(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Survivor":
            players[index] = new Survivor(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Sheriff":
            players[index] = new Sheriff(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Lookout":
            players[index] = new Lookout(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Investigator":
            players[index] = new Investigator(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Vampire":
            players[index] = new Vampire(temp_uid, temp_socketid, temp_usrname);
            break;
        case "Werewolf":
            players[index] = new Werewolf(temp_uid, temp_socketid, temp_usrname);
            break;
    }//TODO: add troll
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
}

function getArrayIndexByRole(role) {
    var arr = [];
    for (var i = 0; i < players.length; i++) {
        if (role == players[i].role.name) {
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

class VoteInfo {
    votingTo: Player;
    votesToMe: number;
    constructor() {
        this.votingTo = null;
        this.votesToMe = 0;
    }
}

class Player {
    roleList: any[] = []; //error is here: "unexpected token :"
    nameList: string[] = [];
    username: string = "";
    role: any;
    isded: boolean = false;
    hanged: boolean = false;
    uid: string;
    socketid: string;
    roleBlocked: boolean = false; //check if needed
    blackmailed: boolean = false;
    inJail: boolean = false;
    cleaned: boolean = false;
    framed: boolean = false;
    witched: boolean = false;
    guarded: Player = null;
    healed: boolean = false;
    forged: boolean = false;
    abilityCounter: number = 0;
    targetPlayer: string = "";
    will: string = ""; //check if needed + deathnote
    howIDied: string = "";
    //add priority
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        this.uid = _uid;
        this.socketid = _socketid;
        this.username = usrname;
    }
}

function getJailedIndex() {
    for (var i = 0; i < players.length; i++) {
        if (players[i].inJail) {
            return i;
        }
    }
    return -1;
}


class Jailor extends Player {
    deathnote: string = "";
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        var jailedTargetIndex = getJailedIndex();
        if (jailedTargetIndex != -1) {
            if (players[jailedTargetIndex].username == this.targetPlayer && !this.roleBlocked && this.abilityCounter < this.role.abilitylimit) {
                players[getIndexByUsername(this.targetPlayer)].isded = true;
                this.abilityCounter++;
                if (players[getIndexByUsername(this.targetPlayer)].role.team == "town") {
                    this.abilityCounter = 3;
                }
            }
        }
    }
}

class Medium extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

class Transporter extends Player {
    target2: string = ""; //for button2
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        //TODO: what happens when you transport someone with a ww on rampage in his own house. read wiki page
        //else if this happens ^ and add else if to bottom statement \.'./
        if (this.targetPlayer != "" && this.target2 != "") {
            if (!players[getIndexByUsername(this.targetPlayer)].inJail && !players[getIndexByUsername(this.target2)].inJail) {
                var homeRampageWW1 = (players[getIndexByUsername(this.targetPlayer)].role.name == roles.Werewolf.name && players[getIndexByUsername(this.targetPlayer)].targetPlayer == this.targetPlayer
                    && !players[getIndexByUsername(this.targetPlayer)].roleBlocked);
                var homeRampageWW2 = (players[getIndexByUsername(this.target2)].role.name == roles.Werewolf.name && players[getIndexByUsername(this.target2)].targetPlayer == this.target2
                    && !players[getIndexByUsername(this.target2)].roleBlocked);
                if (homeRampageWW1) {
                    players[getIndexByUsername(this.target2)].isded = true;
                }
                if (homeRampageWW2) {
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
    }
}

class Witch extends Player {
    target2: string = "";
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
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
                    if (!players[getIndexByUsername(this.targetPlayer)].roleBlocked) {
                        players[getIndexByUsername(this.targetPlayer)].targetPlayer = this.targetPlayer;
                        players[getIndexByUsername(this.targetPlayer)].witched = true;
                        alertMessage("You were controlled by a Witch!", players[getIndexByUsername(this.targetPlayer)].socketid);
                        players[getIndexByUsername(this.targetPlayer)].useAbility();
                    }
                }
                else {
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
    }
}

class Veteran extends Player {
    deathnote: string = "";
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        for (var i = 0; i < players.length; i++) {
            if (players[i].targetPlayer == this.username && !players[i].healed) {
                players[i].isded = true;
            }
        }
    }
}

class Escort extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        var target_p = players[getIndexByUsername(this.targetPlayer)];
        if (target_p.role.name == roles.Veteran.name || target_p.role.name == roles.Witch.name || target_p.role.name == roles.Transporter.name
            || target_p.role.name == roles.Consort.name || target_p.role.name == roles.Escort.name) {
            alertMessage("Someone tried to role block you but you are immune!", target_p.socketid);
        }
        else {
            players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
            alertMessage("Someone occupied your night. You were role blocked!", target_p.socketid);
        }
    }
}

class Consort extends Player {
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        var target_p = players[getIndexByUsername(this.targetPlayer)];
        if (target_p.role.name == roles.Veteran.name || target_p.role.name == roles.Witch.name || target_p.role.name == roles.Transporter.name
            || target_p.role.name == roles.Consort.name || target_p.role.name == roles.Escort.name) {
            alertMessage("Someone tried to role block you but you are immune!", target_p.socketid);
        }
        else {
            players[getIndexByUsername(this.targetPlayer)].roleBlocked = true;
            alertMessage("Someone occupied your night. You were role blocked!", target_p.socketid);
        }
    }
}

class Doctor extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked) {
            if (this.targetPlayer == this.username) {
                if (this.abilityCounter < this.role.abilitylimit) {
                    this.abilityCounter++;
                    players[getIndexByUsername(this.targetPlayer)].healed = true;
                }
            }
            else {
                players[getIndexByUsername(this.targetPlayer)].healed = true;
            }
        }
    }
}

class Janitor extends Player {
    mafiaList: Player[];
    cleanedPlayers: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked && this.abilityCounter < this.role.abilitylimit) {
            this.abilityCounter++;
            players[getIndexByUsername(this.targetPlayer)].cleaned = true;
            this.cleanedPlayers.push(players[getIndexByUsername(this.targetPlayer)]);
        }
    }
}

class Retributionist extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (players[getIndexByUsername(this.targetPlayer)].role.team == "town"
            && !players[getIndexByUsername(this.targetPlayer)].cleaned && !this.roleBlocked) {
            players[getIndexByUsername(this.targetPlayer)].isded = false;
        }
    }
}

class Forger extends Player {
    mafiaList: Player[];
    forgedWill: string;
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
        this.forgedWill = "";
    }
    useAbility(): void {
        if (!this.roleBlocked && this.abilityCounter < this.role.abilitylimit) {
            players[getIndexByUsername(this.targetPlayer)].forged = true;
            this.abilityCounter++;
        }
    }
}

class Consigliere extends Player {
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked) {
            alertMessage(players[getIndexByUsername(this.targetPlayer)].role.cons_result, this.socketid);
        }
    }
}

class Blackmailer extends Player {
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked && !players[getIndexByUsername(this.targetPlayer)].inJail) {
            players[getIndexByUsername(this.targetPlayer)].blackmailed = true;
        }
    }
}

class Framer extends Player {
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked) {
            players[getIndexByUsername(this.targetPlayer)].framed = true;
        }
    }
}

class Bodyguard extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked) {
            if (this.targetPlayer == this.username) {
                if (this.abilityCounter < this.role.abilitylimit) {
                    this.abilityCounter++;
                    players[getIndexByUsername(this.targetPlayer)].guarded = this;
                }
            }
            else {
                players[getIndexByUsername(this.targetPlayer)].guarded = this;
            }

        }
    }
}

class Godfather extends Player {
    deathnote: string = "";
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        var indx = getIndexByUsername(this.targetPlayer);
        if (!this.roleBlocked && !isNightImmune(indx)) {
            var mafioso_index = -1;
            for (var i = 0; i < this.mafiaList.length; i++) {
                if (this.mafiaList[i].role.name == roles.Mafioso.name && !players[getIndexByUsername(this.mafiaList[i].username)].roleBlocked) {
                    mafioso_index = i;
                }
            }
            if (mafioso_index == -1) {
                if (players[getIndexByUsername(this.targetPlayer)].guarded != null) {
                    this.isded = true;
                    if (!players[getIndexByUsername(this.targetPlayer)].guarded.healed) {
                        players[getIndexByUsername(players[getIndexByUsername(this.targetPlayer)].guarded.username)].isded = true;
                    }
                    players[getIndexByUsername(this.targetPlayer)].guarded = null;
                }
                else {
                    players[getIndexByUsername(this.targetPlayer)].isded = true;
                }
            }
            else if (!players[indx].healed) {
                players[getIndexByUsername(this.mafiaList[mafioso_index].username)].targetPlayer = "";
            }
        }
    }
}

function isNightImmune(index) {
    return (players[index].role.name == roles.Veteran.name && players[index].targetPlayer == players[index].username)
        || players[index].role.name == roles.Werewolf.name || players[index].role.name == roles.Godfather.name || players[index].role.name == roles.Arsonist.name
        || players[index].role.name == roles.SerialKiller.name || (players[index].role.name == roles.Bodyguard.name && players[index].targetPlayer == players[index].username)
        || (players[index].role.name == roles.Survivor.name && players[index].targetPlayer == players[index].username) || players[index].role.name == roles.Executioner.name;
}

class Mafioso extends Player {
    deathnote: string = "";
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        var indx = getIndexByUsername(this.targetPlayer);
        //if not roleblocked and not attacking role that cannot die tonight
        if (!this.roleBlocked && !isNightImmune(indx)) {
            if (players[indx].guarded != null) {
                this.isded = true;
                if (!players[indx].guarded.healed) {
                    players[getIndexByUsername(players[indx].guarded.username)].isded = true;
                }
                players[indx].guarded = null;
            }
            else if (!players[indx].healed) {
                players[indx].isded = true;
            }
        }
    }
}

class SerialKiller extends Player {
    deathnote: string = "";
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (this.roleBlocked) {
            for (var i = 0; i < players.length; i++) {
                if ((players[i].role.name == roles.Escort.name || players[i].role.name == roles.Consort.name) && players[i].targetPlayer == this.username) {
                    if (players[i].guarded != null) {
                        this.isded = true;
                        if (!players[i].guarded.healed) {
                            players[getIndexByUsername(players[i].guarded.username)].isded = true;
                        }
                        players[i].guarded = null;
                    }
                    else if (!players[i].healed) {
                        players[i].isded = true;
                    }
                }
            }
        }
        else {
            var jailor_index = getArrayIndexByRole("Jailor");
            if ((this.inJail && players[jailor_index[0]].targetPlayer == "") || !isNightImmune(getIndexByUsername(this.targetPlayer))) {
                if (players[i].guarded != null) {
                    this.isded = true;
                    if (!players[i].guarded.healed) {
                        players[getIndexByUsername(players[i].guarded.username)].isded = true;
                    }
                    players[i].guarded = null;
                }
                else if (!players[i].healed) {
                    players[i].isded = true;
                }
            }
        }
    }
}

class VampireHunter extends Player {
    deathnote: string = "";
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (this.roleBlocked) {
            var vamp_list = getArrayIndexByRole("Vampire");
            for (var i = 0; i < vamp_list.length; i++) {
                if (players[vamp_list[i]].targetPlayer == this.username) {
                    if (players[vamp_list[i]].guarded != null) {
                        this.isded = true;
                        if (!players[vamp_list[i]].guarded.healed) {
                            players[getIndexByUsername(players[vamp_list[i]].guarded.username)].isded = true;
                        }
                        players[vamp_list[i]].guarded = null;
                    }
                    else if (!players[vamp_list[i]].healed) {
                        players[vamp_list[i]].isded = true;
                    }
                }
            }
        }
        else {
            var indx = getIndexByUsername(this.targetPlayer)
            if (players[indx].role.name == roles.Vampire.name) {
                if (players[indx].guarded != null) {
                    this.isded = true;
                    if (!players[indx].guarded.healed) {
                        players[getIndexByUsername(players[indx].guarded.username)].isded = true;
                    }
                    players[indx].guarded = null;
                }
                else if (!players[indx].healed) {
                    players[indx].isded = true;
                }
            }
        }
    }
}

class Jester extends Player {
    diedToday: boolean; // set when dead
    guilty_voters = [];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (this.targetPlayer == "") {
            //random kill out of those who voted guilty
        }
        else {
            players[getIndexByUsername(this.targetPlayer)].isded = true;
        }
    }
}

class Vigilante extends Player {
    deathnote: string = "";
    willDie: boolean = false; //if kills town
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked) {
            if (dayCounter > 1 || this.witched) {

            }
        }
    }
}

class Disguiser extends Player {
    mafiaList: Player[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

class Amnesiac extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

class Arsonist extends Player {
    deathnote: string = "";
    dousedTargets: string[];
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

class Survivor extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (this.abilityCounter < this.role.abilitylimit)
            this.abilityCounter++;
    }
}

class Sheriff extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
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
    }
}

class Lookout extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

class Investigator extends Player {
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
    useAbility(): void {
        if (!this.roleBlocked) {
            if (players[getIndexByUsername(this.targetPlayer)].framed) {
                alertMessage("Your target may not be what they seem. They could be: Framer/Vampire/Jester", this.socketid);
            }
            else {
                alertMessage(players[getIndexByUsername(this.targetPlayer)].role.invest_result, this.socketid)
            }
        }
    }
}

class Vampire extends Player {
    vampireList: Player[];
    youngest: boolean = false;
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

class Werewolf extends Player {
    deathnote: string = "";
    constructor(_uid: string, _socketid: string, usrname: string = "") {
        super(_uid, _socketid);
    }
}

function checkUserName(data) {
    if (data.hasOwnProperty("usr") && data.hasOwnProperty("uid")) {
        if (usernameExists(data.usr) && UID_Exists(data.uid)) {
            if (data.usr == "") {
                sendEmit("requestUserNCallBack", {
                    flag: true,
                    usr: data.usr,
                    uid: data.uid
                });
                return false;
            }
            for (let uid in players) {
                let player = players[uid];
                if (player.username == data.usr) {
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
