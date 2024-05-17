import React, { useState, useEffect, createContext } from 'react';
import service from '../service';
import PropTypes from 'prop-types';

export const TypeContext = createContext({});

export const TypeProvider = (props) => {
  const [types, setTypes] = useState({});
  const [currentDevice, setCurrentDevice] = useState('');

  useEffect(() => {
    service.getTypes().then((data) => {
      setTypes(data);
    });
  }, []);

  return (
    <TypeContext.Provider
      value={[types, setTypes, currentDevice, setCurrentDevice]}
    >
      {props.children}
    </TypeContext.Provider>
  );
};

TypeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
