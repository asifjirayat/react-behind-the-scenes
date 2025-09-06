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
- - <CounterOutput /> rendered
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

### ✅ Step 1: Prevent Unnecessary Re-renders with `React.memo`

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

const Counter = memo(({ initialCount }) => {
// ... component logic
});

export default Counter;

```

_💡 Now, `<Counter />` will only re-render if `initialCount` actually changes. Typing in the input (which updates enteredNumber) will no longer cause <Counter /> to re-render!_

#### 📊 Expected Log Behavior After Step 1

- Initial Render (unchanged):

```bash
<App /> rendered
<Header /> rendered
- <Counter /> rendered
- - Calculating if is prime number
- - <IconButton /> rendered
- - - <MinusIcon /> rendered
- - <CounterOutput /> rendered
- - <IconButton /> rendered
- - - <PlusIcon /> rendered
```

- Type “5” into input → `enteredNumber` updates → `App` re-renders:

```bash
<App /> rendered
```

`Header` & `Counter` re-renders eliminated.

### 🧵 Step 2: Stabilize Handlers with `useCallback`

Even after memoizing components, function props can break memoization because React creates new function references on every render.

#### The Problem:

In `Counter.jsx`:

```bash
const handleIncrement = () => setCounter(); // New function every render!
```

```bash
const handleDecrement = () => setCounter(); // New function every render!
```

- Passed to `<IconButton onClick={handleIncrement} />`
- Passed to `<IconButton onClick={handleDecrement} />`
- Even if `IconButton` is memoized, new `onClick` = new props = re-render.

#### The Fix: `useCallback`

```bash
 const handleIncrement = useCallback(
    () => setCounter((prevCounter) => prevCounter + 1),
    []
  );
```

```bash
const handleDecrement = useCallback(
  () => setCounter((prevCounter) => prevCounter - 1),
  []
);
```

#### Also Memoize Reusable Components

We also wrapped: `IconButton.jsx` with `memo`

```bash
import { memo } from "react";

const IconButton = memo(({ children, icon, ...props }) => {
 // ... JSX
});

export default IconButton;
```

#### 📊 Expected Log Behavior After Step 2

```bash
- <Counter /> rendered
- - Calculating if is prime number
- - <CounterOutput /> rendered
```

### 🧮 Step 3: Optimizing Expensive Calculations with `useMemo`

Even after stabilizing components and handlers, we still see this in the logs every time `<Counter />` re-renders:

```bash
- - Calculating if is prime number
```

This happens because `isPrime(initialCount)` is called directly during render, and every render recalculates it, even if `initialCount` hasn’t changed.

#### The Problem:

```bash
const initialCountIsPrime = isPrime(initialCount); // Runs on every render!
```

- Expensive calculation (looping up to √n) runs unnecessarily.
- Wastes CPU, especially if initialCount is large or renders are frequent.

#### The Fix: `useMemo`

```bash
const initialCountIsPrime = useMemo(
  () => isPrime(initialCount),
  [initialCount] // Only recalculate when this dependency changes
);
```

- Now, `isPrime` runs only once on mount, and only again if `initialCount` changes.

#### 📊 Expected Log Behavior After Step 3

```bash
- <Counter /> rendered
- - <CounterOutput /> rendered
```

## 🎓 Final Thoughts: Mastering React’s Render Behavior

You’ve now walked through a real-world journey of React optimization — from naive re-renders to a finely tuned component tree.

#### By applying:

- React.memo → to skip unnecessary renders
- useCallback → to stabilize function props
- useMemo → to cache expensive computations
  …you’ve transformed your app from “it works” to “it works efficiently”, the hallmark of production-grade React.

### 🧭 Key Takeaways

- ✅ Re-renders are normal — but unnecessary ones are avoidable.
- ✅ Memoization is a tool, not a default — apply it intentionally.
- ✅ Stable references (via useCallback) are essential for preserving memoization.
- ✅ Expensive calculations belong in useMemo — not in the render body.
- ✅ Logging and observation are your best friends for debugging renders.

## 💬 Thank You for Learning with Us

Whether you’re prepping for interviews, leveling up at work, or just curious — you’ve taken the time to look behind the scenes. That’s what makes great developers.

#### Keep experimenting. Keep logging. Keep asking “why?”

Happy coding! 🎉
