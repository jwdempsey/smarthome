import React, { useContext } from "react";
import { ListGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import { TypeContext } from "../contexts/TypeContext";

const ListItem = (props) => {
  const [, , , setCurrentDevice] = useContext(TypeContext);

  const handleClick = (value) => {
    setCurrentDevice(value);
  };

  return (
    <ListGroup.Item
      action
      onClick={() => {
        handleClick(props.value);
      }}
    >
      <i className={props.icon} />
      {props.name}
    </ListGroup.Item>
  );
};

ListItem.propTypes = {
  value: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default ListItem;
