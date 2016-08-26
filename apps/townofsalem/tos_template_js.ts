        declare function require(name:string);
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
            var interval = setInterval(function() {
                if (--timer < 0) {
                    clearInterval(interval);
                    if (dayOne) {
                        night();
                        dayOne = false;
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
            var interval = setInterval(function() {
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

        function defense() { //only trailled person can talk
            phase = "Defense";
            sendEmit("changePhase", {
                time: 20,
                phase: "Defense"
            });
            var timer = 20;
            var interval = setInterval(function() {
                if (--timer < 0) {
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
                time: 20,
                phase: "Judgement",
                defendant: playerOnTrial.username
            });
            var timer = 20;
            var interval = setInterval(function() {
                if (--timer < 0) {
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
            var interval = setInterval(function() {
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
            var interval = setInterval(function() {
                if (--timer < 0) {
                    clearInterval(interval);
                    discussion();
                    return;
                }
            }, 1000);
        }

        function sendMessageToPlayers(data) { //ALWAYS USE THE NAME PROPERTY
            if (playerOnTrial == null || phase == "Judgement") {
                var sender_player = data.player;
                for (let index in players) {
                    let temp_player = players[index];
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
                            else if (sender_player.role.name == roles.Medium.name && temp_player.Seancing == sender_player) //might need to compare usernames instead of comparing objects
                                sendToSocketId('getMessage', {
                                username: "Medium",
                                message: data.message
                            }, temp_player.socketid);
                        } else if (sender_player.Seancing == temp_player)
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
                    } else {
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
            } else {
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
                if (phase == "Voting") { //voting
                    for (let uid in players) {
                        if (players[uid].username == data.targetname)   {
                            if (voteList[data.player.uid].votingTo == null) {
                                voteList[data.player.uid].votingTo = players[uid];
                                if (data.player.role.name == roles.Mayor.name) {
                                    voteList[uid].votesToMe += 3;
                                } else {
                                    voteList[uid].votesToMe++;
                                }
                                sendVotingMessage(data.player.username, data.targetname + ".", " has voted against ");
                            } else if (voteList[data.player.uid].votingTo.username != data.targetname) {
                                if (data.player.role.name == roles.Mayor.name) {
                                    voteList[uid].votesToMe += 3;
                                    voteList[voteList[data.player.uid].votingTo.uid].votesToMe -= 3;
                                } else {
                                    voteList[uid].votesToMe++;
                                    voteList[voteList[data.player.uid].votingTo.uid].votesToMe--;
                                }
                                voteList[data.player.uid].votingTo = players[uid];
                                sendVotingMessage(data.player.username, data.targetname + ".", " has changed their vote to ");
                            } else if (voteList[data.player.uid].votingTo.username == data.targetname) {
                                if (data.player.role.name == roles.Mayor.name) {
                                    voteList[uid].votesToMe -= 3;
                                } else {
                                    voteList[uid].votesToMe--;
                                }
                                voteList[data.player.uid].votingTo = null;
                                sendVotingMessage(data.player.username, "", " has canceled their vote.");
                            }
                            shouldGetOnTrial(uid);
                        }
                    }
                } else if (phase == "Judgement") { //judgement
                    var msg = "";
                    if (guiltyVoters.indexOf(data.player.username) == -1) {
                        msg = " has voted.";
                        guilty++;
                        guiltyVoters.push(data.player.username);
                        if(innoVoters.indexOf(data.player.username) != -1) {
                            innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                            msg = " has changed their vote.";
                        }
                    } else {
                        msg = " has canceled their vote.";
                        guilty--;
                        guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                    }
                    sendVotingMessage(data.player.username, "", msg);
                }
            } else { //night

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
                        if(guiltyVoters.indexOf(data.player.username) != -1) {
                            guiltyVoters.splice(guiltyVoters.indexOf(data.player.username), 1);
                            msg = " has changed their vote.";
                        }
                    } else {
                        inno--;
                        innoVoters.splice(innoVoters.indexOf(data.player.username), 1);
                        msg = " has canceled their vote.";
                    }
                    sendVotingMessage(data.player.username, "", msg);
                }
            } else { //night

            }
        }

        function shouldGetOnTrial(playerUID) {
            var playersAlive = 0;
            for (let uid in players) {
                if (!players[uid].isded) {
                    playersAlive++;
                }
            }
            if (voteList[playerUID].votesToMe > (playersAlive / 2)) {
                voteCounter++;
                stopVotingTime = true;
                playerOnTrial = players[playerUID];
                for (let uid in voteList) {
                    voteList[uid].votesToMe = 0;
                    voteList[uid].votingTo = null;
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
            for (let uid in players) {
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
            for (let index in players) {
                if(players[index].username == "") {
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
            for (let index in players) {
                players[index].role = _roleslist[i];
                var voteInfo = new Object();
                voteInfo.votingTo = null;
                voteInfo.votesToMe = 0;
                voteList[index] = voteInfo;
                if(players[index].role.team == "mafia") {
                    mafList.push(players[index]);
                }
                else if(players[index].role.name == roles.Vampire.name) {
                    vampList.push(players[index]);
                }
                _nameList.push(players[index].username);
                i++;
            }
            console.log('reached here');
            for (let index in players) {
                if(players[index].role.team == "mafia") {
                    players[index].mafiaList = mafList;
                }
                else if(players[index].role.name == roles.Vampire.name) {
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
            for (let index in players) {
                sendToSocketId("startGame", {
                    player: players[index]
                }, players[index].socketid);
            }
            discussion();
        }

        Array.prototype.shuffle = function() {
            var input = this;

            for (var i = input.length - 1; i >= 0; i--) {

                var randomIndex = Math.floor(Math.random() * (i + 1));
                var itemAtIndex = input[randomIndex];

                input[randomIndex] = input[i];
                input[i] = itemAtIndex;
            }
            return input;
        }

        function addPlayer(uid, socketid) {
            var p = new Player(uid, socketid);
            p.roleList = roles;
            players.push(p);
        }

        class Player {
            roleList: any[] = []; //error is here: "unexpected token :"
            nameList: string[] = [];
            username: string = "";
            role: any;
            isDead: boolean = false;
            uid: string;
            socketid: string;
            roleBlocked: boolean = false; //check if needed
            blackmailed: boolean = false;
            jailed: boolean = false;
            cleaned: boolean = false;
            framed: boolean = false;
            abilityCounter: number = 0;
            targetPlayer: string = "";
            will: string = ""; //check if needed + deathnote
            //add priority
            constructor(_uid: string, _socketid: string) {
                this.uid = _uid;
                this.socketid = _socketid;
            }
        }

        class Jailor extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Medium extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Transporter extends Player {
            target2: string = ""; //for button2
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Witch extends Player {
            target2: string = "";
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Veteran extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Escort extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Consort extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Doctor extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Janitor extends Player {
            mafiaList: Player[];
            cleanedPlayers: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Retributionist extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Forger extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Consigliere extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Blackmailer extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Framer extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Bodyguard extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Godfather extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Mafioso extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class SerialKiller extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class VampireHunter extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Jester extends Player {
            diedAtNight: boolean; // set when dead
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Vigilante extends Player {
            willDie: boolean = false; //if kills town
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Disguiser extends Player {
            mafiaList: Player[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Amnesiac extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Arsonist extends Player {
            dousedTargets: string[];
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Survivor extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Sheriff extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Lookout extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Investigator extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Vampire extends Player {
            vampireList: Player[];
            youngest: boolean = false;
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        class Werewolf extends Player {
            constructor(_uid: string, _socketid: string) {
                super(_uid, _socketid);
            }
        }

        function checkUserName(data) {
            console.log(players);
            //console.log(players);
            for (let uid in players) {
                let player = players[uid];
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
            for(let index in players) {
                if(players[index].uid == data.uid)
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
                let player = players[uid];
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