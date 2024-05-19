import React from 'react';
import { GearFill, SunFill, PaletteFill, HouseGearFill } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';
import Toggle from '../Toggle';
import Slider from '../Slider';
import SimpleButton from '../SimpleButton';
import ColorPalette from '../ColorPalette';

const DynamicInput = (props) => {
  const defaultSize = 24;
  const Inputs = {
    turn: (
      <Toggle title={props.command} device={props.device} command={props.command}>
        <GearFill size={defaultSize} />
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
    button: (
      <SimpleButton title={props.command} device={props.device} command={props.command}>
        <HouseGearFill size={defaultSize} />
      </SimpleButton>
    ),
    colorTem: null,
  };

  return Inputs[props.input];
};

DynamicInput.propTypes = {
  title: PropTypes.string,
  device: PropTypes.object.isRequired,
  input: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
};

export default DynamicInput;
