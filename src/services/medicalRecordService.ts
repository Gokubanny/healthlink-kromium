// ============================================
// FILE: src/services/medicalRecordService.ts
// ============================================
import api from '@/lib/api';

export interface CreateMedicalRecordData {
  patient: string;
  title: string;
  type: string;
  date?: string;
  description?: string;
  findings?: string;
  labResults?: any[];
  vitals?: any;
  medications?: any[];
  notes?: string;
  appointment?: string;
}

class MedicalRecordService {
  async getAllRecords() {
    const response = await api.get('/medical-records');
    return response.data;
  }

  async getRecordById(id: string) {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  }

  async createRecord(data: CreateMedicalRecordData) {
    const response = await api.post('/medical-records', data);
    return response.data;
  }

  async updateRecord(id: string, data: any) {
    const response = await api.put(`/medical-records/${id}`, data);
    return response.data;
  }

  async deleteRecord(id: string) {
    const response = await api.delete(`/medical-records/${id}`);
    return response.data;
  }

  async getPatientRecords(patientId: string) {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  }
}

export default new MedicalRecordService();