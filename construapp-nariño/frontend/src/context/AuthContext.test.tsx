import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi, type User } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from './AuthContext';

vi.mock('../services/auth', () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const DEMO: User = {
  id: 'u1',
  email: 'demo@obra.co',
  name: 'Demo',
  userType: 'contractor',
  role: 'user',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
};

function Harness() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <p>cargando</p>;
  return (
    <div>
      <p>usuario: {user ? user.name : 'ninguno'}</p>
      <button onClick={() => login('demo@obra.co', 'x')}>entrar</button>
      <button onClick={() => logout()}>salir</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AuthContext', () => {
  it('sin token guardado arranca sin usuario y no llama a /me', async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );
    await screen.findByText('usuario: ninguno');
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it('logout llama a authApi.logout y deja al usuario en null', async () => {
    vi.mocked(authApi.login).mockResolvedValue(DEMO);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    await user.click(await screen.findByRole('button', { name: 'entrar' }));
    await screen.findByText('usuario: Demo');

    await user.click(screen.getByRole('button', { name: 'salir' }));
    await waitFor(() => expect(authApi.logout).toHaveBeenCalledTimes(1));
    await screen.findByText('usuario: ninguno');
  });
});
