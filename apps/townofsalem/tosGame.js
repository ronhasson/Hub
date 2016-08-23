var tos = require("./apps/townofsalem/tos_template.html");

var dayOne = true;

var voteCounter = 0;
var stopVotingTime = false;
var votingTimer = 30;
var playerOnTrial = null;

var inno = 0;
var guilty = 0;

var phase = "Discussion";
//save which phase you're on
function discussion() {
    votingTimer = 30;
    voteCounter = 0;
    phase = "Discussion";
    var timer;
    if (dayOne)
        timer = 15000;
    else
        timer = 45000;
    sendEmit("changePhase", {
        time: (timer / 1000),
        phase: "Discussion"
    });

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
        time: 30,
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
    playerOnTrial = null;
    var timer = 20;
    var interval = setInterval(function() {
        if (--timer < 0) {
            clearInterval(interval);
            tos.showJudgementResults();
            if (guilty > inno) {
                lastWords();
            } else {
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
            tos.hangPlayer();
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
    var timer = 40;
    var interval = setInterval(function() {
        if (--timer < 0) {
            clearInterval(interval);
            discussion();
            return;
        }
    }, 1000);
}

module.exports = {
    discussion: discussion,
    phase: phase,
    guilty: guilty,
    inno: inno,
    voteCounter: voteCounter,
    stopVotingTime: stopVotingTime,
    playerOnTrial: playerOnTrial
};
