// ============================================
// FILE: src/services/userService.ts
// ============================================
import api from '@/lib/api';

class UserService {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  async updateAvailability(availability: any) {
    const response = await api.put('/users/availability', { availability });
    return response.data;
  }
}

export default new UserService();
