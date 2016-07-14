document.getElementById("trackpad").addEventListener('touchstart', handleTouchStart, false);
document.getElementById("trackpad").addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

var queue = [];

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */
            queue.push("left");
            console.log("left");
        } else {
            /* right swipe */
            queue.push("right");
            console.log("right");
        }
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */
            queue.push("up");
            console.log("up");
        } else {
            /* down swipe */
            queue.push("down");
            console.log("down");
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
    checkKonami();
};
function checkKonami()
{
  while(queue.length>8)
  {
    queue.shift();
  }
  if(queue.length == 8)
  {
    if(queue[0] == "up" && queue[1] == "up" && queue[2] == "down" && queue[3] == "down" && queue[4] == "left" && queue[5] == "right" && queue[6] == "left" && queue[7] == "right")
    {
      console.log("konami Code activated!!!!!!!!!!!!")
    }
  }
}
