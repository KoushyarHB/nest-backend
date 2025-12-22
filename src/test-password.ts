import { PasswordService } from './auth/password/password.service';

async function testPassword() {
  const passwordService = new PasswordService();
  const hash = await passwordService.hash('StrongPass123!');
  console.log('Hash:', hash);
  const match = await passwordService.compare('StrongPass123!', hash);
  console.log('Match:', match);
}

testPassword().catch((error) => {
  console.error('Error testing password:', error);
  process.exit(1);
});
