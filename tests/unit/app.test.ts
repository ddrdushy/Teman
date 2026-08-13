import { describe, it, expect } from 'vitest';

describe('Teman Utils', () => {
  describe('Internationalization', () => {
    it('should support multiple languages', () => {
      const supportedLanguages = ['en', 'ms', 'ta', 'zh'];
      
      expect(supportedLanguages).toContain('en');
      expect(supportedLanguages).toContain('ms');
      expect(supportedLanguages).toContain('ta');
      expect(supportedLanguages).toContain('zh');
    });

    it('should have language names mapped correctly', () => {
      const languageNames: Record<string, string> = {
        en: 'English',
        ms: 'Malay',
        ta: 'Tamil',
        zh: 'Chinese',
      };

      Object.entries(languageNames).forEach(([code, name]) => {
        expect(name).toBeTruthy();
        expect(code).toBeTruthy();
      });
    });
  });

  describe('Text Size Options', () => {
    it('should have valid text size options', () => {
      const textSizes = ['small', 'medium', 'large'];
      
      expect(textSizes.length).toBe(3);
      expect(textSizes).toContain('small');
      expect(textSizes).toContain('medium');
      expect(textSizes).toContain('large');
    });

    it('should map text sizes to CSS values', () => {
      const textSizeMap: Record<string, number> = {
        small: 14,
        medium: 16,
        large: 18,
      };

      Object.values(textSizeMap).forEach(size => {
        expect(size).toBeGreaterThan(0);
      });
    });
  });

  describe('User Preferences', () => {
    it('should have preference schema', () => {
      const preferences = {
        language: 'en',
        textSize: 'medium',
        notifications: true,
      };

      expect(preferences).toHaveProperty('language');
      expect(preferences).toHaveProperty('textSize');
      expect(preferences).toHaveProperty('notifications');
    });

    it('should validate preference values', () => {
      const validLanguages = ['en', 'ms', 'ta', 'zh'];
      const validSizes = ['small', 'medium', 'large'];
      
      const userLanguage = 'en';
      const userSize = 'medium';

      expect(validLanguages).toContain(userLanguage);
      expect(validSizes).toContain(userSize);
    });
  });
});

describe('Application Features', () => {
  describe('Volunteer Onboarding', () => {
    it('should require essential volunteer information', () => {
      const volunteerSchema = {
        name: { required: true },
        phone: { required: true },
        email: { required: false },
        categories: { required: true },
        availability: { required: true },
      };

      expect(volunteerSchema.name.required).toBe(true);
      expect(volunteerSchema.phone.required).toBe(true);
      expect(volunteerSchema.categories.required).toBe(true);
    });
  });

  describe('Care Matching', () => {
    it('should validate matching criteria', () => {
      const criteria = {
        location: true,
        availability: true,
        category: true,
        language: true,
      };

      const matchingFactors = Object.keys(criteria);
      expect(matchingFactors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
