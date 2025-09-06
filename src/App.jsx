import { useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Counter from "./components/counter/Counter.jsx";
import { log } from "./log.js";

const App = () => {
  log("<App /> rendered");

  const [enteredNumber, setEnteredNumber] = useState(0);
  const [chosenCount, setChosenCount] = useState(0);
  const inputRef = useRef();

  const handleChange = (event) => setEnteredNumber(+event.target.value);

  const handleSetClick = () => {
    setChosenCount(enteredNumber);
    setEnteredNumber(inputRef.current.value);
  };

  console.log(chosenCount);

  return (
    <>
      <Header />
      <main>
        <section id="configure-counter">
          <h2>Set Counter</h2>
          <input
            ref={inputRef}
            type="number"
            onChange={handleChange}
            value={enteredNumber}
          />
          <button onClick={handleSetClick}>Set</button>
        </section>
        <Counter initialCount={chosenCount} />
      </main>
    </>
  );
};

export default App;
