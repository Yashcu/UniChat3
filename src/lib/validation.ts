import DOMPurify from 'dompurify'

// Input validation schemas
export const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{6,}$/, // At least 6 characters
  name: /^[a-zA-Z\s-']{1,50}$/, // Letters, spaces, hyphens, apostrophes
  courseCode: /^[A-Z]{2,4}\d{3,4}[A-Z]?$/i, // e.g., CS101, MATH201A
  studentId: /^\d{6,10}$/, // 6-10 digits
} as const

export interface ValidationError {
  field: string
  message: string
}

export class InputValidator {
  static validateEmail(email: string): ValidationError | null {
    if (!email) return { field: 'email', message: 'Email is required' }
    if (!ValidationRules.email.test(email)) {
      return { field: 'email', message: 'Please enter a valid email address' }
    }
    return null
  }

  static validatePassword(password: string): ValidationError | null {
    if (!password) return { field: 'password', message: 'Password is required' }
    if (password.length < 6) {
      return { field: 'password', message: 'Password must be at least 6 characters long' }
    }
    if (password.length > 100) {
      return { field: 'password', message: 'Password is too long' }
    }
    return null
  }

  static validateName(name: string, fieldName: string = 'name'): ValidationError | null {
    if (!name || !name.trim()) {
      return { field: fieldName, message: `${fieldName} is required` }
    }
    if (!ValidationRules.name.test(name.trim())) {
      return { field: fieldName, message: `${fieldName} contains invalid characters` }
    }
    return null
  }

  static validateMessage(content: string): ValidationError | null {
    if (!content || !content.trim()) {
      return { field: 'content', message: 'Message cannot be empty' }
    }
    if (content.length > 2000) {
      return { field: 'content', message: 'Message is too long (max 2000 characters)' }
    }
    return null
  }

  static sanitizeHtml(html: string): string {
    if (typeof window !== 'undefined' && DOMPurify) {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
        ALLOWED_ATTR: []
      })
    }
    // Server-side or fallback: strip all HTML
    return html.replace(/<[^>]*>/g, '')
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .substring(0, 1000) // Limit length
  }
}
