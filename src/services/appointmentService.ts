// ============================================
// FILE: src/services/appointmentService.ts (UPDATED WITH ERROR HANDLING)
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
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        console.log('Appointments endpoint not found, returning empty array');
        return { success: true, appointments: [] };
      }
      throw error;
    }
  }

  async getMyAppointments() {
    try {
      const response = await api.get('/appointments/my-appointments');
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        console.log('My appointments endpoint not found, returning empty array');
        return { success: true, appointments: [] };
      }
      throw error;
    }
  }

  async getAppointmentById(id: string) {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`Appointment ${id} not found`);
        return { success: false, message: 'Appointment not found' };
      }
      throw error;
    }
  }

  async createAppointment(data: CreateAppointmentData) {
    try {
      const response = await api.post('/appointments', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, data: any) {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: false, message: 'Appointment not found' };
      }
      throw error;
    }
  }

  async cancelAppointment(id: string) {
    try {
      const response = await api.put(`/appointments/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: false, message: 'Appointment not found' };
      }
      throw error;
    }
  }

  async deleteAppointment(id: string) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: false, message: 'Appointment not found' };
      }
      throw error;
    }
  }

  async getUpcomingAppointments() {
    try {
      const response = await api.get('/appointments/upcoming/list');
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        console.log('Upcoming appointments endpoint not found, returning empty array');
        return { success: true, appointments: [] };
      }
      throw error;
    }
  }

  // Mock data for development when backend endpoints are not available
}

export default new AppointmentService();