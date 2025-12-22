import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto - Full Validation Suite', () => {
  let dto: RegisterDto;

  beforeEach(() => {
    dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.name = 'John Doe';
  });

  describe('Happy Path', () => {
    it('should pass validation with strong password', async () => {
      dto.password = 'StrongPass123!';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Email Validation', () => {
    it('should fail with invalid email format', async () => {
      dto.email = 'invalid';
      dto.password = 'StrongPass123!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'email')?.constraints,
      ).toHaveProperty('isEmail');
    });

    it('should fail with empty email', async () => {
      dto.email = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Name Validation', () => {
    it('should fail with empty name', async () => {
      dto.name = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with name too short', async () => {
      dto.name = 'A';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Password Strength Validation', () => {
    it('should fail if password < 8 characters', async () => {
      dto.password = 'Ab1!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail if no uppercase letter', async () => {
      dto.password = 'lowercase123!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail if no lowercase letter', async () => {
      dto.password = 'UPPERCASE123!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail if no number or special char', async () => {
      dto.password = 'NoDigitsHere';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
