import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../context/AuthContext';
import type { User } from '../services/auth';
import ProtectedRoute from './ProtectedRoute';

const DEMO_USER: User = {
  id: 'u1',
  email: 'demo@obra.co',
  name: 'Demo',
  userType: 'contractor',
  role: 'user',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
};

function LoginStub() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  return <div>LOGIN desde={from ?? 'ninguno'}</div>;
}

function renderAt(path: string, auth: { user: User | null; loading: boolean }) {
  const value = { ...auth, login: vi.fn(), register: vi.fn(), logout: vi.fn() } as never;
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>CONTENIDO PRIVADO</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('mientras carga la sesión muestra un estado de carga', () => {
    renderAt('/dashboard', { user: null, loading: true });
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('sin sesión redirige a /login recordando la URL original', () => {
    renderAt('/dashboard', { user: null, loading: false });
    expect(screen.getByText(/^LOGIN/)).toBeInTheDocument();
    expect(screen.getByText(/desde=\/dashboard/)).toBeInTheDocument();
    expect(screen.queryByText('CONTENIDO PRIVADO')).not.toBeInTheDocument();
  });

  it('con sesión renderiza el contenido privado', () => {
    renderAt('/dashboard', { user: DEMO_USER, loading: false });
    expect(screen.getByText('CONTENIDO PRIVADO')).toBeInTheDocument();
  });
});
