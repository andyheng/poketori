const selectors = (() => {
  const input = document.querySelector("#input")
  const submitBtn = document.querySelector("#submit")
  const currentPokemon = document.querySelector(".current")
  const startBtn = document.querySelector("#start")
  const counter = document.querySelector("#correct-answer-counter")
  return {
    getInput: function () {
      return input
    },
    getSubmitBtn: function () {
      return submit
    },
    getStartBtn: function () {
      return startBtn
    },
    getCurrentPokemon: function () {
      return currentPokemon
    },
    getCounter: function () {
      return counter
    }
  }
})();

const fetchUrls = () => {
  const speciesUrl = `https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/pokemon-species`;
  const pokemonUrl = `https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/pokemon`;
  return {
    getSpeciesUrl: function (value) {
      console.log(`${speciesUrl}/${value}`)
      return `${speciesUrl}/${value}`
    },
    getPokemonUrl: function () {
      return pokemonUrl
    }
  }
}

const trackUsedPokemon = (() => {
  let arr = [];
  function addToArray(pokemon) {
    arr.push(pokemon);
  }
  return {
    addMon: function (mon) {
      addToArray(mon)
    },
    resetArr: function () {
      arr = [];
    },
    returnArr: function () {
      return arr;
    }
  }
})()

const correctAnswerCounter = (function () {
  let counter = 0;
  const incrementCounter = () => {
    counter++;
  }
  const resetCounter = () => {
    counter = 0;
  }
  const setCounterElement = (el) => {
    el.textContent = counter;
  }
  return {
    increment: function () {
      incrementCounter();
    },
    reset: function () {
      resetCounter();
    },
    setCounter: function (el) {
      setCounterElement(el);
    }
  }
})();

const handleInputsDisabledState = (bool) => {
  if (bool) {
    selectors.getInput().disabled = true;
    selectors.getSubmitBtn().disabled = true;
  } else {
    selectors.getInput().disabled = "";
    selectors.getSubmitBtn().disabled = "";
  }
}

const handleInputOnLoad = () => {
  handleInputsDisabledState(true);
  selectors.getInput().value = "";
}

const selectRandom = () => {
  const total = 802;
  return Math.floor(Math.random() * total) + 1;
}

//button
const generateButtonText = () => {
  const current = document.querySelector(".current")
  const startBtn = selectors.getStartBtn();
  current ? startBtn.textContent = "Reset Game" : "Generate First";
}

const fetchData = (speciesUrl) => {
  return fetch(speciesUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Game Over")
      }
      return response.json()
    })
    .then(data => {
      const pokemonUrl = `${fetchUrls().getPokemonUrl()}/${data.name}`;
      console.log(pokemonUrl);
      return fetch(pokemonUrl).then(response2 => {
        if (!response2.ok) {
          throw new Error("Game Over")
        }
        return response2.json()
      })
        .then(data2 => {
          clearCurrent()
          return data2
        })
    })
}

const initialize = (selected) => {
  handleInputsDisabledState(true)
  trackUsedPokemon.resetArr()
  // const speciesUrl = `https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/pokemon-species/${selected}`;
  const speciesUrl = fetchUrls().getSpeciesUrl(selected);
  // const pokemonUrl = `https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/pokemon/`;
  // const pokemonUrl = fetchUrls().getPokemonUrl();
  return fetchData(speciesUrl);
}

const returnTypes = (data) => {
  return data.types;
}

const typingClosure = (() => {
  let arr = [];
  return {
    setCurrentTypingArray: function(array) {
      arr = array;
    },
    getCurrentTypingArray: function() {
      return arr;
    }
  }
})()

const generateContent = (data) => {
  console.log(data);
  // generate the types array and use a closure to set the closure's array equal to the generated array
  const typesArray = data.types.map(typing => {
    return typing.type.name;
  })
  typingClosure.setCurrentTypingArray(typesArray);
  console.log(typingClosure.getCurrentTypingArray())
  const el = document.createElement("div");
  el.classList.add("current");
  const typeArr = generateTyping(data, returnTypes(data));

  el.innerHTML = `
    <h2>${data.name}</h2>
    <img src=${data.sprites.front_default}>
  `;
  el.appendChild(typeArr);
  document.querySelector(".root").appendChild(el);
  trackUsedPokemon.addMon(data.name)
  timerCount.startCounter();
  console.log(trackUsedPokemon.returnArr())
}

const generateTyping = (data, types) => {
  const typesDiv = document.createElement("div");
  const typesArr = types.map(pokemon => {
    return pokemon.type.name;
  })
    .forEach(mon => {
      const p = document.createElement("p");
      p.innerHTML = mon;
      typesDiv.appendChild(p);
    })

  return typesDiv;
}

document.querySelector("#start").addEventListener("click", () => {
  const input = selectors.getInput();
  const submit = selectors.getSubmitBtn();
  const current = selectors.getCurrentPokemon();
  const counter = selectors.getCounter();
  selectors.getStartBtn().disabled = true;
  timerCount.stopCounter();
  initialize(selectRandom())
    .then(dat => {
      if (current) {
        current.remove()
      }
      generateContent(dat);
      generateButtonText();
      if (input.disabled || submit.disabled) {
        handleInputsDisabledState(false);
      }
      input.focus();
      correctAnswerCounter.reset();
      correctAnswerCounter.setCounter(counter);
      selectors.getStartBtn().disabled = "";
    })
})

const clearCurrent = () => {
  const currentPokemon = document.querySelector(".current")
  if (currentPokemon) {
    currentPokemon.remove();
  }
}

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = selectors.getInput();
  const val = input.value;
  const button = selectors.getSubmitBtn();
  // const types = document.querySelectorAll("p");
  // const typesArr = Array.from(types, item => item.textContent);
  const checkIfAlreadyUsed = trackUsedPokemon.returnArr().indexOf(val);
  console.log(checkIfAlreadyUsed);
  timerCount.stopCounter();
  if (checkIfAlreadyUsed !== -1) {
    alert("Game over; Pokemon has already been used");
    handleInputsDisabledState(true);
  } else {
    handleInputsDisabledState(true);

    const species = `https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/pokemon-species/${val}`;
    const pokemon = `https://cors-anywhere.herokuapp.com/http://pokeapi.co/api/v2/pokemon`;

    fetchData(species)
      .then(mon => {
        const checkForTrue = checkInputType(returnTypes(mon), typingClosure.getCurrentTypingArray());
        if (!checkForTrue) {
          handleInputsDisabledState(true)
          return alert("Game over, type doesn't match any")
        }
        generateContent(mon);
        handleInputsDisabledState(false)
        input.value = ""
        input.focus()
        correctAnswerCounter.increment()
        correctAnswerCounter.setCounter(selectors.getCounter())
      })
  }
})

const checkInputType = (input, prev) => {
  // iterate over input type
  // for each input array item...
  // check if indexof prev > 0
  return input.map(pokemon => {
    return pokemon.type.name;
  })
    .some(pokemon => {
      return prev.indexOf(pokemon) !== -1;
    })
}

const timerCount = (() => {
  let timer;
  return {
    startCounter: function() {
      let num = 10;
      timer = setInterval(() => {
        num--;
        if (num === 0) {
          document.querySelector("#timer-value").textContent = 0;
          handleInputsDisabledState(true);
          this.stopCounter();
        } else {
          document.querySelector("#timer-value").textContent = num;
        }
      }, 1000);
    },
    stopCounter: function() {
      clearInterval(timer);
    }
  }
})()

document.getElementById("stop").addEventListener("click", function() {
  timerCount.stopCounter()
})

window.onload = handleInputOnLoad();