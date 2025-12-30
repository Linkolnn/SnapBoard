import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Начальная миграция - создание всех таблиц базы данных
 * Таблицы: users, boards, images, favorites, board_images
 */
export class InitialSchema1704067200000 implements MigrationInterface {
  name = 'InitialSchema1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание таблицы users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "username" character varying(50) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "name" character varying(100),
        "bio" text,
        "avatar" character varying(500),
        "refresh_token" character varying(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Создание таблицы boards
    await queryRunner.query(`
      CREATE TABLE "boards" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(100) NOT NULL,
        "description" text,
        "user_id" uuid NOT NULL,
        "cover_image" character varying(500),
        "is_private" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_boards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_boards_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Создание таблицы images
    await queryRunner.query(`
      CREATE TABLE "images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "url" character varying(500) NOT NULL,
        "title" character varying(200),
        "description" text,
        "board_id" uuid,
        "user_id" uuid NOT NULL,
        "tags" text[],
        "width" integer,
        "height" integer,
        "size" integer,
        "mime_type" character varying(50),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_images_board" FOREIGN KEY ("board_id") 
          REFERENCES "boards"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_images_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Создание таблицы favorites
    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "image_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_favorites_user_image" UNIQUE ("user_id", "image_id"),
        CONSTRAINT "FK_favorites_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_favorites_image" FOREIGN KEY ("image_id") 
          REFERENCES "images"("id") ON DELETE CASCADE
      )
    `);

    // Создание таблицы board_images
    await queryRunner.query(`
      CREATE TABLE "board_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "board_id" uuid NOT NULL,
        "image_id" uuid NOT NULL,
        "saved_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_board_images" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_board_images_board_image" UNIQUE ("board_id", "image_id"),
        CONSTRAINT "FK_board_images_board" FOREIGN KEY ("board_id") 
          REFERENCES "boards"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_board_images_image" FOREIGN KEY ("image_id") 
          REFERENCES "images"("id") ON DELETE CASCADE
      )
    `);

    // Создание индексов для оптимизации запросов
    await queryRunner.query(
      `CREATE INDEX "idx_boards_user_id" ON "boards" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_images_board_id" ON "images" ("board_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_images_user_id" ON "images" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_images_tags" ON "images" USING GIN ("tags")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_favorites_user_id" ON "favorites" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_board_images_board_id" ON "board_images" ("board_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление индексов
    await queryRunner.query(`DROP INDEX "idx_board_images_board_id"`);
    await queryRunner.query(`DROP INDEX "idx_favorites_user_id"`);
    await queryRunner.query(`DROP INDEX "idx_images_tags"`);
    await queryRunner.query(`DROP INDEX "idx_images_user_id"`);
    await queryRunner.query(`DROP INDEX "idx_images_board_id"`);
    await queryRunner.query(`DROP INDEX "idx_boards_user_id"`);

    // Удаление таблиц в обратном порядке (из-за foreign keys)
    await queryRunner.query(`DROP TABLE "board_images"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "images"`);
    await queryRunner.query(`DROP TABLE "boards"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
