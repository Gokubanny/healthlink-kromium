// ============================================
// FILE: src/services/appointmentService.ts
// ============================================
import api from '@/lib/api';

export interface CreateAppointmentData {
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  mode: string;
  reason: string;
  notes?: string;
  location?: string;
}

class AppointmentService {
  async getAllAppointments() {
    const response = await api.get('/appointments');
    return response.data;
  }

  async getAppointmentById(id: string) {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(data: CreateAppointmentData) {
    const response = await api.post('/appointments', data);
    return response.data;
  }

  async updateAppointment(id: string, data: any) {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  }

  async cancelAppointment(id: string) {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }

  async getUpcomingAppointments() {
    const response = await api.get('/appointments/upcoming/list');
    return response.data;
  }
}

export default new AppointmentService();