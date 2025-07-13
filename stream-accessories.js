/* A beautiful global that will never let us down, for certain /s */
/* Maybe this could all be inside a closure, since I seem to otherwise
   be passing state around like it's going out of style */
let tickDownInterval;

const hintSetup = () => {
  const dismiss = (target) => {
    target.remove()
  }

  const hint = document.querySelector("[data-js-hint]");
  const hintDismiss = document.querySelector("[data-js-hint] button");
  hintDismiss.addEventListener("click", (_) => { dismiss(hint)});
}

const timerSetup = () => {
  const setTimer = (event) => {
    event.preventDefault();
    if(!!tickDownInterval) {
      clearInterval(tickDownInterval)
    }

    const data = new FormData(event.target);
    const totalTime = (Number(data.get('hour')) * 60 * 60) + (Number(data.get('minute')) * 60) + Number(data.get('second'))
    timer(totalTime)
  }

  const timerForm = document.querySelector("[data-js-timer-form]")
  timerForm.addEventListener("submit", setTimer)
}

const formatTime = (timeMiliseconds) => {
  const time = Math.round(timeMiliseconds / 1000);
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}


/* Timer! Lots yet TODO:
  - Cancel existing timer when new timer is input
  - Enable pause or reset
  - Factoring here is pretty arse, have a think about it in the morning.
*/
const timer = (timeSeconds) => {
  const display = document.querySelector("[data-js-display]")
  const circle = document.querySelector("[data-js-circle]")
  const initialTime = Date.now();
  const finishTime = initialTime + (timeSeconds * 1000);

  display.innerText = formatTime(finishTime - initialTime)

  // const playing = false;
  // const toggleState = () => { playing = !playing };

  const timerControls = () => {
    // const playPauseButton = document.querySelector("[data-js-play-pause]")
    // const resetButton = document.querySelector("[data-js-reset]")

    // playPauseButton.addEventListener("click", toggleState)
  }


  const updateDisplay = () => {
    const currentTime = Date.now();
    const remainingTime = finishTime - currentTime;
    console.table({remainingTime, finishTime, currentTime, initialTime, timeSeconds})

    if(remainingTime < 0) {
      display.innerText = formatTime(0);
      clearInterval(tickDownInterval)
      return
    }

    console.log(formatTime(remainingTime))
    display.innerText = formatTime(remainingTime);
  }

  tickDownInterval = setInterval(updateDisplay, 1000)

  return tickDownInterval;
}

window.addEventListener("load", (event) => {
  console.log("ready");
  hintSetup();
  timerSetup();
})

