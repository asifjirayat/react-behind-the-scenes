# React behind the scenes

## Project structure

```bash
src/
├── App.jsx
├── assets/
│ └── logo.png
├── components/
│ ├── counter/
│ │ ├── Counter.jsx
│ │ ├── CounterHistory.jsx
│ │ └── CounterOutput.jsx
│ ├── Header.jsx
│ └── UI/
│ ├── IconButton.jsx
│ └── Icons/
│ ├── ArrowRightIcon.jsx
│ ├── MinusIcon.jsx
│ └── PlusIcon.jsx
├── index.css
├── log.js
└── main.jsx
```

## Inital Render Log

When the app first loads, you’ll see this in the console:

```bash
<App /> rendered
<Header /> rendered
- <Counter /> rendered
- - Calculating if is prime number
- - <IconButton /> rendered
- - - <MinusIcon /> rendered
- - <CountOutput /> rendered
- - <IconButton /> rendered
- - - <PlusIcon /> rendered
```

✅ This shows the initial render tree — every component renders once, top-down.

## ⚡ The Re-render Problem

In `App.jsx`, we manage two states:

```bash
const [enteredNumber, setEnteredNumber] = useState(0);
const [chosenCount, setChosenCount] = useState(0);
```

When you type in the input or click “Set”, `App` re-renders → which causes every child component to re-render too, even if their props or internal state haven’t changed.

#### Example:

- You type “5” into the input → enteredNumber updates → App re-renders.
- You click “Set” → chosenCount updates → App re-renders → <Counter /> gets new initialCount → entire counter UI re-renders.
- Even <Header />, which never changes, re-renders every time!

_📌 Key Insight: Re-rendering ≠ DOM update. React’s Virtual DOM will still diff and update only what changed in the real DOM. But unnecessary re-renders waste CPU cycles and can hurt performance in large apps._

## 🚫 App Component Current Behavior (Problem Recap)

Every time `enteredNumber` or `chosenCount` updates in `App`, the entire component re-executes → which means:

```bash
return (
  <>
    <Header />          {/* ← Re-renders every time, unnecessarily */}
    <main>
      ...input/button...
      <Counter initialCount={chosenCount} />  {/* ← Also re-renders even if chosenCount hasn’t changed */}
    </main>
  </>
);
```

Even though:

- `<Header />` has no props or hooks — it’s pure UI.
- `<Counter />` might not need to re-render if initialCount is unchanged.
  React doesn’t know that — unless we tell it.

#### ✅ Step 1: Prevent Unnecessary Re-renders with `React.memo`

- Memoize `<Header />`
  In `Header.jsx:`

```bash
import { memo } from "react";
import { log } from "../log.js";
import logoImg from "../assets/logo.png";

const Header = memo(() => {
  log("<Header /> rendered");

  return (
    <header id="main-header">
      <img src={logoImg} alt="Magnifying glass" />
      <h1>React - Behind the scenes</h1>
    </header>
  );
});

export default Header;

```

_💡 memo does a shallow comparison of props. Since `Header` has no props, it will never re-render after the first time — unless forced._

- Memoize `<Counter />`
  In `Counter.jsx:`

```bash
import { useState, memo } from "react";
// ... other imports

const isPrime = (number) => {
  // ... Prime number calculation logic here
  return true;
};

const Counter = memo(({ initialCount }) => {
  log("<Counter /> rendered", 1);
  const initialCountIsPrime = isPrime(initialCount);

  const [counter, setCounter] = useState(initialCount);

  const handleDecrement = () => setCounter((prevCounter) => prevCounter - 1);

  const handleIncrement = () => setCounter((prevCounter) => prevCounter + 1);

  return (
    <section className="counter">
      <p className="counter-info">
        The initial counter value was <strong>{initialCount}</strong>. It is{" "}
        <strong>{initialCountIsPrime ? "a" : "not a"} prime number</strong>
      </p>
      <p>
        <IconButton icon={MinusIcon} onClick={handleDecrement}>
          Decrement
        </IconButton>
        <CounterOutput value={counter} />
        <IconButton icon={PlusIcon} onClick={handleIncrement}>
          Increment
        </IconButton>
      </p>
    </section>
  );
});

export default Counter;

```

_💡 Now, `<Counter />` will only re-render if `initialCount` actually changes. Typing in the input (which updates enteredNumber) will no longer cause <Counter /> to re-render!_

### 📊 Expected Log Behavior After Step 1

- Initial Render (unchanged):

```bash
<App /> rendered
<Header /> rendered
- <Counter /> rendered
- - Calculating if is prime number
- - <IconButton /> rendered
- - - <MinusIcon /> rendered
- - <CountOutput /> rendered
- - <IconButton /> rendered
- - - <PlusIcon /> rendered
```

- Type “5” into input → `enteredNumber` updates → `App` re-renders:

```bash
<App /> rendered
```

`Header` & `Counter` re-renders eliminated.
