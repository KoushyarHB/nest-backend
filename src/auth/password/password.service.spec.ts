import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

// Mock bcrypt module before importing anything
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'StrongPass123!';
      const hashed = 'hashed123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);

      const result = await service.hash(password);

      expect(result).toBe(hashed);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));
    });
  });

  describe('compare', () => {
    it('should return true if passwords match', async () => {
      const plain = 'StrongPass123!';
      const hashed = 'hashed123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(plain, hashed);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plain, hashed);
    });

    it('should return false if passwords do not match', async () => {
      const plain = 'wrong';
      const hashed = 'hashed123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(plain, hashed);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(plain, hashed);
    });
  });
});
