
var dayOne = true;
var voteCounter = 0;
var phase = "Discussion";
//save which phase you're on
function discussion(){
	phase = "Discussion";
	var timer;
	if(dayOne)
		timer = 15000;
	else
		timer = 45000;
	sendEmit("changePhase", {time: (timer / 1000), phase: "Discussion"});

	var interval = setInterval(function() {
            if (--timer < 0) {
							clearInterval(interval);
							if(dayOne) {
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

function voting(){ //everyone alive can vote
	phase = "Voting";
	sendEmit("changePhase", {time: 30, phase: "Voting"});
	var timer = 30;
	var interval = setInterval(function() {
					if (--timer < 0) {
						clearInterval(interval);
						defense();
						return;
					}
			}, 1000);
}

function defense(){ //only trailled person can talk
	phase = "Defense";
	sendEmit("changePhase", {time: 20, phase: "Defense"});
	var timer = 20;
	var interval = setInterval(function() {
			if (--timer < 0) {
				clearInterval(interval);
				judgement();
				return;
			}
	}, 1000);
}

function judgement(){ //everyone alive can vote
   phase = "Judgement";
  sendEmit("changePhase", {time: 20, phase: "Judgement"});
  var timer = 20;
  var interval = setInterval(function() {
			if (--timer < 0) {
				clearInterval(interval);
				lastWords();
				return;
			}
	}, 1000);
}

function lastWords(){
	 	phase = "Last Words";
		sendEmit("changePhase", {time: 5, phase: "Last Words"});
		var timer = 5;
		var interval = setInterval(function() {
					if (--timer < 0) {
						clearInterval(interval);
						night();
						return;
					}
			}, 1000);
}

function night() {
	phase = "Night";
  sendEmit("changePhase", {time: 40, phase: "Night"});
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
	phase: phase
}
