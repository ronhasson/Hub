var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rolePicker = require("./apps/townofsalem/rolePicker.js");
var roles = require("./apps/townofsalem/roles.js");
requestChangeRemotePage("tos");
var players = [];
var voteList = {};
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
    votingTimer = 30;
    voteCounter = 0;
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
        if (--timer < 0) {
            clearInterval(interval);
            if (dayOne) {
                night();
                dayOne = false;
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
        if (--votingTimer < 0 || voteCounter > 6) {
            clearInterval(interval);
            night();
            return;
        }
    }, 1000);
}
function defense() {
    phase = "Defense";
    sendEmit("changePhase", {
        time: 20,
        phase: "Defense"
    });
    var timer = 20;
    var interval = setInterval(function () {
        if (--timer < 0) {
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
        time: 20,
        phase: "Judgement",
        defendant: playerOnTrial.username
    });
    var timer = 20;
    var interval = setInterval(function () {
        if (--timer < 0) {
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
        if (--timer < 0) {
            clearInterval(interval);
            hangPlayer();
            night();
            return;
        }
    }, 1000);
}
function night() {
    phase = "Night";
    sendEmit("changePhase", {
        time: 40,
        phase: "Night"
    });
    isDay = false;
    var timer = 40;
    var interval = setInterval(function () {
        if (--timer < 0) {
            clearInterval(interval);
            discussion();
            return;
        }
    }, 1000);
}
function sendMessageToPlayers(data) {
    if (playerOnTrial == null || phase == "Judgement") {
        var sender_player = data.player;
        for (var index in players) {
            var temp_player = players[index];
            if (temp_player.socketid == sender_player.socketid)
                sendToSocketId('getMessage', {
                    username: sender_player.username,
                    message: data.message
                }, sender_player.socketid);
            else if (!isDay) {
                if (sender_player.isded) {
                    if (temp_player.isded)
                        sendToSocketId('getMessage', {
                            username: sender_player.username,
                            message: data.message
                        }, temp_player.socketid);
                    else if (temp_player.role.name == roles.Medium.name)
                        sendToSocketId('getMessage', {
                            username: sender_player.username,
                            message: data.message
                        }, temp_player.socketid);
                    else if (sender_player.role.name == roles.Medium.name && temp_player.Seancing == sender_player)
                        sendToSocketId('getMessage', {
                            username: "Medium",
                            message: data.message
                        }, temp_player.socketid);
                }
                else if (sender_player.Seancing == temp_player)
                    sendToSocketId('getMessage', {
                        username: sender_player.username,
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.role.name == roles.Medium.name && temp_player.isded)
                    sendToSocketId('getMessage', {
                        username: "Medium",
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.role.name == roles.Jailor.name && sender_player.inJail == temp_player)
                    sendToSocketId('getMessage', {
                        username: "Jailor",
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.inJail == temp_player && temp_player.role.name == roles.Jailor.name)
                    sendToSocketId('getMessage', {
                        username: sender_player.username,
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.role.team == "mafia" && temp_player.role.team == "mafia")
                    sendToSocketId('getMessage', {
                        username: sender_player.username,
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.role.team == "mafia" && temp_player.role.name == roles.Spy.name)
                    sendToSocketId('getMessage', {
                        username: "Mafia",
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.role.name == roles.Vampire.name && temp_player.role.name == roles.Vampire.name)
                    sendToSocketId('getMessage', {
                        username: sender_player.username,
                        message: data.message
                    }, temp_player.socketid);
                else if (sender_player.role.name == roles.Vampire.name && temp_player.role.name == roles.VampireHunter.name)
                    sendToSocketId('getMessage', {
                        username: "Vampire",
                        message: data.message
                    }, temp_player.socketid);
            }
            else {
                if (!sender_player.isded)
                    sendToSocketId('getMessage', {
                        username: sender_player.username,
                        message: data.message
                    }, temp_player.socketid);
                else if (temp_player.isded)
                    sendToSocketId('getMessage', {
                        username: sender_player.username,
                        message: data.message
                    }, temp_player.socketid);
            }
        }
    }
    else {
        if (playerOnTrial.username == data.player.username) {
            sendEmit('getMessage', {
                username: data.player.username,
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
function Button1(data) {
    if (isDay) {
        if (phase == "Voting") {
            for (var uid in players) {
                if (players[uid].username == data.targetname) {
                    if (voteList[data.player.uid].votingTo == null) {
                        voteList[data.player.uid].votingTo = players[uid];
                        if (data.player.role.name == roles.Mayor.name) {
                            voteList[uid].votesToMe += 3;
                        }
                        else {
                            voteList[uid].votesToMe++;
                        }
                        sendVotingMessage(data.player.username, data.targetname + ".", " has voted against ");
                    }
                    else if (voteList[data.player.uid].votingTo.username != data.targetname) {
                        if (data.player.role.name == roles.Mayor.name) {
                            voteList[uid].votesToMe += 3;
                            voteList[voteList[data.player.uid].votingTo.uid].votesToMe -= 3;
                        }
                        else {
                            voteList[uid].votesToMe++;
                            voteList[voteList[data.player.uid].votingTo.uid].votesToMe--;
                        }
                        voteList[data.player.uid].votingTo = players[uid];
                        sendVotingMessage(data.player.username, data.targetname + ".", " has changed their vote to ");
                    }
                    else if (voteList[data.player.uid].votingTo.username == data.targetname) {
                        if (data.player.role.name == roles.Mayor.name) {
                            voteList[uid].votesToMe -= 3;
                        }
                        else {
                            voteList[uid].votesToMe--;
                        }
                        voteList[data.player.uid].votingTo = null;
                        sendVotingMessage(data.player.username, "", " has canceled their vote.");
                    }
                    shouldGetOnTrial(uid);
                }
            }
        }
        else if (phase == "Judgement") {
            var msg = "";
            if (guiltyVoters.indexOf(data.player.username) == -1) {
                msg = " has voted.";
                guilty++;
                guiltyVoters.push(data.player.username);
                if (innoVoters.indexOf(data.player.username) != -1) {
                    innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                    msg = " has changed their vote.";
                }
            }
            else {
                msg = " has canceled their vote.";
                guilty--;
                guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
            }
            sendVotingMessage(data.player.username, "", msg);
        }
    }
    else {
    }
}
function Button2(data) {
    if (isDay) {
        if (phase == "Judgement") {
            var msg = "";
            if (innoVoters.indexOf(data.player.username) == -1) {
                msg = " has voted.";
                inno++;
                innoVoters.push(data.player.username);
                if (guiltyVoters.indexOf(data.player.username) != -1) {
                    guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                    msg = " has changed their vote.";
                }
            }
            else {
                inno--;
                innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                msg = " has canceled their vote.";
            }
            sendVotingMessage(data.player.username, "", msg);
        }
    }
    else {
    }
}
function shouldGetOnTrial(playerUID) {
    var playersAlive = 0;
    for (var uid in players) {
        if (!players[uid].isded) {
            playersAlive++;
        }
    }
    if (voteList[playerUID].votesToMe > (playersAlive / 2)) {
        voteCounter++;
        stopVotingTime = true;
        playerOnTrial = players[playerUID];
        for (var uid in voteList) {
            voteList[uid].votesToMe = 0;
            voteList[uid].votingTo = null;
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
    for (var uid in players) {
        if (guiltyVoters.indexOf(players[uid].username) == -1 && innoVoters.indexOf(players[uid].username) == -1 && playerOnTrial.username != players[uid].username) {
            sendVotingMessage(players[uid].username, "", " abstained.");
        }
    }
    guiltyVoters = [];
    innoVoters = [];
}
function hangPlayer() {
    console.log("about to fucking die baby: " + playerOnTrial.username);
    playerOnTrial.isded = true;
    // show msg "ditza" has died.
    // show will and role
    // put in graveyard (2 buttons will and deathnote)
    playerOnTrial = null;
}
function start() {
    for (var index in players) {
        if (players[index].username == "") {
            delete players[index];
        }
    }
    /*for (let uid in players) {
        let player = players[uid];
        if (player.username == "") {
            delete players[uid];
        }
    }*/
    var _roleslist;
    _roleslist = rolePicker.getRoles(Object.keys(players).length);
    _roleslist = rolePicker.checkValidation(_roleslist);
    console.log("s start - ");
    console.log(_roleslist);
    _roleslist.shuffle();
    var i = 0;
    var mafList = [];
    var vampList = [];
    var _nameList = [];
    for (var index in players) {
        players[index].role = _roleslist[i];
        var voteInfo = new Object();
        voteInfo.votingTo = null;
        voteInfo.votesToMe = 0;
        voteList[index] = voteInfo;
        if (players[index].role.team == "mafia") {
            mafList.push(players[index]);
        }
        else if (players[index].role.name == roles.Vampire.name) {
            vampList.push(players[index]);
        }
        _nameList.push(players[index].username);
        i++;
    }
    console.log('reached here');
    for (var index in players) {
        if (players[index].role.team == "mafia") {
            players[index].mafiaList = mafList;
        }
        else if (players[index].role.name == roles.Vampire.name) {
            players[index].vampireList = vampList;
        }
        players[index].nameList = _nameList;
    }
    /*var i = 0;
    for (let uid in players) {
        players[uid].role = _roleList[i];
        var voteInfo = new Object();
        voteInfo.votingTo = null;
        voteInfo.votesToMe = 0;
        voteList[uid] = voteInfo;
        i++;
    }*/
    console.log("start - ");
    console.log(players);
    for (var index in players) {
        sendToSocketId("startGame", {
            player: players[index]
        }, players[index].socketid);
    }
    discussion();
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
var Player = (function () {
    //add priority
    function Player(_uid, _socketid) {
        this.roleList = []; //error is here: "unexpected token :"
        this.nameList = [];
        this.username = "";
        this.isDead = false;
        this.roleBlocked = false; //check if needed
        this.blackmailed = false;
        this.jailed = false;
        this.cleaned = false;
        this.framed = false;
        this.abilityCounter = 0;
        this.targetPlayer = "";
        this.will = ""; //check if needed + deathnote
        this.uid = _uid;
        this.socketid = _socketid;
    }
    return Player;
}());
var Jailor = (function (_super) {
    __extends(Jailor, _super);
    function Jailor(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Jailor;
}(Player));
var Medium = (function (_super) {
    __extends(Medium, _super);
    function Medium(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Medium;
}(Player));
var Transporter = (function (_super) {
    __extends(Transporter, _super);
    function Transporter(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
        this.target2 = ""; //for button2
    }
    return Transporter;
}(Player));
var Witch = (function (_super) {
    __extends(Witch, _super);
    function Witch(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
        this.target2 = "";
    }
    return Witch;
}(Player));
var Veteran = (function (_super) {
    __extends(Veteran, _super);
    function Veteran(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Veteran;
}(Player));
var Escort = (function (_super) {
    __extends(Escort, _super);
    function Escort(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Escort;
}(Player));
var Consort = (function (_super) {
    __extends(Consort, _super);
    function Consort(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Consort;
}(Player));
var Doctor = (function (_super) {
    __extends(Doctor, _super);
    function Doctor(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Doctor;
}(Player));
var Janitor = (function (_super) {
    __extends(Janitor, _super);
    function Janitor(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Janitor;
}(Player));
var Retributionist = (function (_super) {
    __extends(Retributionist, _super);
    function Retributionist(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Retributionist;
}(Player));
var Forger = (function (_super) {
    __extends(Forger, _super);
    function Forger(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Forger;
}(Player));
var Consigliere = (function (_super) {
    __extends(Consigliere, _super);
    function Consigliere(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Consigliere;
}(Player));
var Blackmailer = (function (_super) {
    __extends(Blackmailer, _super);
    function Blackmailer(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Blackmailer;
}(Player));
var Framer = (function (_super) {
    __extends(Framer, _super);
    function Framer(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Framer;
}(Player));
var Bodyguard = (function (_super) {
    __extends(Bodyguard, _super);
    function Bodyguard(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Bodyguard;
}(Player));
var Godfather = (function (_super) {
    __extends(Godfather, _super);
    function Godfather(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Godfather;
}(Player));
var Mafioso = (function (_super) {
    __extends(Mafioso, _super);
    function Mafioso(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Mafioso;
}(Player));
var SerialKiller = (function (_super) {
    __extends(SerialKiller, _super);
    function SerialKiller(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return SerialKiller;
}(Player));
var VampireHunter = (function (_super) {
    __extends(VampireHunter, _super);
    function VampireHunter(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return VampireHunter;
}(Player));
var Jester = (function (_super) {
    __extends(Jester, _super);
    function Jester(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Jester;
}(Player));
var Vigilante = (function (_super) {
    __extends(Vigilante, _super);
    function Vigilante(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
        this.willDie = false; //if kills town
    }
    return Vigilante;
}(Player));
var Disguiser = (function (_super) {
    __extends(Disguiser, _super);
    function Disguiser(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Disguiser;
}(Player));
var Amnesiac = (function (_super) {
    __extends(Amnesiac, _super);
    function Amnesiac(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Amnesiac;
}(Player));
var Arsonist = (function (_super) {
    __extends(Arsonist, _super);
    function Arsonist(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Arsonist;
}(Player));
var Survivor = (function (_super) {
    __extends(Survivor, _super);
    function Survivor(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Survivor;
}(Player));
var Sheriff = (function (_super) {
    __extends(Sheriff, _super);
    function Sheriff(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Sheriff;
}(Player));
var Lookout = (function (_super) {
    __extends(Lookout, _super);
    function Lookout(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Lookout;
}(Player));
var Investigator = (function (_super) {
    __extends(Investigator, _super);
    function Investigator(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Investigator;
}(Player));
var Vampire = (function (_super) {
    __extends(Vampire, _super);
    function Vampire(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
        this.youngest = false;
    }
    return Vampire;
}(Player));
var Werewolf = (function (_super) {
    __extends(Werewolf, _super);
    function Werewolf(_uid, _socketid) {
        _super.call(this, _uid, _socketid);
    }
    return Werewolf;
}(Player));
function checkUserName(data) {
    console.log(players);
    //console.log(players);
    for (var uid in players) {
        var player = players[uid];
        //console.log(player);
        if (player.username == data.usr) {
            sendEmit("requestUserNCallBack", {
                flag: true,
                usr: data.usr,
                uid: data.uid
            });
            return false;
        }
    }
    //console.log("pass - " +players[data.uid]);
    for (var index in players) {
        if (players[index].uid == data.uid)
            players[index].username = data.usr;
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
    console.log(players);
    disp.innerHTML = "";
    var i = 0;
    for (var uid in players) {
        var player = players[uid];
        if (player.username != "") {
            i++;
            console.log('loop ran ' + i + 'times');
            disp.innerHTML += "<a class='playerWait' onclick='removePlayer(\"" + uid + "\")'>" + player.username + "</a></br>";
        }
    }
}
function removePlayer(uid) {
    players[uid].username = "";
    displayUsers();
}
