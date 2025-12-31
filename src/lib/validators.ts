
export const validators = {
  email: (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleaned = email.toLowerCase().trim();
    if (!emailRegex.test(cleaned)) {
      throw new Error('Invalid email format');
    }
    return cleaned;
  },

  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new Error('Invalid phone number');
    }
    return cleaned;
  },

  businessName: (name: string): string => {
    const cleaned = name.trim();
    if (cleaned.length < 2 || cleaned.length > 100) {
      throw new Error('Business name must be 2-100 characters');
    }
    return cleaned.replace(/[<>]/g, '');
  },

  text: (text: string, maxLength: number = 500): string => {
    const cleaned = text.trim();
    if (cleaned.length > maxLength) {
      throw new Error(`Text exceeds maximum length of ${maxLength}`);
    }
    return cleaned.replace(/[<>]/g, '');
  },

  uuid: (id: string): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid ID format');
    }
    return id;
  },

  date: (dateString: string): Date => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date;
  },

  futureDate: (dateString: string): Date => {
    const date = validators.date(dateString);
    if (date < new Date()) {
      throw new Error('Date must be in the future');
    }
    return date;
  }
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
};
