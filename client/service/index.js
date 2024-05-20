const Service = () => {
  const baseUrl = 'api/devices';
  const defaultHeaders = { 'Content-Type': 'application/json' };

  const fetchApi = (url, options) =>
    fetch(url, options)
      .then((response) => (response ? response.json() : {}))
      .catch((error) => console.error(error));

  const assignHeaders = (headers) => ({
    ...defaultHeaders,
    ...headers,
  });

  const notify = (message, headers = null) => {
    return fetchApi(baseUrl, {
      method: 'POST',
      headers: assignHeaders(headers),
      body: JSON.stringify(message),
    });
  };

  const getDevice = (device, headers = null) =>
    fetchApi(`${baseUrl}/${device.manufacturer}/${encodeURIComponent(device.key)}`, {
      method: 'GET',
      headers: assignHeaders(headers),
    });

  const getDevices = (headers = null) =>
    fetchApi(baseUrl, {
      method: 'GET',
      headers: assignHeaders(headers),
    });

  const getTypes = (headers = null) =>
    fetchApi(`${baseUrl}/types`, {
      method: 'GET',
      headers: assignHeaders(headers),
    });

  return { notify, getDevice, getDevices, getTypes };
};

export default Service();