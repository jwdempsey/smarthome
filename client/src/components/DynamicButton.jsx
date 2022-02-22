import React, { useState } from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import ButtonState from "./ButtonState";

const DynamicButton = (props) => {
  const [buttonState, setButtonState] = useState("default");

  const handleClick = () => {
    setButtonState("loading");
    props
      .handleClick(setButtonState, props.item, props.value)
      .then(() => setTimeout(() => setButtonState("complete"), 1800));
  };

  return (
    <Button
      disabled={buttonState === 1}
      onClick={handleClick}
      variant={props.variant}
    >
      <ButtonState state={buttonState} text={props.text} />
    </Button>
  );
};

DynamicButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
  value: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default DynamicButton;
