import { describe, it, expect } from '@jest/globals';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

describe('Auth Module', () => {
  it('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    expect(hashedPassword).not.toBe(password);
    expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: await bcrypt.hash('testPassword123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'USER'
    };

    const user = await User.create(userData);
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.role).toBe(userData.role);
    expect(user.password).toBe(userData.password);
  });

  it('should not create a user with duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: await bcrypt.hash('testPassword123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'USER'
    };

    await User.create(userData);
    
    await expect(User.create(userData)).rejects.toThrow();
  });
});
