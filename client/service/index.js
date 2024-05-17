const Service = () => {
  const baseUrl = 'api/devices';
  const availableCommands = ['power', 'brightness', 'color', 'temperature'];
  let defaultHeaders = { 'Content-Type': 'application/json' };
  let data = {
    command: '',
    value: '',
    manufacturer: '',
    model: '',
    key: '',
  };

  const notify = (message, headers = null) => {
    if (availableCommands.includes(message.command)) {
      return fetch(baseUrl, {
        method: 'POST',
        headers: assignHeaders(headers),
        body: JSON.stringify(Object.assign({}, data, message)),
      })
        .catch(handleError)
        .then(handleResponse);
    }

    return {};
  };

  const getDevice = (device, headers = null) => {
    return fetch(`${baseUrl}/${device.manufacturer}/${device.key}`, {
      method: 'GET',
      headers: assignHeaders(headers),
    })
      .catch(handleError)
      .then(handleResponse);
  };

  const getDevices = (headers = null) => {
    return fetch(baseUrl, {
      method: 'GET',
      headers: assignHeaders(headers),
    })
      .catch(handleError)
      .then(handleResponse);
  };

  const getTypes = (headers = null) => {
    return fetch(`${baseUrl}/types`, {
      method: 'GET',
      headers: assignHeaders(headers),
    })
      .catch(handleError)
      .then(handleResponse);
  };

  const handleResponse = (response) => {
    return response ? response.json() : {};
  };

  const handleError = (error) => {
    console.error(error);
  };

  const assignHeaders = (headers) => {
    return Object.assign({}, defaultHeaders, headers);
  };

  return { notify, getDevice, getDevices, getTypes };
};

export default Service();
