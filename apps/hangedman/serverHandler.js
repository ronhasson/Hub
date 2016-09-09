requestChangeRemotePage("hangedman")

var players = [];

function addPlayer(data){
  console.log("addPlayer")
  players.push(data.player);
  console.log(data.player);

  document.getElementById('playerList').insertAdjacentHTML('beforeend', "<li style='color:"+data.player.color+"'>"+data.player.name+"</li>");
  document.getElementById('counter').value = players.length;
}

function startgame(data){
  sendEmit("stopWaiting", null);
}
