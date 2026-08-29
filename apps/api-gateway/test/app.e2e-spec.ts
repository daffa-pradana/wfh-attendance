import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const ADMIN_CREDENTIALS = {
  email: 'administrator@dexa.co.id',
  password: 'password123',
};

interface LoginResponseBody {
  accessToken: string;
}

interface EmployeeResponseBody {
  id: string;
  email: string;
  passwordHash?: string;
}

interface AttendanceResponseBody {
  id: string;
  status: string;
}

interface ErrorResponseBody {
  message: string;
}

describe('Critical paths (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;

  let adminToken: string;
  let employeeToken: string;
  let testEmployeeEmail: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    const adminLogin = await request(server)
      .post('/auth/login')
      .send(ADMIN_CREDENTIALS)
      .expect(200);
    adminToken = (adminLogin.body as LoginResponseBody).accessToken;

    testEmployeeEmail = `e2e-test-${Date.now()}@dexa.co.id`;
    const created = await request(server)
      .post('/admin/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'E2E Test Employee',
        email: testEmployeeEmail,
        password: 'e2e-test-password',
        position: 'QA',
        phone: '081200000099',
      })
      .expect(201);
    testEmployeeId = (created.body as EmployeeResponseBody).id;

    const employeeLogin = await request(server)
      .post('/auth/login')
      .send({ email: testEmployeeEmail, password: 'e2e-test-password' })
      .expect(200);
    employeeToken = (employeeLogin.body as LoginResponseBody).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth', () => {
    it('rejects a wrong password and a nonexistent email with the same message', async () => {
      const wrongPassword = await request(server)
        .post('/auth/login')
        .send({ email: testEmployeeEmail, password: 'not-the-password' })
        .expect(401);

      const noSuchEmail = await request(server)
        .post('/auth/login')
        .send({ email: 'nobody-e2e-test@dexa.co.id', password: 'whatever' })
        .expect(401);

      expect((wrongPassword.body as ErrorResponseBody).message).toEqual(
        (noSuchEmail.body as ErrorResponseBody).message,
      );
    });
  });

  describe('protected routes', () => {
    it('rejects a request with no token', () => {
      return request(server).get('/profile').expect(401);
    });

    it("returns the caller's own profile, never a password hash", async () => {
      const res = await request(server)
        .get('/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      const body = res.body as EmployeeResponseBody;
      expect(body.email).toBe(testEmployeeEmail);
      expect(body.passwordHash).toBeUndefined();
    });
  });

  describe('role gating', () => {
    it('blocks an employee token from an admin route', () => {
      return request(server)
        .get('/admin/employees')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });

    it('lets an admin token list employees, including the one just created', async () => {
      const res = await request(server)
        .get('/admin/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as EmployeeResponseBody[];
      expect(body.some((e) => e.id === testEmployeeId)).toBe(true);
    });
  });

  describe('attendance', () => {
    it('records a MASUK and finds it in the summary', async () => {
      const recorded = await request(server)
        .post('/attendance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ status: 'MASUK' })
        .expect(201);

      const recordedBody = recorded.body as AttendanceResponseBody;
      expect(recordedBody.status).toBe('MASUK');

      const summary = await request(server)
        .get('/attendance/summary')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      const summaryBody = summary.body as AttendanceResponseBody[];
      expect(summaryBody.some((r) => r.id === recordedBody.id)).toBe(true);
    });
  });
});
