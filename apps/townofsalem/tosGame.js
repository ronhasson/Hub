
var isDay = true;
var dayOne = true;
var voteCounter = 0;
function discussion(){
	console.log("now in discussion");
	voteCounter = 0;
	var timer;
	if(dayOne)
		timer = 15000;
	else 
		timer = 45000;
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
  isDay = false;
  setTimeout(function() {}, 40000);
}
