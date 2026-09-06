#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1edf489d21e7f83401a28f9e804c6a68f6a9f4f06b8d763cf9bf121d1200b1ec/contract';
import startContract from '../../snapshots/1edf489d21e7f83401a28f9e804c6a68f6a9f4f06b8d763cf9bf121d1200b1ec/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a107ef2c2f525387ec0e2be52ef2f41925680073fe1d35a78851d0001700d51a/contract';
import endContract from '../../snapshots/a107ef2c2f525387ec0e2be52ef2f41925680073fe1d35a78851d0001700d51a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createIndex({
        schema: 'public',
        table: 'events',
        index: 'events_host_id_status_idx_15e7ab0e',
        columns: ['host_id', 'status'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
