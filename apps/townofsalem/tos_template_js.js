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
var phase = "Discussion";
var isDay = true;
function discussion() {
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
    if (phase != "Last Words" && phase != "Defense") {
        var sender_player = data.player;
        for (var i = 0; i < players.length; i++) {
            var temp_player = players[i];
            if (temp_player.uid == sender_player.uid) {
                console.log('send msg to myself works');
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
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " executions left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Vigilante.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " bullets left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Bodyguard.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " bullet proof vests left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Doctor.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " self heals left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Retributionist.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " ressurections left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Veteran.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " alerts left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Disguiser.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " disguises left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Forger.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " forgeries left." }, players[i].socketid);
            }
            else if (players[i].role.name == roles.Janitor.name) {
                sendToSocketId("getMessage", { username: "", message: "You have " + (players[i].role.abilitylimit - players[i].abilityCounter) + " cleanings left." }, players[i].socketid);
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
                    sendToSocketId("getMessage", { username: "", message: "You dragged your target to jail." }, players[i].socketid);
                    sendToSocketId("getMessage", { username: "", message: "You were hauled off to jail" }, players[getIndexByUsername(players[i].targetPlayer)].socketid);
                }
            }
            else {
                sendToSocketId('getMessage', {
                    username: "",
                    message: "You did not use your day ability."
                }, players[i].socketid);
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
    }
}
function Button1(data) {
    if (isDay) {
        if (phase == "Voting") {
            if (!players[getIndexByUID(data.player.uid)].isded) {
                var i = getIndexByUsername(data.targetname);
                if (!players[i].isded) {
                    var playerIndex = getIndexByUID(data.player.uid);
                    if (voteList[playerIndex].votingTo == null) {
                        voteList[playerIndex].votingTo = players[i];
                        if (data.player.role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            voteList[i].votesToMe += 3;
                        }
                        else {
                            voteList[i].votesToMe++;
                        }
                        sendVotingMessage(data.player.username, data.targetname + ".", " has voted against ");
                    }
                    else if (voteList[playerIndex].votingTo.username != data.targetname) {
                        if (data.player.role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
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
                        if (data.player.role.name == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
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
            }
        }
        else if (phase == "Judgement") {
            if (!players[getIndexByUID(data.player.uid)].isded) {
                var msg = "";
                if (guiltyVoters.indexOf(data.player.username) == -1) {
                    msg = " has voted.";
                    guilty++;
                    if (data.player.role == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                        guilty += 2;
                    }
                    guiltyVoters.push(data.player.username);
                    if (innoVoters.indexOf(data.player.username) != -1) {
                        innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                        msg = " has changed their vote.";
                        inno--;
                        if (data.player.role == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            inno -= 2;
                        }
                    }
                }
                else {
                    msg = " has canceled their vote.";
                    guilty--;
                    if (data.player.role == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                        guilty -= 2;
                    }
                    guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                }
                sendVotingMessage(data.player.username, "", msg);
            }
        }
    }
    else {
    }
}
function updatePlayerWill(data) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].uid == data.player.uid && !players[i].isded) {
            players[i].will = data.willText;
        }
    }
}
function Button2(data) {
    if (isDay) {
        if (phase == "Judgement") {
            if (!players[getIndexByUID(data.player.uid)].isded) {
                var msg = "";
                if (innoVoters.indexOf(data.player.username) == -1) {
                    msg = " has voted.";
                    inno++;
                    if (data.player.role == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                        inno += 2;
                    }
                    innoVoters.push(data.player.username);
                    if (guiltyVoters.indexOf(data.player.username) != -1) {
                        guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                        msg = " has changed their vote.";
                        guilty--;
                        if (data.player.role == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
                            guilty -= 2;
                        }
                    }
                }
                else {
                    inno--;
                    if (data.player.role == roles.Mayor.name && players[getIndexByUID(data.player.uid)].abilityCounter == 1) {
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
    }
}
function sunButton(data) {
    if (isDay) {
        var abilityPlayerIndex = getIndexByUID(data.player.uid);
        var targetPlayerIndex = getIndexByUsername(data.targetname);
        if (data.player.role.name == roles.Mayor.name && !players[abilityPlayerIndex].isded && players[abilityPlayerIndex].abilityCounter == 0) {
            sendVotingMessage(players[abilityPlayerIndex].username, "", " has revealed himself as the Mayor!.");
            players[abilityPlayerIndex].abilityCounter++;
            sendToSocketId("cannotUseAbility", {}, players[abilityPlayerIndex].socketid);
        }
        else if (data.player.role.name == roles.Jailor.name && !players[targetPlayerIndex].isded && !players[abilityPlayerIndex].isded) {
            if (data.targetname != players[abilityPlayerIndex].targetPlayer) {
                players[abilityPlayerIndex].targetPlayer = data.targetname;
                sendToSocketId('getMessage', {
                    username: "",
                    message: "You have decided to jail " + data.targetname + " tonight."
                }, players[abilityPlayerIndex].socketid);
            }
            else {
                players[abilityPlayerIndex].targetPlayer = "";
                sendToSocketId('getMessage', {
                    username: "",
                    message: "You will no longer jail " + data.targetname + " tonight."
                }, players[abilityPlayerIndex].socketid);
            }
        }
        else if (data.player.role.name == roles.Medium.name && players[abilityPlayerIndex].isded && !players[targetPlayerIndex].isded && players[abilityPlayerIndex].abilityCounter == 0) {
            if (players[abilityPlayerIndex].targetPlayer != data.targetname) {
                players[abilityPlayerIndex].targetPlayer = data.targetname;
                players[abilityPlayerIndex].abilityCounter++;
                sendToSocketId('getMessage', {
                    username: "",
                    message: "You have decided to seance " + data.targetname + " tonight."
                }, players[abilityPlayerIndex].socketid);
            }
            else {
                players[abilityPlayerIndex].targetPlayer = "";
                players[abilityPlayerIndex].abilityCounter--;
                sendToSocketId('getMessage', {
                    username: "",
                    message: "You will no longer seance " + data.targetname + " tonight."
                }, players[abilityPlayerIndex].socketid);
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
        }
    }
    sendEmit("updateDeadList", deadlist);
    sendToSocketId("killOrResPlayer", true, playerOnTrial.socketid);
    // show will and role
    // put in graveyard (2 buttons will and deathnote)
    playerOnTrial = null;
}
function updatePlayerDeathnote(data) {
    for (var i = 0; i < players.length; i++) {
        if (data.player.uid == players[i].uid && players[i].role.canKill && !players[i].isded) {
            players[i].deathnote = data.deathnoteText;
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
var Player = (function () {
    //add priority
    function Player(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        this.roleList = []; //error is here: "unexpected token :"
        this.nameList = [];
        this.username = "";
        this.isded = false;
        this.hanged = false;
        this.roleBlocked = false; //check if needed
        this.blackmailed = false;
        this.inJail = false;
        this.cleaned = false;
        this.framed = false;
        this.abilityCounter = 0;
        this.targetPlayer = "";
        this.will = ""; //check if needed + deathnote
        this.howIDied = "";
        this.uid = _uid;
        this.socketid = _socketid;
        this.username = usrname;
    }
    return Player;
}());
var Jailor = (function (_super) {
    __extends(Jailor, _super);
    function Jailor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
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
    return Transporter;
}(Player));
var Witch = (function (_super) {
    __extends(Witch, _super);
    function Witch(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.target2 = "";
    }
    return Witch;
}(Player));
var Veteran = (function (_super) {
    __extends(Veteran, _super);
    function Veteran(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return Veteran;
}(Player));
var Escort = (function (_super) {
    __extends(Escort, _super);
    function Escort(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Escort;
}(Player));
var Consort = (function (_super) {
    __extends(Consort, _super);
    function Consort(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Consort;
}(Player));
var Doctor = (function (_super) {
    __extends(Doctor, _super);
    function Doctor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Doctor;
}(Player));
var Janitor = (function (_super) {
    __extends(Janitor, _super);
    function Janitor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Janitor;
}(Player));
var Retributionist = (function (_super) {
    __extends(Retributionist, _super);
    function Retributionist(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Retributionist;
}(Player));
var Forger = (function (_super) {
    __extends(Forger, _super);
    function Forger(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Forger;
}(Player));
var Consigliere = (function (_super) {
    __extends(Consigliere, _super);
    function Consigliere(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Consigliere;
}(Player));
var Blackmailer = (function (_super) {
    __extends(Blackmailer, _super);
    function Blackmailer(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Blackmailer;
}(Player));
var Framer = (function (_super) {
    __extends(Framer, _super);
    function Framer(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Framer;
}(Player));
var Bodyguard = (function (_super) {
    __extends(Bodyguard, _super);
    function Bodyguard(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Bodyguard;
}(Player));
var Godfather = (function (_super) {
    __extends(Godfather, _super);
    function Godfather(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return Godfather;
}(Player));
var Mafioso = (function (_super) {
    __extends(Mafioso, _super);
    function Mafioso(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return Mafioso;
}(Player));
var SerialKiller = (function (_super) {
    __extends(SerialKiller, _super);
    function SerialKiller(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return SerialKiller;
}(Player));
var VampireHunter = (function (_super) {
    __extends(VampireHunter, _super);
    function VampireHunter(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return VampireHunter;
}(Player));
var Jester = (function (_super) {
    __extends(Jester, _super);
    function Jester(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
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
    return Vigilante;
}(Player));
var Disguiser = (function (_super) {
    __extends(Disguiser, _super);
    function Disguiser(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Disguiser;
}(Player));
var Amnesiac = (function (_super) {
    __extends(Amnesiac, _super);
    function Amnesiac(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Amnesiac;
}(Player));
var Arsonist = (function (_super) {
    __extends(Arsonist, _super);
    function Arsonist(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return Arsonist;
}(Player));
var Survivor = (function (_super) {
    __extends(Survivor, _super);
    function Survivor(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Survivor;
}(Player));
var Sheriff = (function (_super) {
    __extends(Sheriff, _super);
    function Sheriff(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Sheriff;
}(Player));
var Lookout = (function (_super) {
    __extends(Lookout, _super);
    function Lookout(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Lookout;
}(Player));
var Investigator = (function (_super) {
    __extends(Investigator, _super);
    function Investigator(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
    }
    return Investigator;
}(Player));
var Vampire = (function (_super) {
    __extends(Vampire, _super);
    function Vampire(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.youngest = false;
    }
    return Vampire;
}(Player));
var Werewolf = (function (_super) {
    __extends(Werewolf, _super);
    function Werewolf(_uid, _socketid, usrname) {
        if (usrname === void 0) { usrname = ""; }
        _super.call(this, _uid, _socketid);
        this.deathnote = "";
    }
    return Werewolf;
}(Player));
function checkUserName(data) {
    if (data.usr == "") {
        sendEmit("requestUserNCallBack", {
            flag: true,
            usr: data.usr,
            uid: data.uid
        });
        return false;
    }
    for (var uid in players) {
        var player = players[uid];
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
