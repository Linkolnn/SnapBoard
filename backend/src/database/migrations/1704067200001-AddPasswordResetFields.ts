import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Миграция для добавления полей восстановления пароля
 */
export class AddPasswordResetFields1704067200001 implements MigrationInterface {
  name = 'AddPasswordResetFields1704067200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавление поля reset_token
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "reset_token" character varying(255)
    `);

    // Добавление поля reset_token_expires
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "reset_token_expires" TIMESTAMP
    `);

    // Индекс для быстрого поиска по токену
    await queryRunner.query(`
      CREATE INDEX "idx_users_reset_token" ON "users" ("reset_token")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_users_reset_token"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token_expires"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token"`);
  }
}
