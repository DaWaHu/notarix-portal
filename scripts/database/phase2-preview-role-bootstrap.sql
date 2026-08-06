BEGIN;
SELECT pg_advisory_xact_lock(hashtextextended('notarix-phase-2-preview-role-rehearsal-v1',0));

DO $precondition$
BEGIN
  IF current_database() <> 'neondb' OR current_user <> 'neondb_owner' THEN RAISE EXCEPTION 'Wrong database or administrative role'; END IF;
  IF current_setting('server_version_num')::int < 170000 THEN RAISE EXCEPTION 'PostgreSQL 17 required'; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('notarix_preview_app','notarix_preview_migrator')) THEN RAISE EXCEPTION 'Proposed role already exists'; END IF;
  IF has_database_privilege(0,'neondb','CREATE') THEN RAISE EXCEPTION 'PUBLIC has CREATE on neondb'; END IF;
  IF has_schema_privilege(0,'public','CREATE') THEN RAISE EXCEPTION 'PUBLIC has CREATE on public'; END IF;
  IF NOT has_database_privilege(0,'neondb','TEMPORARY') OR NOT has_database_privilege(0,'postgres','CONNECT') OR NOT has_database_privilege(0,'template1','CONNECT') THEN RAISE EXCEPTION 'Accepted PUBLIC defaults differ from preflight'; END IF;
  IF EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspname !~ '^pg_' AND n.nspname NOT IN ('public','information_schema')) THEN RAISE EXCEPTION 'Unexpected non-system schema'; END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_depend d ON d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e' WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f') AND d.objid IS NULL) THEN RAISE EXCEPTION 'Unexpected application relation'; END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace LEFT JOIN pg_depend d ON d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e' WHERE n.nspname='public' AND d.objid IS NULL) THEN RAISE EXCEPTION 'Unexpected application routine'; END IF;
  IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace LEFT JOIN pg_depend d ON d.classid='pg_type'::regclass AND d.objid=t.oid AND d.deptype='e' WHERE n.nspname='public' AND t.typtype IN ('c','d','e','r','m') AND d.objid IS NULL AND NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.reltype=t.oid)) THEN RAISE EXCEPTION 'Unexpected standalone user type'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND (table_name ILIKE '%migration%' OR table_name ILIKE '%journal%' OR table_name ILIKE '%drizzle%')) THEN RAISE EXCEPTION 'Migration journal exists'; END IF;
END
$precondition$;

CREATE ROLE notarix_preview_app LOGIN PASSWORD NULL NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 20;
CREATE ROLE notarix_preview_migrator LOGIN PASSWORD NULL NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 2;

SELECT set_config('notarix.bootstrap_grantor_oid',(SELECT min(am.grantor)::text FROM pg_auth_members am JOIN pg_roles target ON target.oid=am.roleid JOIN pg_roles member_role ON member_role.oid=am.member WHERE target.rolname IN ('notarix_preview_app','notarix_preview_migrator') AND member_role.rolname='neondb_owner'),true);

DO $automatic_memberships$
DECLARE
  owner_oid oid := (SELECT oid FROM pg_roles WHERE rolname='neondb_owner');
  app_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_app');
  migrator_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_migrator');
  bootstrap_oid oid := current_setting('notarix.bootstrap_grantor_oid')::oid;
BEGIN
  IF bootstrap_oid IS NULL OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE oid=bootstrap_oid AND rolsuper) THEN RAISE EXCEPTION 'Automatic grantor is not a live superuser grant path'; END IF;
  IF (SELECT count(DISTINCT grantor) FROM pg_auth_members WHERE roleid IN (app_oid,migrator_oid) AND member=owner_oid) <> 1 THEN RAISE EXCEPTION 'Automatic grants do not share one grantor'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid=app_oid AND member=owner_oid AND grantor=bootstrap_oid AND admin_option AND NOT set_option AND NOT inherit_option) OR NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid=migrator_oid AND member=owner_oid AND grantor=bootstrap_oid AND admin_option AND NOT set_option AND NOT inherit_option) THEN RAISE EXCEPTION 'Automatic membership options differ from PostgreSQL 17 model'; END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid IN (app_oid,migrator_oid) AND NOT (member=owner_oid AND grantor=bootstrap_oid AND admin_option AND NOT set_option AND NOT inherit_option)) THEN RAISE EXCEPTION 'Unexpected initial membership row'; END IF;
END
$automatic_memberships$;

SELECT target.rolname AS target_role,member_role.rolname AS member_role,am.grantor AS grantor_oid,grantor_role.rolname AS grantor_role,grantor_role.rolsuper AS grantor_is_superuser,am.admin_option,am.set_option,am.inherit_option FROM pg_auth_members am JOIN pg_roles target ON target.oid=am.roleid JOIN pg_roles member_role ON member_role.oid=am.member JOIN pg_roles grantor_role ON grantor_role.oid=am.grantor WHERE target.rolname IN ('notarix_preview_app','notarix_preview_migrator') ORDER BY target.rolname,am.grantor;

GRANT CONNECT ON DATABASE neondb TO notarix_preview_app;
GRANT CONNECT ON DATABASE neondb TO notarix_preview_migrator;
GRANT USAGE ON SCHEMA public TO notarix_preview_app;
REVOKE CREATE ON SCHEMA public FROM notarix_preview_app;
GRANT USAGE,CREATE ON SCHEMA public TO notarix_preview_migrator;

GRANT notarix_preview_migrator TO neondb_owner WITH INHERIT FALSE GRANTED BY CURRENT_USER;
GRANT notarix_preview_migrator TO neondb_owner WITH SET TRUE GRANTED BY CURRENT_USER;
GRANT notarix_preview_migrator TO neondb_owner WITH ADMIN FALSE GRANTED BY CURRENT_USER;

DO $temporary_membership$
DECLARE
  owner_oid oid := (SELECT oid FROM pg_roles WHERE rolname='neondb_owner');
  migrator_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_migrator');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid=migrator_oid AND member=owner_oid AND grantor=owner_oid AND NOT admin_option AND set_option AND NOT inherit_option) THEN RAISE EXCEPTION 'Temporary owner-granted membership incorrect'; END IF;
END
$temporary_membership$;

SELECT target.rolname AS target_role,member_role.rolname AS member_role,am.grantor AS grantor_oid,grantor_role.rolname AS grantor_role,am.admin_option,am.set_option,am.inherit_option FROM pg_auth_members am JOIN pg_roles target ON target.oid=am.roleid JOIN pg_roles member_role ON member_role.oid=am.member JOIN pg_roles grantor_role ON grantor_role.oid=am.grantor WHERE target.rolname IN ('notarix_preview_app','notarix_preview_migrator') ORDER BY target.rolname,am.grantor;

SET ROLE notarix_preview_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO notarix_preview_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE,SELECT ON SEQUENCES TO notarix_preview_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
RESET ROLE;

REVOKE notarix_preview_migrator FROM neondb_owner GRANTED BY CURRENT_USER RESTRICT;

DO $final_assertions$
DECLARE
  owner_oid oid := (SELECT oid FROM pg_roles WHERE rolname='neondb_owner');
  app_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_app');
  migrator_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_migrator');
  bootstrap_oid oid := current_setting('notarix.bootstrap_grantor_oid')::oid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid=app_oid AND member=owner_oid AND grantor=bootstrap_oid AND admin_option AND NOT set_option AND NOT inherit_option) OR NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid=migrator_oid AND member=owner_oid AND grantor=bootstrap_oid AND admin_option AND NOT set_option AND NOT inherit_option) THEN RAISE EXCEPTION 'Final automatic membership incorrect'; END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid IN (app_oid,migrator_oid) AND NOT (member=owner_oid AND grantor=bootstrap_oid AND admin_option AND NOT set_option AND NOT inherit_option)) THEN RAISE EXCEPTION 'Unexpected member or temporary grant remains'; END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE member IN (app_oid,migrator_oid)) THEN RAISE EXCEPTION 'Preview role is a member of another role'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE oid=app_oid AND rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolinherit AND NOT rolreplication AND NOT rolbypassrls AND rolconnlimit=20) OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE oid=migrator_oid AND rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolinherit AND NOT rolreplication AND NOT rolbypassrls AND rolconnlimit=2) THEN RAISE EXCEPTION 'Role attributes or connection limits incorrect'; END IF;
  IF has_database_privilege(app_oid,'neondb','CREATE') OR has_database_privilege(migrator_oid,'neondb','CREATE') OR has_schema_privilege(app_oid,'public','CREATE') THEN RAISE EXCEPTION 'Excess CREATE privilege'; END IF;
  IF NOT has_database_privilege(app_oid,'neondb','CONNECT') OR NOT has_database_privilege(migrator_oid,'neondb','CONNECT') OR NOT has_schema_privilege(app_oid,'public','USAGE') OR NOT has_schema_privilege(migrator_oid,'public','USAGE') OR NOT has_schema_privilege(migrator_oid,'public','CREATE') THEN RAISE EXCEPTION 'Required effective privilege missing'; END IF;
  IF has_database_privilege(app_oid,'postgres','CREATE') OR has_database_privilege(app_oid,'template1','CREATE') OR has_database_privilege(migrator_oid,'postgres','CREATE') OR has_database_privilege(migrator_oid,'template1','CREATE') THEN RAISE EXCEPTION 'CREATE exists on Neon-managed database'; END IF;
  IF EXISTS (SELECT 1 FROM pg_database WHERE datdba IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_namespace WHERE nspowner IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_class WHERE relowner IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_proc WHERE proowner IN (app_oid,migrator_oid)) OR EXISTS (SELECT 1 FROM pg_type t WHERE t.typowner IN (app_oid,migrator_oid) AND NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.reltype=t.oid)) THEN RAISE EXCEPTION 'Preview role owns an object'; END IF;
END
$final_assertions$;

DO $default_acl_assertions$
DECLARE
  app_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_app');
  migrator_oid oid := (SELECT oid FROM pg_roles WHERE rolname='notarix_preview_migrator');
BEGIN
  IF (SELECT count(*) FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a WHERE d.defaclrole=migrator_oid AND d.defaclobjtype='r' AND d.defaclnamespace='public'::regnamespace AND a.grantee=app_oid AND a.privilege_type IN ('SELECT','INSERT','UPDATE','DELETE') AND NOT a.is_grantable) <> 4 THEN RAISE EXCEPTION 'Table default ACL incorrect'; END IF;
  IF EXISTS (SELECT 1 FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a WHERE d.defaclrole=migrator_oid AND d.defaclobjtype='r' AND d.defaclnamespace='public'::regnamespace AND (a.grantee=0 OR a.grantee NOT IN (app_oid,migrator_oid) OR (a.grantee=app_oid AND (a.privilege_type NOT IN ('SELECT','INSERT','UPDATE','DELETE') OR a.is_grantable)))) THEN RAISE EXCEPTION 'Unexpected table default ACL'; END IF;
  IF (SELECT count(*) FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a WHERE d.defaclrole=migrator_oid AND d.defaclobjtype='S' AND d.defaclnamespace='public'::regnamespace AND a.grantee=app_oid AND a.privilege_type IN ('USAGE','SELECT') AND NOT a.is_grantable) <> 2 THEN RAISE EXCEPTION 'Sequence default ACL incorrect'; END IF;
  IF EXISTS (SELECT 1 FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a WHERE d.defaclrole=migrator_oid AND d.defaclobjtype='S' AND d.defaclnamespace='public'::regnamespace AND (a.grantee=0 OR a.grantee NOT IN (app_oid,migrator_oid) OR (a.grantee=app_oid AND (a.privilege_type NOT IN ('USAGE','SELECT') OR a.is_grantable)))) THEN RAISE EXCEPTION 'Unexpected sequence default ACL'; END IF;
  IF EXISTS (SELECT 1 FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a WHERE d.defaclrole=migrator_oid AND d.defaclobjtype='f' AND d.defaclnamespace=0 AND a.grantee<>migrator_oid) THEN RAISE EXCEPTION 'Unexpected global function default ACL'; END IF;
END
$default_acl_assertions$;

SELECT target.rolname AS target_role,member_role.rolname AS member_role,am.grantor AS grantor_oid,grantor_role.rolname AS grantor_role,am.admin_option,am.set_option,am.inherit_option FROM pg_auth_members am JOIN pg_roles target ON target.oid=am.roleid JOIN pg_roles member_role ON member_role.oid=am.member JOIN pg_roles grantor_role ON grantor_role.oid=am.grantor WHERE target.rolname IN ('notarix_preview_app','notarix_preview_migrator') ORDER BY target.rolname;
SELECT d.defaclobjtype,d.defaclnamespace,grantor.rolname AS default_owner,CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE grantee.rolname END AS grantee,a.privilege_type,a.is_grantable FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a JOIN pg_roles grantor ON grantor.oid=d.defaclrole LEFT JOIN pg_roles grantee ON grantee.oid=a.grantee WHERE grantor.rolname='notarix_preview_migrator' ORDER BY d.defaclobjtype,grantee,a.privilege_type;

COMMIT;
