import { act, render } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders NavigationBar Component', async () => {
    await act(async () => {
      render(<App tab="home" />);
    });

    expect(global.container.textContent).toContain('Smart Home');
  });
});