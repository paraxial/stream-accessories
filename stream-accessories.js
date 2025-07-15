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
    const fullArc = 283; // This is the perimeter of a circle of radius 45px;
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

const UIControls = () => {
  const key = "accessory-ui-values"
  const defaultValues = () => ({
    "--display-font": "Silkscreen",
    "--background-colour": "#00ff00",
    "--primary-colour": "#000000",
    "--secondary-colour": "#dedede",
    "--stroke-colour": "#ffffff",
    "--dimension-multiplier": "1",
  });
  const currentValues = {};
  const appearanceFormNode = document.querySelector("[data-js-ui-form]");

  const setStore = (values) => {
    window.localStorage.setItem(key, JSON.stringify(values));
  };

  /*
   * TODO: This method is potentially dangerously lossy despite being a getter.
   *       Determine an alternate safe get?
   */
  const getStore = () => {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch (SyntaxError) {
      console.error(`Stored values were corrupt: ${getStore()}. Returning defaultObject.`)
      return defaultValues();
    }
  };

  const renderSync = () => {
    Object.entries(currentValues).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    })
  }

  const setup = () => {
    if(!getStore()) {
      Object.assign(currentValues, defaultValues());
      setStore(defaultValues());
    }

    // getStore is async, right? How does this work.
    Object.assign(currentValues, getStore());
    Object.entries(currentValues).forEach(([k, v]) => {
      const input = appearanceFormNode.querySelector(`[name="${k}"]`);
      if(!input) { return }

      input.value = v;
    });

    handleDimensionChange(currentValues["--dimension-multiplier"]);
    renderSync();
  }

  const handleDimensionChange = (value) => {
    const label = appearanceFormNode.querySelector("[data-js-dimension-label]");
    label.innerText = [Number(value).toFixed(2), "x"].join("");
  }

  const handleForm = (e) => {
    e.preventDefault();
    const appearanceFormData = new FormData(appearanceFormNode);

    Object.keys(defaultValues()).forEach((k) => {
      const newValue = appearanceFormData.get(k)

      if(!newValue) { return }

      currentValues[k] = newValue;
    });

    renderSync();
    setStore(currentValues);
  }

  setup();
  appearanceFormNode
    .querySelector("[data-js-clock-dimension]")
    .addEventListener("input", (e) => handleDimensionChange(e.target.value))
  appearanceFormNode.addEventListener("submit", handleForm);
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

  UIControls();
  const { countdown, setCountdown } = Timer();
  initialiseListeners({countdown, setCountdown});
})
