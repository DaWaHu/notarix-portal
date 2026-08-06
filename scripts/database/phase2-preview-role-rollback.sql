BEGIN;
SELECT pg_advisory_xact_lock(hashtextextended('notarix-phase-2-preview-role-rehearsal-v1',0));

DO $rollback_precondition$
BEGIN
  IF current_database() <> 'neondb' OR current_user <> 'neondb_owner' THEN RAISE EXCEPTION 'Rollback must run as neondb_owner in neondb'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='notarix_preview_app') OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='notarix_preview_migrator') THEN RAISE EXCEPTION 'Expected Preview roles are missing'; END IF;
END
$rollback_precondition$;

GRANT notarix_preview_migrator TO neondb_owner WITH INHERIT FALSE GRANTED BY CURRENT_USER;
GRANT notarix_preview_migrator TO neondb_owner WITH SET TRUE GRANTED BY CURRENT_USER;
GRANT notarix_preview_migrator TO neondb_owner WITH ADMIN FALSE GRANTED BY CURRENT_USER;

SET ROLE notarix_preview_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT,INSERT,UPDATE,DELETE ON TABLES FROM notarix_preview_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE USAGE,SELECT ON SEQUENCES FROM notarix_preview_app;
ALTER DEFAULT PRIVILEGES GRANT EXECUTE ON FUNCTIONS TO PUBLIC;
RESET ROLE;

REVOKE notarix_preview_migrator FROM neondb_owner GRANTED BY CURRENT_USER RESTRICT;
REVOKE USAGE ON SCHEMA public FROM notarix_preview_app;
REVOKE USAGE,CREATE ON SCHEMA public FROM notarix_preview_migrator;
REVOKE CONNECT ON DATABASE neondb FROM notarix_preview_app;
REVOKE CONNECT ON DATABASE neondb FROM notarix_preview_migrator;

DO $rollback_assertions$
DECLARE
  app_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_app');
  migrator_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_migrator');
BEGIN
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid IN (app_oid,migrator_oid) AND grantor <> 10) THEN RAISE EXCEPTION 'A non-bootstrap membership remains before role drop'; END IF;
  IF EXISTS (SELECT 1 FROM pg_default_acl WHERE defaclrole=migrator_oid) THEN RAISE EXCEPTION 'Migrator default ACL remains'; END IF;
  IF EXISTS (SELECT 1 FROM pg_database WHERE coalesce(datacl::text,'') ~ 'notarix_preview_(app|migrator)') OR EXISTS (SELECT 1 FROM pg_namespace WHERE coalesce(nspacl::text,'') ~ 'notarix_preview_(app|migrator)') THEN RAISE EXCEPTION 'Preview role ACL remains'; END IF;
  IF EXISTS (SELECT 1 FROM pg_database WHERE datdba IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_namespace WHERE nspowner IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_class WHERE relowner IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_proc WHERE proowner IN (app_oid,migrator_oid)) THEN RAISE EXCEPTION 'Preview role owns an object'; END IF;
END
$rollback_assertions$;

DROP ROLE notarix_preview_app;
DROP ROLE notarix_preview_migrator;

DO $rollback_final$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('notarix_preview_app','notarix_preview_migrator')) THEN RAISE EXCEPTION 'Preview role rollback incomplete'; END IF;
END
$rollback_final$;

COMMIT;
