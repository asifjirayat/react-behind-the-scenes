import { useState } from "react";
import { log } from "../../log.js";

const HistoryItem = ({ count }) => {
  log("<HistoryItem /> rendered");

  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    setSelected((pervSelected) => !pervSelected);
  };

  return (
    <li onClick={handleClick} className={selected ? "selected" : undefined}>
      {count}
    </li>
  );
};

const CounterHistory = ({ history }) => {
  log("<CounterHistory /> rendered", 2);

  return (
    <ol>
      {history.map((count, index) => (
        <HistoryItem key={index} count={count} />
      ))}
    </ol>
  );
};

export default CounterHistory;
