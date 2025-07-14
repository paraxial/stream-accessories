const Timer = () => {
  let tickdownIntervalId;

  const formatTime = (ms) => {
    const time = Math.round(ms / 1000);
    const hours = Math.floor(time / 60 / 60); // TODO: hmm, leaves remaining hours
    const minutes = Math.floor(time / 60) - (hours * 60);
    let seconds = time % 60;

    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2,"0")].filter((e) => (!!e)).join(":");
  }

  const formatCircle = (currentTime, finalTime) => {
    // TODO: use a CSS animation to drive the circle portion.
    console.log({currentTime, finalTime})
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

  const countdown = (timeSeconds) => {
    const initialTime = Date.now();
    const finishTime = initialTime + (timeSeconds * 1000);

    setDisplayMilliseconds(finishTime - initialTime);
    formatCircle(initialTime, finishTime);

    const updateDisplay = () => {
      const currentTime = Date.now();
      const remainingTime = finishTime - currentTime;

      if(remainingTime < 0) {
        setDisplayMilliseconds(0);
        clearInterval(tickdownIntervalId);
        return
      }

      setDisplayMilliseconds(remainingTime);
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
