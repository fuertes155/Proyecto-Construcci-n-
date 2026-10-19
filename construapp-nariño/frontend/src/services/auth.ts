import { api, tokenStore } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'owner' | 'contractor' | 'engineer' | 'provider';
  role: 'admin' | 'provider' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}

interface Session {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export const authApi = {
  async register(input: {
    email: string;
    password: string;
    name: string;
    userType?: User['userType'];
  }): Promise<User> {
    const { data } = await api.post<User>('/auth/register', input);
    return data;
  },

  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post<Session>('/auth/login', { email, password });
    tokenStore.set(data.token, data.refreshToken);
    return data.user;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStore.refresh;
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } finally {
      tokenStore.clear();
    }
  },
};

export default authApi;
