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
