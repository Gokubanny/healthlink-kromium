// ============================================
// FILE: src/services/medicalRecordService.ts (UPDATED)
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

export interface PatientUploadRecordData {
  title: string;
  type: string;
  date?: string;
  description?: string;
  file?: File;
}

class MedicalRecordService {
  async getAllRecords() {
    const response = await api.get('/medical-records');
    return response.data;
  }

  async getMyRecords() {
    const response = await api.get('/medical-records/my-records');
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

  async uploadPatientRecord(data: PatientUploadRecordData) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    if (data.date) formData.append('date', data.date);
    if (data.description) formData.append('description', data.description);
    if (data.file) formData.append('file', data.file);

    const response = await api.post('/medical-records/patient-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  async deletePatientRecord(id: string) {
    const response = await api.delete(`/medical-records/patient/${id}`);
    return response.data;
  }

  async getPatientRecords(patientId: string) {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  }

  async getRecordTypesCount() {
    const response = await api.get('/medical-records/types/count');
    return response.data;
  }

  async getRecentRecords(limit?: number) {
    const url = limit ? `/medical-records/recent/${limit}` : '/medical-records/recent';
    const response = await api.get(url);
    return response.data;
  }
}

export default new MedicalRecordService();