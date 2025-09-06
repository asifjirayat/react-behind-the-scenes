import { memo, useCallback, useState } from "react";
import { log } from "../../log.js";

const HistoryItem = memo(({ count }) => {
  log("<HistoryItem /> rendered");

  const [selected, setSelected] = useState(false);

  const handleClick = useCallback(() => {
    setSelected((prevSelected) => !prevSelected);
  }, []);

  return (
    <li onClick={handleClick} className={selected ? "selected" : undefined}>
      {count}
    </li>
  );
});

const CounterHistory = ({ history }) => {
  log("<CounterHistory /> rendered", 2);
  return (
    <ol>
      {history.map((count) => (
        <HistoryItem key={count.id} count={count.value} />
      ))}
    </ol>
  );
};

export default CounterHistory;
