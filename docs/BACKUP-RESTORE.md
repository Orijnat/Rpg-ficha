# 💾 Backup, restauração e retenção

Escopo: PostgreSQL completo (`pg_dump` lógico). **Não** cobre os arquivos de
upload em `UPLOAD_DIR` — eles precisam de backup próprio (ver abaixo).

## Agendamento

```cron
# Ex.: diariamente às 03:15
15 3 * * * cd /opt/rpg-backend && npm run db:backup >> /var/log/rpg-backup.log 2>&1
# Limpeza semanal de backups antigos (retenção 30 dias por padrão)
30 4 * * 0 cd /opt/rpg-backend && npm run db:prune >> /var/log/rpg-backup.log 2>&1
```

Variáveis: `DATABASE_URL`, `BACKUP_DIR` (padrão `./backups`),
`BACKUP_RETENTION_DAYS` (padrão `30`).

## Criar backup

```bash
cd Rpg-backend
npm run db:backup           # backups/backup-AAAAMMDD-HHMMSS.sql.gz
```

O arquivo é `pg_dump --no-owner --no-privileges` comprimido com gzip.
**Copie o `.sql.gz` para armazenamento externo** (S3/Supabase Storage/outro host):
um backup no mesmo disco não é backup.

## Restaurar

```bash
cd Rpg-backend
CONFIRMO_RESTAURACAO=RESTAURAR DATABASE_URL="postgres://.../destino" \
  node database/backup.js --restore caminho/para/backup-AAAAMMDD-HHMMSS.sql.gz
```

- A confirmação `CONFIRMO_RESTAURACAO=RESTAURAR` é obrigatória (evita sobrescrever por engano).
- Restaura em qualquer PostgreSQL ≥ 14. Linhas `SET transaction_timeout` (emitidas
  por `pg_dump` ≥ 17 em servidores antigos) são filtradas automaticamente.
- **Sempre teste a restauração em um banco descartável** antes de confiar no processo:
  ```bash
  createdb rpg_restore_test
  CONFIRMO_RESTAURACAO=RESTAURAR DATABASE_URL="postgres://.../rpg_restore_test" \
    node database/backup.js --restore backups/backup-....sql.gz
  psql rpg_restore_test -c '\dt'   # confira as tabelas
  dropdb rpg_restore_test
  ```
  (Procedimento executado e verificado em 2026-11-14 contra o schema atual.)

## Uploads (`private_uploads/`)

- Local: `UPLOAD_DIR` (fora do diretório público; nomes internos aleatórios).
- Backup: sincronize a pasta com o destino externo (rsync/rclone). Sem ele,
  imagens das anotações e anexos de mesa somem junto com o host.
- Orfãos (arquivo em disco sem metadado, ou vice-versa): `npm run uploads:clean`
  (com `--dry-run` para só listar).
- Retenção sugerida: 90 dias para arquivos sem vínculo com campanha/ficha.

## RPO/RPO-alvo

- RPO (perda máxima de dados): 24h com o agendamento diário; 1h se rodar por hora.
- RTO (tempo de restauração): ~minutos para banco lógico pequeno; limitar com
  `pg_dump -Fc` (custom format) se crescer.
