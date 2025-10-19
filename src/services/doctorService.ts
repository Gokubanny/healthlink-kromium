// ============================================
// FILE 3: src/services/doctorService.ts (FIXED)
// ============================================
import api from '@/lib/api';

export interface DoctorFilters {
  specialty?: string;
  search?: string;
  limit?: number;
  page?: number;
}

class DoctorService {
  async getAllDoctors(filters?: DoctorFilters) {
    try {
      const params = new URLSearchParams();
      
      if (filters?.specialty) params.append('specialty', filters.specialty);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/doctors?${queryString}` : '/doctors';
      
      console.log('Fetching doctors from:', url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Doctor service error:', error);
      throw error;
    }
  }

  async getDoctorById(id: string) {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  }

  async getSpecialties() {
    const response = await api.get('/doctors/specialties/list');
    return response.data;
  }
}

export default new DoctorService();