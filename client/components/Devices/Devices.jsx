import React, { useState, useEffect, useContext } from 'react';
import { Container, Row } from 'react-bootstrap';
import DeviceCard from '../DeviceCard';
import Loader from '../Loader';
import service from '../../service';
import PropTypes from 'prop-types';
import { TypeContext } from '../../contexts/TypeContext';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, , currentDevice] = useContext(TypeContext);

  useEffect(() => {
    service.getDevices().then((data) => {
      setDevices(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <Container id="grid" fluid>
      <Loader isLoading={isLoading}>
        <Row>
          {devices.reduce((filtered, d) => {
            if (d.type === currentDevice || currentDevice === '') {
              filtered.push(<DeviceCard key={d.key} device={d} />);
            }
            return filtered;
          }, [])}
        </Row>
      </Loader>
    </Container>
  );
};

Devices.propTypes = {
  typeSelected: PropTypes.string,
};

export default Devices;
