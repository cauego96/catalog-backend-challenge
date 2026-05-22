import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AuditEventsConsumer } from '../src/modules/audit/infrastructure/messaging/consumers/audit-events.consumer';
import { DOMAIN_EVENT_PUBLISHER } from '../src/shared/domain/events/domain-event-publisher';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require('supertest');

jest.setTimeout(30000);

const TEST_CATEGORY_PREFIX = 'E2E_CATEGORY_';
const TEST_PRODUCT_PREFIX = 'E2E_PRODUCT_';

describe('Product Catalog Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DOMAIN_EVENT_PUBLISHER)
      .useValue({
        publish: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(AuditEventsConsumer)
      .useValue({
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        onModuleDestroy: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);

    await clearTestData();
  });

  afterAll(async () => {
    await clearTestData();
    await app?.close();
  });

  it('should create category, create product, add category, add attribute and activate product', async () => {
    // Arrange
    const categoryName = `${TEST_CATEGORY_PREFIX}Electronics_${Date.now()}`;
    const productName = `${TEST_PRODUCT_PREFIX}Smartphone_${Date.now()}`;

    // Act
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: categoryName })
      .expect(201);

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send({ name: productName, description: 'A phone' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/categories`)
      .send({ categoryId: categoryResponse.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/attributes`)
      .send({ key: 'color', value: 'black' })
      .expect(201);

    const activatedResponse = await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/activate`)
      .expect(201);

    // Assert
    const activatedProduct = toProductSnapshot(activatedResponse.body);

    expect(activatedProduct.status).toBe('ACTIVE');
    expect(activatedProduct.categoryIds).toContain(categoryResponse.body.id);
    expect(activatedProduct.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'color',
          value: 'black',
        }),
      ]),
    );
  });

  it('should update product details and attribute values during the catalog flow', async () => {
    // Arrange
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: `${TEST_CATEGORY_PREFIX}Computers_${Date.now()}` })
      .expect(201);

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: `${TEST_PRODUCT_PREFIX}Notebook_${Date.now()}`,
        description: 'Initial description',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/categories`)
      .send({ categoryId: categoryResponse.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/attributes`)
      .send({ key: 'memory', value: '8GB' })
      .expect(201);

    // Act
    const updatedProductResponse = await request(app.getHttpServer())
      .patch(`/products/${productResponse.body.id}`)
      .send({
        name: `${TEST_PRODUCT_PREFIX}Notebook_Pro_${Date.now()}`,
        description: 'Updated description',
      })
      .expect(200);

    const updatedAttributeResponse = await request(app.getHttpServer())
      .patch(`/products/${productResponse.body.id}/attributes/memory`)
      .send({ value: '16GB' })
      .expect(200);

    // Assert
    const updatedProduct = toProductSnapshot(updatedProductResponse.body);
    const updatedAttributeProduct = toProductSnapshot(
      updatedAttributeResponse.body,
    );

    expect(updatedProduct.name).toContain('Notebook_Pro');
    expect(updatedProduct.description).toBe('Updated description');
    expect(updatedAttributeProduct.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'memory',
          value: '16GB',
        }),
      ]),
    );
  });

  it('should remove product category and attribute and archive the product', async () => {
    // Arrange
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: `${TEST_CATEGORY_PREFIX}Accessories_${Date.now()}` })
      .expect(201);

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: `${TEST_PRODUCT_PREFIX}Mouse_${Date.now()}`,
        description: 'Wireless mouse',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/categories`)
      .send({ categoryId: categoryResponse.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/attributes`)
      .send({ key: 'dpi', value: '1600' })
      .expect(201);

    // Act
    const categoryRemovalResponse = await request(app.getHttpServer())
      .delete(
        `/products/${productResponse.body.id}/categories/${categoryResponse.body.id}`,
      )
      .expect(200);

    const attributeRemovalResponse = await request(app.getHttpServer())
      .delete(`/products/${productResponse.body.id}/attributes/dpi`)
      .expect(200);

    const archivedResponse = await request(app.getHttpServer())
      .post(`/products/${productResponse.body.id}/archive`)
      .expect(201);

    // Assert
    const categoryRemovalProduct = toProductSnapshot(
      categoryRemovalResponse.body,
    );
    const attributeRemovalProduct = toProductSnapshot(
      attributeRemovalResponse.body,
    );
    const archivedProduct = toProductSnapshot(archivedResponse.body);

    expect(categoryRemovalProduct.categoryIds).not.toContain(
      categoryResponse.body.id,
    );
    expect(attributeRemovalProduct.attributes).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          key: 'dpi',
        }),
      ]),
    );
    expect(archivedProduct.status).toBe('ARCHIVED');
  });

  async function clearTestData() {
    await dataSource.query(
      `
        DELETE FROM "audit_logs"
        WHERE "aggregate_id" IN (
          SELECT "id"::text FROM "products" WHERE "name" LIKE $1
        )
        OR "aggregate_id" IN (
          SELECT "id"::text FROM "categories" WHERE "name" LIKE $2
        )
      `,
      [`${TEST_PRODUCT_PREFIX}%`, `${TEST_CATEGORY_PREFIX}%`],
    );

    await dataSource.query(
      `
        DELETE FROM "products"
        WHERE "name" LIKE $1
      `,
      [`${TEST_PRODUCT_PREFIX}%`],
    );

    await dataSource.query(
      `
        DELETE FROM "categories"
        WHERE "name" LIKE $1
      `,
      [`${TEST_CATEGORY_PREFIX}%`],
    );
  }

  function toProductSnapshot(body: Record<string, unknown>) {
    return {
      id: body.id as string,
      name: body._name as string,
      description: (body._description ?? null) as string | null,
      status: body._status as string,
      categoryIds: (body._categoryIds ?? []) as string[],
      attributes: (
        (body._attributes ?? []) as Array<Record<string, unknown>>
      ).map((attribute) => ({
        id: attribute.id as string,
        key: attribute.key as string,
        value: attribute._value as string,
      })),
    };
  }
});
