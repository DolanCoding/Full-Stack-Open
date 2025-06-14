import { Link } from "react-router-dom";

const Menu = () => (
  <div className="menu-bar">
    <Link className="menu-link" to="/">
      anecdotes
    </Link>{" "}
    |
    <Link className="menu-link" to="/create">
      create new
    </Link>{" "}
    |
    <Link className="menu-link" to="/about">
      about
    </Link>
  </div>
);

export default Menu;
