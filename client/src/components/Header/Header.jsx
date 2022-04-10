import React from "react";
import PropTypes from "prop-types";

const Header = (props) => {
  return <span className="header">{props.children}</span>;
};

Header.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Header;
