/*
 * Loosely based upon a tutorial by Mateusz Rybczonek, published on
 * https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
 * 
 * I believe that this implementation is *slightly* more time accurate, as setInterval
 * can slip by a few milliseconds, while I *believe* that Date.now() is correct.
 * I *think* but am not sure that this means these countdowns are correct even when the tab
 * is minimised or otherwise paused.
*/
const Timer = () => {
  let tickdownIntervalId;

  const formatTime = (ms) => {
    const time = Math.round(ms / 1000);
    const hours = Math.floor(time / 60 / 60); // TODO: hmm, leaves remaining hours
    const minutes = Math.floor(time / 60) - (hours * 60);
    let seconds = time % 60;

    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2,"0")].filter((e) => (!!e)).join(":");
  }

  const formatCircle = (remainingTime, totalTime) => {
    const fullArc = 283; // This is the arc of a circle of radius 45px;
    console.table({remainingTime, totalTime})
    const percentRemaining = (remainingTime / totalTime) * fullArc;
    document
      .querySelector("[data-js-timer-indicator]")
      .setAttribute("stroke-dasharray", [percentRemaining, fullArc].join(" "))
  }

  const setDisplayMilliseconds = (ms) => {
    const display = document.querySelector("[data-js-display]")
    const circle = document.querySelector("[data-js-circle]")

    display.innerText = formatTime(ms)
  }

  const setCountdown = (totalTime) => {
    if(!!tickdownIntervalId) {
      clearInterval(tickdownIntervalId);
    }

    countdown(totalTime);
  }

  const countdown = (totalTime) => {
    const initialTime = Date.now();
    const totalTimeMilliseconds = totalTime * 1000
    const finishTime = initialTime + (totalTimeMilliseconds);

    setDisplayMilliseconds(finishTime - initialTime);
    formatCircle(initialTime, finishTime);

    const updateDisplay = () => {
      const currentTime = Date.now();
      const remainingTime = finishTime - currentTime;

      if(remainingTime < 0) {
        setDisplayMilliseconds(0);
        formatCircle(0, 1);
        // TODO: how to handle the above cleanup
        clearInterval(tickdownIntervalId);
        return
      }

      setDisplayMilliseconds(remainingTime);
      formatCircle(remainingTime, totalTimeMilliseconds);
    }

    tickdownIntervalId = setInterval(updateDisplay, 1000)
  }

  setDisplayMilliseconds(0);
  return { countdown, setCountdown }
}

const initialiseListeners = ({countdown, setCountdown}) => {
  const dismiss = (target) => {
    target.remove()
  }

  const countdownFormListener = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const totalTime = (Number(data.get('hour')) * 60 * 60) + (Number(data.get('minute')) * 60) + Number(data.get('second'))

    setCountdown(totalTime);
  }

  const timerForm = document.querySelector("[data-js-timer-form]")
  timerForm.addEventListener("submit", countdownFormListener)


  const hint = document.querySelector("[data-js-hint]");
  const hintDismiss = document.querySelector("[data-js-hint] button");
  hintDismiss.addEventListener("click", (_) => { dismiss(hint)});
}


window.addEventListener("load", (event) => {
  console.log("ready");

  const { countdown, setCountdown } = Timer();
  initialiseListeners({countdown, setCountdown});
})
