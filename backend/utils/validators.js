// ============================================
// FILE: backend/utils/validators.js
// ============================================

/**
 * Validate email format
 */
exports.validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(String(email).toLowerCase());
  };
  
  /**
   * Validate phone number (Nigerian format)
   */
  exports.validatePhone = (phone) => {
    const re = /^(\+234|0)[789][01]\d{8}$/;
    return re.test(String(phone));
  };
  
  /**
   * Validate password strength
   * At least 6 characters, contains at least one letter and one number
   */
  exports.validatePassword = (password) => {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return { valid: false, message: 'Password must contain at least one letter and one number' };
    }
    
    return { valid: true, message: 'Password is valid' };
  };
  
  /**
   * Validate appointment date - must be in the future
   */
  exports.validateAppointmentDate = (date) => {
    const appointmentDate = new Date(date);
    const now = new Date();
    
    if (appointmentDate <= now) {
      return { valid: false, message: 'Appointment date must be in the future' };
    }
    
    return { valid: true, message: 'Date is valid' };
  };
  
  /**
   * Validate appointment time format (HH:MM AM/PM)
   */
  exports.validateAppointmentTime = (time) => {
    const re = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    
    if (!re.test(time)) {
      return { valid: false, message: 'Invalid time format. Use HH:MM AM/PM' };
    }
    
    return { valid: true, message: 'Time is valid' };
  };
  
  /**
   * Sanitize user input to prevent XSS attacks
   */
  exports.sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  /**
   * Generate a random patient ID
   */
  exports.generatePatientId = () => {
    const prefix = 'PAT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };
  
  /**
   * Generate a random doctor ID
   */
  exports.generateDoctorId = () => {
    const prefix = 'DOC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };
  
  /**
   * Format date to readable string
   */
  exports.formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  /**
   * Format time to 12-hour format
   */
  exports.formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  /**
   * Calculate age from date of birth
   */
  exports.calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  /**
   * Calculate BMI (Body Mass Index)
   */
  exports.calculateBMI = (weight, height) => {
    // weight in kg, height in cm
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };
  
  /**
   * Get BMI category
   */
  exports.getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi < 25) return 'Normal weight';
    if (bmi >= 25 && bmi < 30) return 'Overweight';
    return 'Obese';
  };
  
  /**
   * Validate medical license number format
   */
  exports.validateLicenseNumber = (licenseNumber) => {
    // Example format: MDCN/12345 or similar
    const re = /^[A-Z]{3,5}\/\d{4,6}$/;
    
    if (!re.test(licenseNumber)) {
      return { valid: false, message: 'Invalid license number format' };
    }
    
    return { valid: true, message: 'License number is valid' };
  };
  
  /**
   * Generate appointment reminder message
   */
  exports.generateReminderMessage = (appointment) => {
    const { appointmentDate, appointmentTime, doctor } = appointment;
    const date = exports.formatDate(appointmentDate);
    
    return `Reminder: You have an appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${date} at ${appointmentTime}.`;
  };
  
  /**
   * Check if appointment time slot is available
   */
  exports.isTimeSlotAvailable = (existingAppointments, newDate, newTime) => {
    const newDateTime = new Date(`${newDate} ${newTime}`);
    
    for (const appointment of existingAppointments) {
      const existingDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
      const timeDiff = Math.abs(newDateTime - existingDateTime);
      const minutesDiff = timeDiff / (1000 * 60);
      
      // Check if appointments are within 30 minutes of each other
      if (minutesDiff < 30) {
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * Validate blood type
   */
  exports.validateBloodType = (bloodType) => {
    const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validTypes.includes(bloodType);
  };
  
  /**
   * Generate secure random token
   */
  exports.generateSecureToken = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
  };
  
  /**
   * Parse and validate search query
   */
  exports.parseSearchQuery = (query) => {
    if (!query || typeof query !== 'string') {
      return '';
    }
    
    // Remove special characters that might cause issues
    return query.trim().replace(/[^\w\s-]/g, '');
  };
  
  /**
   * Paginate results
   */
  exports.paginate = (page = 1, limit = 10) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      page = 1;
    }
    
    if (isNaN(limitNum) || limitNum < 1) {
      limit = 10;
    }
    
    const skip = (pageNum - 1) * limitNum;
    
    return { page: pageNum, limit: limitNum, skip };
  };
  
  /**
   * Calculate pagination metadata
   */
  exports.getPaginationMetadata = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  };
  
  /**
   * Validate specialization
   */
  exports.validateSpecialty = (specialty) => {
    const validSpecialties = [
      'Cardiologist',
      'General Physician',
      'Dermatologist',
      'Pediatrician',
      'Orthopedic',
      'Neurologist',
      'Gynecologist',
      'Psychiatrist',
      'Ophthalmologist',
      'ENT Specialist',
      'Dentist',
      'Surgeon',
      'Other'
    ];
    
    return validSpecialties.includes(specialty);
  };
  
  /**
   * Generate meeting link for video consultations
   */
  exports.generateMeetingLink = (appointmentId) => {
    const baseUrl = process.env.FRONTEND_URL || 'https://healthlink-kromium.onrender.com';
    return `${baseUrl}/video-consultation/${appointmentId}`;
  };
  
  /**
   * Mask sensitive data (e.g., email, phone)
   */
  exports.maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.charAt(0) + '***' + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  };
  
  exports.maskPhone = (phone) => {
    if (phone.length < 4) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  };
  
  /**
   * Convert 12-hour time to 24-hour time
   */
  exports.convertTo24Hour = (time) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}`;
  };
  
  /**
   * Convert 24-hour time to 12-hour time
   */
  exports.convertTo12Hour = (time) => {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${hours}:${minutes} ${modifier}`;
  };
  
  /**
   * Validate date range
   */
  exports.validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return { valid: false, message: 'Start date must be before end date' };
    }
    
    return { valid: true, message: 'Date range is valid' };
  };
  
  /**
   * Get days between two dates
   */
  exports.getDaysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  };
  
  /**
   * Check if user is adult (18+)
   */
  exports.isAdult = (dateOfBirth) => {
    const age = exports.calculateAge(dateOfBirth);
    return age >= 18;
  };
  
  /**
   * Generate random color for avatar
   */
  exports.generateAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    
    const index = name.length % colors.length;
    return colors[index];
  };