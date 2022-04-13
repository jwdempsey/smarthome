import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import fetchMock from "jest-fetch-mock";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
global.__DEV__ = true;
fetchMock.enableMocks();

global.beforeEach(() => {
  global.container = document.createElement("div");
  global.root = createRoot(container);
  const fakeType = { light: { name: "Light Bulbs", icon: "lightbulb" } };
  const fakeDevice = [
    {
      name: "device1",
      key: "device1",
      model: "test",
      type: "light",
      manufacturer: "kasa",
    },
  ];

  jest
    .spyOn(global, "fetch")
    .mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(fakeDevice),
      })
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(fakeType),
      })
    );
});

global.afterEach(() => {
  act(() => {
    global.root.unmount();
  });
  global.fetch.mockRestore();
});
