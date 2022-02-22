import React from "react";
import { Spinner } from "react-bootstrap";
import { Check, X } from "react-bootstrap-icons";

const ButtonState = (props) => {
  const BUTTON_STATES = {
    default: <div>{props.text}</div>,
    loading: <Spinner animation="border" size="sm" />,
    success: <Check size={20} className="fade" />,
    failure: <X size={20} color="red" />,
    complete: <div className="fadeIn">{props.text}</div>,
  };

  return BUTTON_STATES[props.state];
};

export default ButtonState;
