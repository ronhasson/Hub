
var dayOne = true;
var voteCounter = 0;
//save which phase you're on'
function discussion(){
	console.log("now in discussion");
	voteCounter = 0;
	var timer;
	if(dayOne)
		timer = 15000;
	else
		timer = 45000;
	sendEmit("changePhase", {time: (timer / 1000), phase: "Discussion"});
  setTimeout(function() {
    if(dayOne)
	{
    	night();
			dayOne = false;
	}
	else
	{
		voting();
	}
  }, timer);
}

function voting(){ //everyone alive can vote
	sendEmit("changePhase", {time: 30, phase: "Voting"});
	if(voteCounter < 6)
	{
		console.log("NOW VOTING for the: " + voteCounter + "time");
	}
	else
	{
		console.log("voting ended, nightime");
		night();
	}
  setTimeout(function() {
	  defense();
  }, 30000);
}

function defense(){ //only trailled person can talk
  setTimeout(function() {
	  judgement();
  }, 20000);
}

function judgement(){ //everyone alive can vote
  setTimeout(function() {
	  //if(guilty) last words
	  //else voting
  }, 20000);
}

function lastWords(){
  setTimeout(function() {
	  night();
  }, 5000);
}

function night(){

  setTimeout(function() {}, 40000);
}

module.exports = {
    discussion: discussion
}
