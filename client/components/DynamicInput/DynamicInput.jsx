import React from 'react';
import { LightbulbFill, SunFill, PaletteFill } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';
import Toggle from '../Toggle';
import Slider from '../Slider';
import ColorPalette from '../ColorPalette';

const DynamicInput = (props) => {
  const defaultSize = 18;
  const Inputs = {
    turn: (
      <Toggle title={props.title} device={props.device}>
        <LightbulbFill size={defaultSize} />
      </Toggle>
    ),
    brightness: (
      <Slider title="Brightness" device={props.device}>
        <SunFill size={defaultSize} />
      </Slider>
    ),
    color: (
      <ColorPalette title="Color" device={props.device}>
        <PaletteFill className="modal-svg" size={defaultSize} />
      </ColorPalette>
    ),
    colorTem: null,
  };

  return Inputs[props.command];
};

DynamicInput.propTypes = {
  title: PropTypes.string,
  device: PropTypes.object.isRequired,
  command: PropTypes.string.isRequired,
};

export default DynamicInput;
