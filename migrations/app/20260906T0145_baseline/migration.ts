#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1edf489d21e7f83401a28f9e804c6a68f6a9f4f06b8d763cf9bf121d1200b1ec/contract';
import endContract from '../../snapshots/1edf489d21e7f83401a28f9e804c6a68f6a9f4f06b8d763cf9bf121d1200b1ec/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'events',
        columns: [
          col('branding', 'json', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/json@1' },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('end_time', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('event_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('host_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('settings', 'json', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/json@1' },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('start_time', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('draft'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('vendor_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('venue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'events_event_type_check_a563f647',
            "\"event_type\" IN ('wedding', 'birthday', 'graduation', 'corporate', 'other')",
          ),
          checkExpression(
            'events_status_check_884c687f',
            "\"status\" IN ('draft', 'active', 'live', 'ended')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'orders',
        columns: [
          col('amount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('event_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expires_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('package', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paid_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('payment_method', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('payment_proof_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'orders_package_check_f29067ad',
            "\"package\" IN ('free', 'pro_event', 'vendor_monthly', 'vendor_yearly')",
          ),
          checkExpression(
            'orders_status_check_a61c8066',
            "\"status\" IN ('pending', 'paid', 'expired', 'cancelled')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'photos',
        columns: [
          col('event_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('file_key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('file_provider', 'text', {
            notNull: true,
            default: lit('cloudinary'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('file_url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('guest_ip', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('guest_name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'json', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/json@1' },
          }),
          col('moderated_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('thumbnail_url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('uploaded_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'photos_file_provider_check_0e83ed00',
            "\"file_provider\" IN ('cloudinary', 's3', 'r2', 'local')",
          ),
          checkExpression(
            'photos_status_check_7255d6b7',
            "\"status\" IN ('pending', 'approved', 'hidden', 'deleted')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('avatar_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('host'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('users_role_check_89e88393', "\"role\" IN ('host', 'vendor', 'admin')"),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'vendors',
        columns: [
          col('branding', 'json', {
            notNull: true,
            default: lit('{}'),
            codecRef: { codecId: 'pg/json@1' },
          }),
          col('company_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('logo_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('max_events', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('subscription', 'text', {
            notNull: true,
            default: lit('free'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'vendors_subscription_check_6309e542',
            "\"subscription\" IN ('free', 'pro', 'enterprise')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'events',
        constraint: 'events_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'vendors',
        constraint: 'vendors_user_id_key',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'events',
        index: 'events_date_idx_b4ca319c',
        columns: ['date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'events',
        index: 'events_host_id_idx_03c77a67',
        columns: ['host_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'events',
        index: 'events_slug_idx_73b7f5ce',
        columns: ['slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'events',
        index: 'events_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'events',
        index: 'events_vendor_id_idx_77af3ed6',
        columns: ['vendor_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'orders',
        index: 'orders_event_id_idx_a0568112',
        columns: ['event_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'orders',
        index: 'orders_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'photos',
        index: 'photos_event_id_idx_a0568112',
        columns: ['event_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'photos',
        index: 'photos_event_id_status_idx_e23e0027',
        columns: ['event_id', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'photos',
        index: 'photos_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'photos',
        index: 'photos_uploaded_at_idx_7a193613',
        columns: ['uploaded_at'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'events',
        foreignKey: {
          name: 'events_host_id_fkey',
          columns: ['host_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'events',
        foreignKey: {
          name: 'events_vendor_id_fkey',
          columns: ['vendor_id'],
          references: { schema: 'public', table: 'vendors', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'orders',
        foreignKey: {
          name: 'orders_event_id_fkey',
          columns: ['event_id'],
          references: { schema: 'public', table: 'events', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'orders',
        foreignKey: {
          name: 'orders_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'photos',
        foreignKey: {
          name: 'photos_event_id_fkey',
          columns: ['event_id'],
          references: { schema: 'public', table: 'events', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'vendors',
        foreignKey: {
          name: 'vendors_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
