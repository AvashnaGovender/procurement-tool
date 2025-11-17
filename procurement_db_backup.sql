--
-- PostgreSQL database dump
--

\restrict 9pfMsyevBUV9yifEeyW8lhLpcPml96Ob36gg0o27GuUtNntxJ9ic7zvUEluIgmh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: AIAnalysisStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AIAnalysisStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REVISION_REQUESTED'
);


--
-- Name: BusinessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessType" AS ENUM (
    'PTY_LTD',
    'SOLE_PROPRIETORSHIP',
    'PARTNERSHIP',
    'CLOSE_CORPORATION',
    'TRUST',
    'NGO',
    'OTHER'
);


--
-- Name: BusinessUnit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessUnit" AS ENUM (
    'SCHAUENBURG_SYSTEMS_200',
    'SCHAUENBURG_PTY_LTD_300'
);


--
-- Name: CheckStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CheckStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'PASSED',
    'FAILED',
    'REQUIRES_ATTENTION'
);


--
-- Name: ContractStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractStatus" AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'ACTIVE',
    'EXPIRED',
    'TERMINATED',
    'RENEWED'
);


--
-- Name: ContractType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractType" AS ENUM (
    'FIXED_PRICE',
    'TIME_AND_MATERIALS',
    'COST_PLUS',
    'FRAMEWORK_AGREEMENT',
    'SERVICE_LEVEL_AGREEMENT',
    'OTHER'
);


--
-- Name: DelegationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DelegationType" AS ENUM (
    'ALL_APPROVALS',
    'MANAGER_APPROVALS',
    'PROCUREMENT_APPROVALS',
    'REQUISITION_APPROVALS',
    'CONTRACT_APPROVALS'
);


--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'SCHEDULED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELAYED',
    'FAILED',
    'CANCELLED'
);


--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'OPENED',
    'CLICKED',
    'BOUNCED',
    'FAILED'
);


--
-- Name: EmailType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmailType" AS ENUM (
    'ONBOARDING_INVITATION',
    'REMINDER',
    'APPROVAL_NOTIFICATION',
    'REJECTION_NOTIFICATION',
    'REVISION_REQUEST',
    'COMPLETION_NOTIFICATION',
    'CONTRACT_RENEWAL',
    'PURCHASE_ORDER',
    'GENERAL'
);


--
-- Name: InitiationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InitiationStatus" AS ENUM (
    'SUBMITTED',
    'MANAGER_APPROVED',
    'PROCUREMENT_APPROVED',
    'APPROVED',
    'REJECTED',
    'EMAIL_SENT',
    'SUPPLIER_EMAILED'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PAID',
    'OVERDUE',
    'DISPUTED',
    'CANCELLED'
);


--
-- Name: ModuleType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ModuleType" AS ENUM (
    'SUPPLIER_ONBOARDING',
    'REQUISITION',
    'CONTRACT',
    'SUPPLIER_EVALUATION',
    'PURCHASE_ORDER'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'REQUISITION_APPROVAL_NEEDED',
    'REQUISITION_APPROVED',
    'REQUISITION_REJECTED',
    'SUPPLIER_ONBOARDING_COMPLETE',
    'CONTRACT_EXPIRING',
    'DELIVERY_DELAYED',
    'INVOICE_DUE',
    'GENERAL'
);


--
-- Name: OnboardingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OnboardingStatus" AS ENUM (
    'INITIATED',
    'EMAIL_SENT',
    'AWAITING_RESPONSE',
    'DOCUMENTS_RECEIVED',
    'UNDER_REVIEW',
    'REVISION_NEEDED',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


--
-- Name: OnboardingStep; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OnboardingStep" AS ENUM (
    'INITIATE',
    'PENDING_SUPPLIER_RESPONSE',
    'REVIEW',
    'REVISION_REQUESTED',
    'COMPLETE'
);


--
-- Name: POStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."POStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'ACKNOWLEDGED',
    'IN_PROGRESS',
    'PARTIALLY_DELIVERED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: PerformanceRating; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PerformanceRating" AS ENUM (
    'EXCELLENT',
    'GOOD',
    'SATISFACTORY',
    'NEEDS_IMPROVEMENT',
    'POOR'
);


--
-- Name: ReminderConfigType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderConfigType" AS ENUM (
    'SUPPLIER_DOCUMENT_SUBMISSION',
    'MANAGER_APPROVAL_PENDING',
    'PROCUREMENT_APPROVAL_PENDING',
    'BUYER_REVIEW_PENDING',
    'SUPPLIER_REVISION_PENDING'
);


--
-- Name: ReminderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'CANCELLED'
);


--
-- Name: ReminderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderType" AS ENUM (
    'INITIAL_FOLLOW_UP',
    'DOCUMENT_SUBMISSION',
    'REVIEW_PENDING',
    'REVISION_REQUIRED',
    'FINAL_REMINDER',
    'CUSTOM'
);


--
-- Name: RequisitionPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RequisitionPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


--
-- Name: RequisitionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RequisitionStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'CONVERTED_TO_PO',
    'COMPLETED'
);


--
-- Name: SupplierStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SupplierStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'SUSPENDED',
    'INACTIVE'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'PROCUREMENT_MANAGER',
    'PROCUREMENT_SPECIALIST',
    'APPROVER',
    'FINANCE',
    'USER',
    'MANAGER'
);


--
-- Name: VerificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationType" AS ENUM (
    'DOCUMENT_COMPLETENESS',
    'TAX_COMPLIANCE',
    'BBBEE_VERIFICATION',
    'COMPANY_REGISTRATION',
    'BANK_DETAILS',
    'REFERENCE_CHECK',
    'CREDIT_CHECK',
    'LEGAL_COMPLIANCE'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW???OLD (added paths) and OLD???NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW???OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD???NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: ai_analysis_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_analysis_jobs (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    status public."AIAnalysisStatus" DEFAULT 'PENDING'::public."AIAnalysisStatus" NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "currentStep" text,
    results jsonb,
    logs text[],
    summary jsonb,
    "errorMessage" text,
    "failedAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "initiatedById" text,
    "aiMode" text,
    "totalDocuments" integer DEFAULT 0 NOT NULL,
    "processedDocuments" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    "userName" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    changes jsonb,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contract_amendments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_amendments (
    id text NOT NULL,
    "contractId" text NOT NULL,
    "amendmentNumber" integer NOT NULL,
    description text NOT NULL,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "changesSummary" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contract_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_approvals (
    id text NOT NULL,
    "contractId" text NOT NULL,
    "approverId" text NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    comments text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "respondedAt" timestamp(3) without time zone
);


--
-- Name: contract_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_documents (
    id text NOT NULL,
    "contractId" text NOT NULL,
    "documentName" text NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id text NOT NULL,
    "contractNumber" text NOT NULL,
    "supplierId" text NOT NULL,
    "contractName" text NOT NULL,
    "contractType" public."ContractType" NOT NULL,
    description text,
    "totalValue" double precision NOT NULL,
    currency text DEFAULT 'ZAR'::text NOT NULL,
    "paymentTerms" text,
    "deliveryTerms" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "renewalDate" timestamp(3) without time zone,
    "autoRenewal" boolean DEFAULT false NOT NULL,
    "renewalNoticeDays" integer DEFAULT 30 NOT NULL,
    status public."ContractStatus" DEFAULT 'DRAFT'::public."ContractStatus" NOT NULL,
    "daysUntilExpiry" integer,
    "isExpiringSoon" boolean DEFAULT false NOT NULL,
    "renewalReminderSent" boolean DEFAULT false NOT NULL,
    "renewalReminderSentAt" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliveries (
    id text NOT NULL,
    "deliveryNumber" text NOT NULL,
    "purchaseOrderId" text NOT NULL,
    "supplierId" text NOT NULL,
    "expectedDeliveryDate" timestamp(3) without time zone NOT NULL,
    "actualDeliveryDate" timestamp(3) without time zone,
    "deliveryStatus" public."DeliveryStatus" DEFAULT 'SCHEDULED'::public."DeliveryStatus" NOT NULL,
    "orderPlacedDate" timestamp(3) without time zone NOT NULL,
    "leadTimeDays" integer,
    "expectedLeadTimeDays" integer NOT NULL,
    "onTime" boolean,
    "delayDays" integer,
    "deliveryAddress" text,
    "deliveryContact" text,
    "deliveryNotes" text,
    "issuesReported" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: document_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_verifications (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    version integer NOT NULL,
    category text NOT NULL,
    "fileName" text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    "verificationNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_logs (
    id text NOT NULL,
    "sentById" text,
    "recipientEmail" text NOT NULL,
    "recipientName" text,
    subject text NOT NULL,
    content text NOT NULL,
    "emailType" public."EmailType" NOT NULL,
    "referenceType" text,
    "referenceId" text,
    status public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "messageId" text,
    "errorMessage" text,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "openedAt" timestamp(3) without time zone,
    "clickedAt" timestamp(3) without time zone,
    "bouncedAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: email_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_reminders (
    id text NOT NULL,
    "onboardingId" text,
    "recipientEmail" text NOT NULL,
    "reminderType" public."ReminderType" NOT NULL,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    "sentAt" timestamp(3) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    "lastAttemptAt" timestamp(3) without time zone,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "purchaseOrderId" text,
    "supplierId" text NOT NULL,
    "invoiceDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'ZAR'::text NOT NULL,
    "taxAmount" double precision,
    "totalAmount" double precision NOT NULL,
    status public."InvoiceStatus" DEFAULT 'PENDING'::public."InvoiceStatus" NOT NULL,
    "paidDate" timestamp(3) without time zone,
    "paidAmount" double precision,
    "paymentReference" text,
    "documentPath" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: manager_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_approvals (
    id text NOT NULL,
    "initiationId" text NOT NULL,
    "approverId" text NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    comments text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "referenceType" text,
    "referenceId" text,
    "actionUrl" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: onboarding_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_timeline (
    id text NOT NULL,
    "onboardingId" text NOT NULL,
    step public."OnboardingStep" NOT NULL,
    status public."OnboardingStatus" NOT NULL,
    action text NOT NULL,
    description text,
    "performedBy" text,
    metadata jsonb,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: po_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_line_items (
    id text NOT NULL,
    "purchaseOrderId" text NOT NULL,
    "lineNumber" integer NOT NULL,
    "itemDescription" text NOT NULL,
    "itemCode" text,
    quantity double precision NOT NULL,
    "unitOfMeasure" text NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    "deliveredQuantity" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: procurement_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procurement_approvals (
    id text NOT NULL,
    "initiationId" text NOT NULL,
    "approverId" text NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    comments text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id text NOT NULL,
    "poNumber" text NOT NULL,
    "requisitionId" text,
    "supplierId" text NOT NULL,
    title text NOT NULL,
    description text,
    "totalAmount" double precision NOT NULL,
    currency text DEFAULT 'ZAR'::text NOT NULL,
    "paymentTerms" text,
    "deliveryTerms" text,
    status public."POStatus" DEFAULT 'DRAFT'::public."POStatus" NOT NULL,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expectedDeliveryDate" timestamp(3) without time zone,
    "actualDeliveryDate" timestamp(3) without time zone,
    "supplierAcknowledged" boolean DEFAULT false NOT NULL,
    "supplierAcknowledgedAt" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: reminder_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminder_configurations (
    id text NOT NULL,
    "reminderType" public."ReminderConfigType" NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "emailSubjectTemplate" text,
    "emailBodyTemplate" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "finalReminderAfterHours" integer DEFAULT 14 NOT NULL,
    "firstReminderAfterHours" integer DEFAULT 3 NOT NULL,
    "secondReminderAfterHours" integer DEFAULT 7 NOT NULL
);


--
-- Name: reminder_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminder_logs (
    id text NOT NULL,
    "reminderType" public."ReminderConfigType" NOT NULL,
    "referenceId" text NOT NULL,
    "referenceType" text NOT NULL,
    "recipientEmail" text NOT NULL,
    "recipientName" text,
    "reminderCount" integer DEFAULT 1 NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    status public."ReminderStatus" DEFAULT 'PENDING'::public."ReminderStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "errorMessage" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: requisition_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisition_approvals (
    id text NOT NULL,
    "requisitionId" text NOT NULL,
    "approvalLevel" integer NOT NULL,
    "approverId" text NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    decision text,
    comments text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "respondedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: requisition_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisition_attachments (
    id text NOT NULL,
    "requisitionId" text NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: requisition_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisition_comments (
    id text NOT NULL,
    "requisitionId" text NOT NULL,
    "userId" text NOT NULL,
    comment text NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: requisition_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisition_line_items (
    id text NOT NULL,
    "requisitionId" text NOT NULL,
    "lineNumber" integer NOT NULL,
    "itemDescription" text NOT NULL,
    "itemCode" text,
    quantity double precision NOT NULL,
    "unitOfMeasure" text NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    "suggestedSupplier" text,
    specifications text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: requisitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requisitions (
    id text NOT NULL,
    "requisitionNumber" text NOT NULL,
    "requestedById" text NOT NULL,
    department text NOT NULL,
    priority public."RequisitionPriority" DEFAULT 'MEDIUM'::public."RequisitionPriority" NOT NULL,
    title text NOT NULL,
    description text,
    justification text,
    "budgetCode" text,
    "estimatedTotalAmount" double precision NOT NULL,
    currency text DEFAULT 'ZAR'::text NOT NULL,
    status public."RequisitionStatus" DEFAULT 'DRAFT'::public."RequisitionStatus" NOT NULL,
    "currentApprovalLevel" integer DEFAULT 0 NOT NULL,
    "requiredByDate" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "processStartedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processEndedAt" timestamp(3) without time zone,
    "totalProcessingTimeHours" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: session_resumptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_resumptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "moduleType" public."ModuleType" NOT NULL,
    "processId" text NOT NULL,
    "processStep" text NOT NULL,
    "processData" jsonb,
    "lastAccessedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: supplier_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_documents (
    id text NOT NULL,
    "onboardingId" text,
    "documentType" text NOT NULL,
    "documentName" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "filePath" text NOT NULL,
    "mimeType" text NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    "verificationNotes" text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: supplier_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_evaluations (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "evaluationPeriod" text NOT NULL,
    "evaluationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "qualityScore" double precision NOT NULL,
    "deliveryScore" double precision NOT NULL,
    "priceScore" double precision NOT NULL,
    "serviceScore" double precision NOT NULL,
    "complianceScore" double precision NOT NULL,
    "overallScore" double precision NOT NULL,
    "onTimeDeliveryRate" double precision,
    "defectRate" double precision,
    "responseTime" double precision,
    "performanceRating" public."PerformanceRating" NOT NULL,
    strengths text,
    "areasForImprovement" text,
    recommendations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: supplier_initiations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_initiations (
    id text NOT NULL,
    "businessUnit" public."BusinessUnit" NOT NULL,
    "processReadUnderstood" boolean DEFAULT false NOT NULL,
    "dueDiligenceCompleted" boolean DEFAULT false NOT NULL,
    "supplierName" text NOT NULL,
    "productServiceCategory" text NOT NULL,
    "requesterName" text NOT NULL,
    "relationshipDeclaration" text NOT NULL,
    "regularPurchase" boolean DEFAULT false NOT NULL,
    "annualPurchaseValue" double precision,
    "creditApplication" boolean DEFAULT false NOT NULL,
    "creditApplicationReason" text,
    "onceOffPurchase" boolean DEFAULT false NOT NULL,
    "onboardingReason" text NOT NULL,
    status public."InitiationStatus" DEFAULT 'SUBMITTED'::public."InitiationStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone,
    "initiatedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "supplierEmail" text DEFAULT ''::text NOT NULL,
    "supplierContactPerson" text DEFAULT ''::text NOT NULL
);


--
-- Name: supplier_onboardings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_onboardings (
    id text NOT NULL,
    "supplierId" text,
    "currentStep" public."OnboardingStep" DEFAULT 'INITIATE'::public."OnboardingStep" NOT NULL,
    "overallStatus" public."OnboardingStatus" DEFAULT 'INITIATED'::public."OnboardingStatus" NOT NULL,
    "contactName" text NOT NULL,
    "contactEmail" text NOT NULL,
    "businessType" public."BusinessType" NOT NULL,
    sector text NOT NULL,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone,
    "emailSubject" text,
    "emailContent" text,
    "emailMessageId" text,
    "supplierFormSubmitted" boolean DEFAULT false NOT NULL,
    "supplierFormSubmittedAt" timestamp(3) without time zone,
    "supplierResponseData" jsonb,
    "documentsUploaded" boolean DEFAULT false NOT NULL,
    "documentsUploadedAt" timestamp(3) without time zone,
    "requiredDocuments" text[],
    "reviewStartedAt" timestamp(3) without time zone,
    "reviewCompletedAt" timestamp(3) without time zone,
    "reviewNotes" text,
    "reviewedById" text,
    "revisionCount" integer DEFAULT 0 NOT NULL,
    "revisionRequested" boolean DEFAULT false NOT NULL,
    "revisionNotes" text,
    "revisionRequestedAt" timestamp(3) without time zone,
    "approvalStatus" public."ApprovalStatus",
    "approvedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "completedAt" timestamp(3) without time zone,
    "processStartedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processEndedAt" timestamp(3) without time zone,
    "totalProcessingTimeHours" double precision,
    "initiatedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "onboardingToken" text,
    "initiationId" text
);


--
-- Name: supplier_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_reviews (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "reviewedById" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    "supplierCode" text NOT NULL,
    "companyName" text NOT NULL,
    "contactPerson" text NOT NULL,
    "contactEmail" text NOT NULL,
    "contactPhone" text,
    "businessType" public."BusinessType" DEFAULT 'OTHER'::public."BusinessType" NOT NULL,
    sector text DEFAULT 'Other'::text NOT NULL,
    "registrationNumber" text,
    "vatNumber" text,
    "taxClearance" text,
    "bbbeeLevel" text,
    "physicalAddress" text,
    city text,
    province text,
    "postalCode" text,
    country text DEFAULT 'South Africa'::text NOT NULL,
    status public."SupplierStatus" DEFAULT 'PENDING'::public."SupplierStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accountNumber" text,
    "airtableData" jsonb,
    "airtableRecordId" text,
    "associatedCompany" text,
    "associatedCompanyBranchName" text,
    "associatedCompanyRegNo" text,
    "authorizationAgreement" boolean,
    "bankAccountName" text,
    "bankName" text,
    "branchName" text,
    "branchNumber" text,
    "branchesContactNumbers" text,
    field39 text,
    "natureOfBusiness" text,
    "numberOfEmployees" integer,
    "postalAddress" text,
    "productsAndServices" text,
    "qualityManagementCert" boolean,
    "rpBBBEE" text,
    "rpBBBEEEmail" text,
    "rpBBBEEPhone" text,
    "rpBanking" text,
    "rpBankingEmail" text,
    "rpBankingPhone" text,
    "rpQuality" text,
    "rpQualityEmail" text,
    "rpQualityPhone" text,
    "rpSHE" text,
    "rpSHEEmail" text,
    "rpSHEPhone" text,
    "sheCertification" boolean,
    "supplierName" text,
    "tradingName" text,
    "typeOfAccount" text
);


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_config (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    category text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_delegations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_delegations (
    id text NOT NULL,
    "delegatorId" text NOT NULL,
    "delegateId" text NOT NULL,
    "delegationType" public."DelegationType" DEFAULT 'ALL_APPROVALS'::public."DelegationType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    reason text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    department text,
    "phoneNumber" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "managerId" text
);


--
-- Name: verification_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_checks (
    id text NOT NULL,
    "onboardingId" text NOT NULL,
    "checkType" public."VerificationType" NOT NULL,
    "checkName" text NOT NULL,
    status public."CheckStatus" DEFAULT 'PENDING'::public."CheckStatus" NOT NULL,
    result text,
    "verifiedBy" text,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	c1ddc60d-4905-46f6-8c2c-20aeca955fe1	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"avashna002@gmail.com","user_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","user_phone":""}}	2025-10-01 12:41:29.20853+02	
00000000-0000-0000-0000-000000000000	fb17d902-35e5-4aa4-b24c-e4f10f9ec931	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-01 12:42:18.69877+02	
00000000-0000-0000-0000-000000000000	e4737283-b47e-4585-b02c-9b0f8dd8f3de	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-01 13:35:51.011197+02	
00000000-0000-0000-0000-000000000000	a2f1a0ce-e926-4d70-b12e-547b324530fc	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-01 13:39:50.003466+02	
00000000-0000-0000-0000-000000000000	6240d47b-b653-44fd-b8c2-9fa977ec8f55	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-01 13:43:19.052102+02	
00000000-0000-0000-0000-000000000000	10762e9d-e223-48b4-8f02-8e00dfb12f68	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-01 13:44:58.68867+02	
00000000-0000-0000-0000-000000000000	e434dc33-a948-4096-93e1-fd98d464a86a	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-01 13:58:03.790502+02	
00000000-0000-0000-0000-000000000000	5b18286e-5ea1-4b26-930d-82247bb99eab	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 14:58:22.097708+02	
00000000-0000-0000-0000-000000000000	3fcf44d2-356f-4b3b-9208-ff1ef04f8ac0	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 14:58:22.12512+02	
00000000-0000-0000-0000-000000000000	2e1c9f07-302e-49d7-a11f-3653fca3ad03	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 08:55:33.75078+02	
00000000-0000-0000-0000-000000000000	f34d423d-1986-41af-b518-59f2b56da010	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 08:55:33.776362+02	
00000000-0000-0000-0000-000000000000	c6d5b692-3b37-4b9c-893f-bc100aa78a35	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 09:54:21.366259+02	
00000000-0000-0000-0000-000000000000	5e168d0f-bdd7-4c0e-a250-55020c996518	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 09:54:21.382529+02	
00000000-0000-0000-0000-000000000000	34c9f171-afb0-41aa-b073-077f35ef7bda	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 10:54:58.486491+02	
00000000-0000-0000-0000-000000000000	6a4b8099-a3a1-4150-a865-e73981ccf4db	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 10:54:58.499382+02	
00000000-0000-0000-0000-000000000000	8b787411-c949-41af-9b16-a25ca10d00f8	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 10:55:13.020804+02	
00000000-0000-0000-0000-000000000000	6637c3b3-6bd0-49db-a756-4649799e319f	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 11:15:50.800317+02	
00000000-0000-0000-0000-000000000000	e7b118ae-d0bc-4c63-906e-86edd9f8c574	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 12:16:52.61919+02	
00000000-0000-0000-0000-000000000000	8deda811-086e-4b54-94bd-0d95998975d3	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 12:16:52.646431+02	
00000000-0000-0000-0000-000000000000	8781cde4-89cd-4755-9f8a-4147c9a9beb4	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 12:16:52.697998+02	
00000000-0000-0000-0000-000000000000	fbfafbec-309a-4598-a72f-a7ba82fe497c	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 12:17:23.077129+02	
00000000-0000-0000-0000-000000000000	346b08e2-b5af-4fdd-9954-14f1825d61a5	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 13:16:27.263691+02	
00000000-0000-0000-0000-000000000000	f519f912-c45b-4c9c-b66d-c70646124ef3	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 13:16:27.282102+02	
00000000-0000-0000-0000-000000000000	a4677d18-82e5-4460-ac19-277891478f13	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 13:16:27.339924+02	
00000000-0000-0000-0000-000000000000	f88d927c-8995-4ed9-a183-04ce864cc795	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 14:04:42.917665+02	
00000000-0000-0000-0000-000000000000	a4ea54ee-abae-42a1-94ee-dd1c5cf39213	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:40.681067+02	
00000000-0000-0000-0000-000000000000	b145b505-63a4-45d1-b2a7-5419d52cdf6b	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:40.695185+02	
00000000-0000-0000-0000-000000000000	02b37117-32b3-4362-a3e1-f8962f79a5df	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:41.667746+02	
00000000-0000-0000-0000-000000000000	b61e215e-4957-4579-93d7-d8be78d4d07e	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:41.688444+02	
00000000-0000-0000-0000-000000000000	43e74450-abc5-4f00-b056-312ed60836d1	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:41.696141+02	
00000000-0000-0000-0000-000000000000	105619a0-e1cd-480b-8a4e-15e319499b61	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:41.721746+02	
00000000-0000-0000-0000-000000000000	980ceddf-ff58-40cc-ac1f-b784ffcdf5c2	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 15:04:42.876879+02	
00000000-0000-0000-0000-000000000000	ee1e8e0f-3df5-44ae-80da-3bd94d2d55da	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 15:06:48.180057+02	
00000000-0000-0000-0000-000000000000	495c4c46-f706-4020-9e41-9bdad010bc39	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 15:16:46.062642+02	
00000000-0000-0000-0000-000000000000	a4f4a813-8959-4501-852d-31bfc3e499ad	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 19:01:12.189803+02	
00000000-0000-0000-0000-000000000000	ec6e9170-1050-413c-85f3-8123940f64a4	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-02 19:01:12.20012+02	
00000000-0000-0000-0000-000000000000	2259fce7-0fdf-4537-aba3-7bdbd5627261	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-02 19:02:02.000133+02	
00000000-0000-0000-0000-000000000000	1400859c-6701-4318-a803-01dfb3a0e7a8	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 09:24:27.262454+02	
00000000-0000-0000-0000-000000000000	ea5d8774-f15a-4815-8d92-3fd4b4913dc0	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 09:24:27.290108+02	
00000000-0000-0000-0000-000000000000	43f9118f-ea45-4efa-a606-c198daf896dc	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 09:24:28.226217+02	
00000000-0000-0000-0000-000000000000	2f2ca6ef-6b93-4d5e-a368-c23109ebc01e	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 12:12:28.607718+02	
00000000-0000-0000-0000-000000000000	1d58df15-e672-4d4e-98c1-2c0a7ef0ada3	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 12:12:31.014953+02	
00000000-0000-0000-0000-000000000000	4fcfdc87-e89c-4d4d-85dd-a4ec2adb069a	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 12:24:40.910268+02	
00000000-0000-0000-0000-000000000000	a9c902cd-1173-4985-991d-10264854b3df	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 12:30:21.220136+02	
00000000-0000-0000-0000-000000000000	374e84c0-2abd-4bde-b0a5-77e85c50a909	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 12:47:22.217685+02	
00000000-0000-0000-0000-000000000000	9eb72b92-ee27-4415-8245-67472e2ca0d3	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 12:55:07.236776+02	
00000000-0000-0000-0000-000000000000	bb922b18-b509-40fe-9c4e-7c3a134d1876	{"action":"logout","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-03 13:10:02.102581+02	
00000000-0000-0000-0000-000000000000	fdc6fc56-f602-49a8-8131-88a0a5510500	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 13:10:09.092465+02	
00000000-0000-0000-0000-000000000000	cd99c39d-46b3-44f2-bba4-0728c5416b30	{"action":"logout","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-03 13:15:01.158758+02	
00000000-0000-0000-0000-000000000000	03b34358-92cf-4a6d-aa81-c1e6f2f6473e	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 13:15:16.824172+02	
00000000-0000-0000-0000-000000000000	c09e0fc0-1c83-4b43-b566-fb6c53fe7fe2	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 15:27:49.965504+02	
00000000-0000-0000-0000-000000000000	1e3622f4-433a-466e-ba3f-0dfa4bd5b791	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 15:27:49.98596+02	
00000000-0000-0000-0000-000000000000	821e5bb5-08c8-450d-be95-2f8018abc163	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 12:02:16.283269+02	
00000000-0000-0000-0000-000000000000	45e98341-f6c4-4fbf-9bf5-df5c7e0341ff	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 12:02:16.312944+02	
00000000-0000-0000-0000-000000000000	236e40af-6df9-4574-925a-7489a12080eb	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 15:21:14.987707+02	
00000000-0000-0000-0000-000000000000	a3d72e47-9ada-4d94-8314-afb4bf6dbd2c	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 15:21:14.999464+02	
00000000-0000-0000-0000-000000000000	3081be15-f23b-4ccd-8321-6a64c2bd8f51	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 15:21:18.697255+02	
00000000-0000-0000-0000-000000000000	e3ef0316-d2f6-4cac-bc10-d927bf5dc72a	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 16:48:18.611843+02	
00000000-0000-0000-0000-000000000000	e0c69df7-7ff0-469f-9488-4d9cd5f1ec99	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-04 16:48:18.631407+02	
00000000-0000-0000-0000-000000000000	c55b1c1d-bf6c-4c5c-80a2-ac8039526ba4	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-04 16:48:55.10394+02	
00000000-0000-0000-0000-000000000000	700c0b7a-548b-4565-9269-c324b29c93e8	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-06 07:46:06.642263+02	
00000000-0000-0000-0000-000000000000	49a60b65-481e-48d8-b5a0-853d40504a4f	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-06 07:46:06.66948+02	
00000000-0000-0000-0000-000000000000	7a941d0e-353e-4920-bce2-462f7412c946	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-06 07:46:27.752972+02	
00000000-0000-0000-0000-000000000000	f9ad2292-b334-444a-acb9-b335048d1782	{"action":"logout","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-06 07:48:06.614803+02	
00000000-0000-0000-0000-000000000000	9acea3aa-8682-43cb-8fe4-2b0390bfaeee	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-06 07:48:12.598995+02	
00000000-0000-0000-0000-000000000000	1bf3aa28-8c57-407c-84b6-2a810cce93cb	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-06 08:47:02.533833+02	
00000000-0000-0000-0000-000000000000	b4f2c265-97c8-4aad-b599-31d366b429d7	{"action":"token_revoked","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-06 08:47:02.546764+02	
00000000-0000-0000-0000-000000000000	21a4fb63-e319-43c6-871b-f806d5e4b6c1	{"action":"token_refreshed","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-06 08:47:02.658731+02	
00000000-0000-0000-0000-000000000000	d6f51f3d-9b43-46e1-b0ed-9ac7aea18f5d	{"action":"login","actor_id":"59e69fc6-39e1-43b6-9478-b7e01b45c429","actor_username":"avashna002@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-06 09:14:30.999477+02	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
59e69fc6-39e1-43b6-9478-b7e01b45c429	59e69fc6-39e1-43b6-9478-b7e01b45c429	{"sub": "59e69fc6-39e1-43b6-9478-b7e01b45c429", "email": "avashna002@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-10-01 12:41:29.194744+02	2025-10-01 12:41:29.197358+02	2025-10-01 12:41:29.197358+02	fdcade61-f750-4797-bbb7-a143e303d3e9
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
bbf9e0fb-26b7-4a7e-95a7-d894960abc3d	2025-10-06 07:48:12.605782+02	2025-10-06 07:48:12.605782+02	password	768654d5-71cc-4213-8bac-3e38ea16635f
282fad29-d504-495c-a4aa-68a62ad59ff7	2025-10-06 09:14:31.049385+02	2025-10-06 09:14:31.049385+02	password	9402c2b2-7b33-4161-8e84-fea2729e2318
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	36	5fwyiyhmacig	59e69fc6-39e1-43b6-9478-b7e01b45c429	t	2025-10-06 07:48:12.603274+02	2025-10-06 08:47:02.547441+02	\N	bbf9e0fb-26b7-4a7e-95a7-d894960abc3d
00000000-0000-0000-0000-000000000000	37	gh56543e3bgi	59e69fc6-39e1-43b6-9478-b7e01b45c429	f	2025-10-06 08:47:02.553914+02	2025-10-06 08:47:02.553914+02	5fwyiyhmacig	bbf9e0fb-26b7-4a7e-95a7-d894960abc3d
00000000-0000-0000-0000-000000000000	38	jc7apfuiqmmo	59e69fc6-39e1-43b6-9478-b7e01b45c429	f	2025-10-06 09:14:31.03042+02	2025-10-06 09:14:31.03042+02	\N	282fad29-d504-495c-a4aa-68a62ad59ff7
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
bbf9e0fb-26b7-4a7e-95a7-d894960abc3d	59e69fc6-39e1-43b6-9478-b7e01b45c429	2025-10-06 07:48:12.601822+02	2025-10-06 08:47:02.66056+02	\N	aal1	\N	2025-10-06 06:47:02.660483	Next.js Middleware	105.214.87.74	\N
282fad29-d504-495c-a4aa-68a62ad59ff7	59e69fc6-39e1-43b6-9478-b7e01b45c429	2025-10-06 09:14:31.022087+02	2025-10-06 09:14:31.022087+02	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	105.214.87.74	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	59e69fc6-39e1-43b6-9478-b7e01b45c429	authenticated	authenticated	avashna002@gmail.com	$2a$10$qIWuq0VzxQawW/ODo9I0QuATT8ped2YMdwJ/PEJs6TsGPrZrSqq.K	2025-10-01 12:41:29.219109+02	\N		\N		\N			\N	2025-10-06 09:14:31.02076+02	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-10-01 12:41:29.162124+02	2025-10-06 09:14:31.048581+02	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ca2f4343-317d-4ee9-91f7-1d062ba13cb5	e8cd905c83ccce9da92defa6d94308e8e6d707bc73c74de9da3eb24378bcc8f7	2025-10-01 12:21:56.385359+02	20251001102152_procurement	\N	\N	2025-10-01 12:21:54.432108+02	1
dc6dbaa4-94b6-4888-9202-074ba75c216a	e8feedb3e59905a247e94c098d9085a939b80233ca74c131e845662a7d9d5a47	2025-10-01 15:06:20.969989+02	20251001130617_add_airtable_fields	\N	\N	2025-10-01 15:06:19.420722+02	1
\.


--
-- Data for Name: ai_analysis_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_analysis_jobs (id, "supplierId", status, progress, "currentStep", results, logs, summary, "errorMessage", "failedAt", "startedAt", "completedAt", "initiatedById", "aiMode", "totalDocuments", "processedDocuments", "createdAt", "updatedAt") FROM stdin;
cmhsxzrx80001bpmonxelzsqr	cmhswgjtp0007bp5w61x9ivg3	COMPLETED	100	Processing bbbeeAccreditation documents	{"overallScore": 75, "riskAssessment": {}, "complianceCheck": {}, "documentAnalysis": {"nda": [{"status": "basic_check", "fileName": "1762765042547-standard-nda.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "taxClearance": [{"status": "basic_check", "fileName": "1762765042544-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1762765042541-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:30:59 AM] ???? Checking AI backend status...","[11:30:59 AM] ??????  Could not check worker status, proceeding with analysis...","[11:30:59 AM] ???? Found 2 version(s) of documents","[11:30:59 AM] ???? Analyzing latest version (v4)...","[11:30:59 AM] ???? Total documents to process: 3","[11:30:59 AM] \n???? Processing category: nda","[11:30:59 AM]   ??? Analyzing: 1762765042547-standard-nda.pdf...","[11:30:59 AM]   ???? Fetching document from storage...","[11:31:00 AM]   ???? Running AI analysis...","[11:31:00 AM]   ??????  AI processing unavailable, using basic analysis...","[11:31:00 AM]   ??? Basic check completed: 1762765042547-standard-nda.pdf (1/3)","[11:31:00 AM] \n???? Processing category: tax Clearance","[11:31:00 AM]   ??? Analyzing: 1762765042544-Good_Standing_Tax.pdf...","[11:31:00 AM]   ???? Fetching document from storage...","[11:31:00 AM]   ???? Running AI analysis...","[11:31:00 AM]   ??????  AI processing unavailable, using basic analysis...","[11:31:00 AM]   ??? Basic check completed: 1762765042544-Good_Standing_Tax.pdf (2/3)","[11:31:00 AM] \n???? Processing category: bbbee Accreditation","[11:31:00 AM]   ??? Analyzing: 1762765042541-BEE_Certificate.pdf...","[11:31:00 AM]   ???? Fetching document from storage...","[11:31:00 AM]   ???? Running AI analysis...","[11:31:00 AM]   ??????  AI processing unavailable, using basic analysis...","[11:31:00 AM]   ??? Basic check completed: 1762765042541-BEE_Certificate.pdf (3/3)","\n??? Analysis completed successfully! Overall score: 75%"}	{"aiMode": "unknown", "overallScore": 75, "totalDocuments": 3, "processedDocuments": 3}	\N	\N	2025-11-10 09:30:59.245	2025-11-10 09:31:00.476	\N	\N	3	3	2025-11-10 09:30:59.224	2025-11-10 09:31:00.478
cmhsy26qz0003bpmosydf7ba7	cmhswgjtp0007bp5w61x9ivg3	COMPLETED	100	Processing bbbeeAccreditation documents	{"overallScore": 75, "riskAssessment": {}, "complianceCheck": {}, "documentAnalysis": {"nda": [{"status": "basic_check", "fileName": "1762765042547-standard-nda.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "taxClearance": [{"status": "basic_check", "fileName": "1762765042544-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1762765042541-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:32:51 AM] ???? Checking AI backend status...","[11:32:52 AM] ??????  Could not check worker status, proceeding with analysis...","[11:32:52 AM] ???? Found 2 version(s) of documents","[11:32:52 AM] ???? Analyzing latest version (v4)...","[11:32:52 AM] ???? Total documents to process: 3","[11:32:52 AM] \n???? Processing category: nda","[11:32:52 AM]   ??? Analyzing: 1762765042547-standard-nda.pdf...","[11:32:52 AM]   ???? Fetching document from storage...","[11:32:52 AM]   ???? Running AI analysis...","[11:32:52 AM]   ??????  AI processing unavailable, using basic analysis...","[11:32:52 AM]   ??? Basic check completed: 1762765042547-standard-nda.pdf (1/3)","[11:32:52 AM] \n???? Processing category: tax Clearance","[11:32:52 AM]   ??? Analyzing: 1762765042544-Good_Standing_Tax.pdf...","[11:32:52 AM]   ???? Fetching document from storage...","[11:32:52 AM]   ???? Running AI analysis...","[11:32:52 AM]   ??????  AI processing unavailable, using basic analysis...","[11:32:52 AM]   ??? Basic check completed: 1762765042544-Good_Standing_Tax.pdf (2/3)","[11:32:52 AM] \n???? Processing category: bbbee Accreditation","[11:32:52 AM]   ??? Analyzing: 1762765042541-BEE_Certificate.pdf...","[11:32:52 AM]   ???? Fetching document from storage...","[11:32:52 AM]   ???? Running AI analysis...","[11:32:52 AM]   ??????  AI processing unavailable, using basic analysis...","[11:32:52 AM]   ??? Basic check completed: 1762765042541-BEE_Certificate.pdf (3/3)","\n??? Analysis completed successfully! Overall score: 75%"}	{"aiMode": "unknown", "overallScore": 75, "totalDocuments": 3, "processedDocuments": 3}	\N	\N	2025-11-10 09:32:51.761	2025-11-10 09:32:52.682	\N	\N	3	3	2025-11-10 09:32:51.755	2025-11-10 09:32:52.686
cmhsy2gb00005bpmoezx76v0k	cmhswgjtp0007bp5w61x9ivg3	COMPLETED	100	Processing bbbeeAccreditation documents	{"overallScore": 75, "riskAssessment": {}, "complianceCheck": {}, "documentAnalysis": {"nda": [{"status": "basic_check", "fileName": "1762765042547-standard-nda.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "taxClearance": [{"status": "basic_check", "fileName": "1762765042544-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1762765042541-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:33:04 AM] ???? Checking AI backend status...","[11:33:04 AM] ??????  Could not check worker status, proceeding with analysis...","[11:33:04 AM] ???? Found 2 version(s) of documents","[11:33:04 AM] ???? Analyzing latest version (v4)...","[11:33:04 AM] ???? Total documents to process: 3","[11:33:04 AM] \n???? Processing category: nda","[11:33:04 AM]   ??? Analyzing: 1762765042547-standard-nda.pdf...","[11:33:04 AM]   ???? Fetching document from storage...","[11:33:04 AM]   ???? Running AI analysis...","[11:33:04 AM]   ??????  AI processing unavailable, using basic analysis...","[11:33:04 AM]   ??? Basic check completed: 1762765042547-standard-nda.pdf (1/3)","[11:33:04 AM] \n???? Processing category: tax Clearance","[11:33:04 AM]   ??? Analyzing: 1762765042544-Good_Standing_Tax.pdf...","[11:33:04 AM]   ???? Fetching document from storage...","[11:33:04 AM]   ???? Running AI analysis...","[11:33:04 AM]   ??????  AI processing unavailable, using basic analysis...","[11:33:04 AM]   ??? Basic check completed: 1762765042544-Good_Standing_Tax.pdf (2/3)","[11:33:04 AM] \n???? Processing category: bbbee Accreditation","[11:33:04 AM]   ??? Analyzing: 1762765042541-BEE_Certificate.pdf...","[11:33:04 AM]   ???? Fetching document from storage...","[11:33:04 AM]   ???? Running AI analysis...","[11:33:04 AM]   ??????  AI processing unavailable, using basic analysis...","[11:33:04 AM]   ??? Basic check completed: 1762765042541-BEE_Certificate.pdf (3/3)","\n??? Analysis completed successfully! Overall score: 75%"}	{"aiMode": "unknown", "overallScore": 75, "totalDocuments": 3, "processedDocuments": 3}	\N	\N	2025-11-10 09:33:04.143	2025-11-10 09:33:04.929	\N	\N	3	3	2025-11-10 09:33:04.14	2025-11-10 09:33:04.931
cmhsym1hb0009bpmoa80207pq	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:48:18 AM] ???? Checking AI backend status...","[11:48:18 AM] ??????  Could not check worker status, proceeding with analysis...","[11:48:18 AM] ???? Found 2 version(s) of documents","[11:48:18 AM] ???? Analyzing latest version (v2)...","[11:48:18 AM] ???? Total documents to process: 2","[11:48:18 AM] \n???? Processing category: good Standing","[11:48:18 AM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[11:48:18 AM]   ???? Fetching document from storage...","[11:48:18 AM]   ???? Running AI analysis...","[11:48:18 AM]   ??????  AI processing unavailable, using basic analysis...","[11:48:18 AM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[11:48:18 AM] \n???? Processing category: bbbee Accreditation","[11:48:18 AM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[11:48:18 AM]   ???? Fetching document from storage...","[11:48:18 AM]   ???? Running AI analysis...","[11:48:18 AM]   ??????  AI processing unavailable, using basic analysis...","[11:48:18 AM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[11:48:18 AM] \n???? Performing compliance verification...","[11:48:18 AM] ???? Mandatory documents: 5 required","[11:48:18 AM] ??? Tax requirement satisfied with: Letter of Good Standing","[11:48:18 AM] ???? Optional documents provided: 1/12","[11:48:18 AM] ??? All required documents provided","[11:48:18 AM] ???? Average document quality: 0.0%","[11:48:18 AM] \n??? Calculating risk assessment...","[11:48:18 AM] ???? Document Completeness Risk: LOW","[11:48:18 AM] ???? Document Quality Risk: HIGH","[11:48:18 AM] \n???? Base Score: 92.0/100","[11:48:18 AM] ???? Risk Penalty: -10.0 points","[11:48:18 AM] ???? Overall Supplier Score: 82.0/100","[11:48:18 AM] ??? Analysis complete!","[11:48:18 AM] \n???? Key Insights:","[11:48:18 AM]    ??? Supplier demonstrates strong compliance and documentation quality","[11:48:18 AM]    ??? All critical requirements met","[11:48:18 AM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[11:48:18 AM]    ??? Recommended for approval after NDA verification","[11:48:18 AM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 09:48:18.063	2025-11-10 09:48:18.788	\N	\N	2	2	2025-11-10 09:48:18.046	2025-11-10 09:48:18.789
cmhsy30qw0007bpmogb3jop6m	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"overallScore": 75, "riskAssessment": {}, "complianceCheck": {}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:33:30 AM] ???? Checking AI backend status...","[11:33:30 AM] ??????  Could not check worker status, proceeding with analysis...","[11:33:30 AM] ???? Found 2 version(s) of documents","[11:33:30 AM] ???? Analyzing latest version (v2)...","[11:33:30 AM] ???? Total documents to process: 2","[11:33:30 AM] \n???? Processing category: good Standing","[11:33:30 AM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[11:33:30 AM]   ???? Fetching document from storage...","[11:33:31 AM]   ???? Running AI analysis...","[11:33:31 AM]   ??????  AI processing unavailable, using basic analysis...","[11:33:31 AM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[11:33:31 AM] \n???? Processing category: bbbee Accreditation","[11:33:31 AM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[11:33:31 AM]   ???? Fetching document from storage...","[11:33:31 AM]   ???? Running AI analysis...","[11:33:31 AM]   ??????  AI processing unavailable, using basic analysis...","[11:33:31 AM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","\n??? Analysis completed successfully! Overall score: 75%"}	{"aiMode": "unknown", "overallScore": 75, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 09:33:30.635	2025-11-10 09:33:31.296	\N	\N	2	2	2025-11-10 09:33:30.632	2025-11-10 09:33:31.297
cmhtbp3cu000xbpmo6crv8vw8	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 100, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 100, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 98.33199747992373, "totalDocumentsAnalyzed": 2}, "documentAnalysis": {"goodStanding": [{"aiMode": "full", "status": "analyzed", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "AI analysis of document d6c8e24b-ae01-4fda-bc18-613572308c0d: Content appears to be valid.", "riskLevel": "Low risk - document appears legitimate.", "confidence": 98.19963217611868, "extractedData": {}, "complianceStatus": "Document meets basic compliance requirements."}], "bbbeeAccreditation": [{"aiMode": "full", "status": "analyzed", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "AI analysis of document 44460855-a63a-45e4-98e9-dee3b87fb505: Content appears to be valid.", "riskLevel": "Low risk - document appears legitimate.", "confidence": 98.46436278372879, "extractedData": {}, "complianceStatus": "Document meets basic compliance requirements."}]}}	{"???? Starting AI document analysis...","[5:54:35 PM] ???? Checking AI backend status...","[5:54:35 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:54:35 PM] ??? Ollama detected directly - Full AI analysis enabled","[5:54:35 PM]    Models available: llama3.1:latest","[5:54:35 PM] ???? Found 2 version(s) of documents","[5:54:35 PM] ???? Analyzing latest version (v2)...","[5:54:35 PM] ???? Total documents to process: 2","[5:54:35 PM] \n???? Processing category: good Standing","[5:54:35 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:54:35 PM]   ???? Fetching document from storage...","[5:54:35 PM]   ???? Running AI analysis...","[5:54:44 PM]   ??? ??????  [Fallback] Completed: 1761304989587-Good_Standing_Tax.pdf - Confidence: 98.2% (1/2)","[5:54:44 PM] \n???? Processing category: bbbee Accreditation","[5:54:44 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:54:44 PM]   ???? Fetching document from storage...","[5:54:45 PM]   ???? Running AI analysis...","[5:54:48 PM]   ??? ??????  [Fallback] Completed: 1761304989583-BEE_Certificate.pdf - Confidence: 98.5% (2/2)","[5:54:48 PM] \n???? Performing compliance verification...","[5:54:48 PM] ???? Mandatory documents: 5 required","[5:54:48 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:54:48 PM] ???? Optional documents provided: 1/12","[5:54:48 PM] ??? All required documents provided","[5:54:48 PM] ???? Average document quality: 98.3%","[5:54:48 PM] \n??? Calculating risk assessment...","[5:54:48 PM] ???? Document Completeness Risk: LOW","[5:54:48 PM] ???? Document Quality Risk: LOW","[5:54:48 PM] \n???? Base Score: 100.0/100","[5:54:48 PM] ???? Risk Penalty: -0.0 points","[5:54:48 PM] ???? Overall Supplier Score: 100.0/100","[5:54:48 PM] ??? Analysis complete!","[5:54:48 PM] \n???? Key Insights:","[5:54:48 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:54:48 PM]    ??? All critical requirements met","[5:54:48 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:54:48 PM]    ??? Recommended for approval after NDA verification","[5:54:48 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 100.0%"}	{"aiMode": "ollama", "overallScore": 100, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:54:35.467	2025-11-10 15:54:48.351	\N	ollama	2	2	2025-11-10 15:54:35.455	2025-11-10 15:54:48.357
cmhtbvysg000zbpmopbfgrvyw	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {}}	{"???? Starting AI document analysis...","[5:59:56 PM] ???? Checking AI backend status...","[5:59:56 PM] ??????  Could not connect to worker service: fetch failed","[5:59:56 PM] ??????  Using fallback mode - Limited analysis","[5:59:56 PM] ???? Worker URL: http://localhost:8001","[5:59:56 PM] ???? Found 2 version(s) of documents","[5:59:56 PM] ???? Analyzing latest version (v2)...","[5:59:56 PM] ???? Total documents to process: 2","[5:59:56 PM] \n???? Processing category: good Standing","[5:59:56 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:59:56 PM]   ???? Fetching document from storage...","[5:59:56 PM]   ???? Running AI analysis...","[5:59:56 PM]   ??? Error processing 1761304989587-Good_Standing_Tax.pdf: fetch failed","[5:59:56 PM] \n???? Processing category: bbbee Accreditation","[5:59:56 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:59:56 PM]   ???? Fetching document from storage...","[5:59:56 PM]   ???? Running AI analysis...","[5:59:56 PM]   ??? Error processing 1761304989583-BEE_Certificate.pdf: fetch failed","[5:59:56 PM] \n???? Performing compliance verification...","[5:59:56 PM] ???? Mandatory documents: 5 required","[5:59:56 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:59:56 PM] ???? Optional documents provided: 1/12","[5:59:56 PM] ??? All required documents provided","[5:59:56 PM] ???? Average document quality: 0.0%","[5:59:56 PM] \n??? Calculating risk assessment...","[5:59:56 PM] ???? Document Completeness Risk: LOW","[5:59:56 PM] ???? Document Quality Risk: HIGH","[5:59:56 PM] \n???? Base Score: 92.0/100","[5:59:56 PM] ???? Risk Penalty: -10.0 points","[5:59:56 PM] ???? Overall Supplier Score: 82.0/100","[5:59:56 PM] ??? Analysis complete!","[5:59:56 PM] \n???? Key Insights:","[5:59:56 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:59:56 PM]    ??? All critical requirements met","[5:59:56 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:59:56 PM]    ??? Recommended for approval after NDA verification","[5:59:56 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 0}	\N	\N	2025-11-10 15:59:56.139	2025-11-10 15:59:56.616	\N	\N	2	0	2025-11-10 15:59:56.128	2025-11-10 15:59:56.618
cmhsyzba5000dbpmo9bheekss	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:58:37 AM] ???? Checking AI backend status...","[11:58:37 AM] ??????  Could not connect to worker service: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON","[11:58:37 AM] ??????  Using fallback mode - Limited analysis","[11:58:37 AM] ???? Make sure WORKER_API_URL is set correctly (current: http://localhost:8001)","[11:58:37 AM] ???? Found 2 version(s) of documents","[11:58:37 AM] ???? Analyzing latest version (v2)...","[11:58:37 AM] ???? Total documents to process: 2","[11:58:37 AM] \n???? Processing category: good Standing","[11:58:38 AM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[11:58:38 AM]   ???? Fetching document from storage...","[11:58:38 AM]   ???? Running AI analysis...","[11:58:38 AM]   ??????  AI processing unavailable, using basic analysis...","[11:58:38 AM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[11:58:38 AM] \n???? Processing category: bbbee Accreditation","[11:58:38 AM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[11:58:38 AM]   ???? Fetching document from storage...","[11:58:38 AM]   ???? Running AI analysis...","[11:58:38 AM]   ??????  AI processing unavailable, using basic analysis...","[11:58:38 AM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[11:58:38 AM] \n???? Performing compliance verification...","[11:58:38 AM] ???? Mandatory documents: 5 required","[11:58:38 AM] ??? Tax requirement satisfied with: Letter of Good Standing","[11:58:38 AM] ???? Optional documents provided: 1/12","[11:58:38 AM] ??? All required documents provided","[11:58:38 AM] ???? Average document quality: 0.0%","[11:58:38 AM] \n??? Calculating risk assessment...","[11:58:38 AM] ???? Document Completeness Risk: LOW","[11:58:38 AM] ???? Document Quality Risk: HIGH","[11:58:38 AM] \n???? Base Score: 92.0/100","[11:58:38 AM] ???? Risk Penalty: -10.0 points","[11:58:38 AM] ???? Overall Supplier Score: 82.0/100","[11:58:38 AM] ??? Analysis complete!","[11:58:38 AM] \n???? Key Insights:","[11:58:38 AM]    ??? Supplier demonstrates strong compliance and documentation quality","[11:58:38 AM]    ??? All critical requirements met","[11:58:38 AM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[11:58:38 AM]    ??? Recommended for approval after NDA verification","[11:58:38 AM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 09:58:37.308	2025-11-10 09:58:38.904	\N	\N	2	2	2025-11-10 09:58:37.276	2025-11-10 09:58:38.907
cmhua85js001jbpmoueiqbi6k	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 1.611683585620639, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 20.61168358562064, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 86.11683585620638, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 86.11683585620638, "extractedData": {}, "complianceStatus": "Manual review required"}]}}	{"???? Starting AI document analysis...","[10:01:11 AM] ???? Checking AI backend status...","[10:01:11 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:01:11 AM]    Model: llama3.1","[10:01:11 AM] ???? Found 1 version(s) of documents","[10:01:11 AM] ???? Analyzing latest version (v1)...","[10:01:11 AM] ???? Total documents to process: 1","[10:01:11 AM] \n???? Processing category: company Registration","[10:01:11 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:01:11 AM]   ???? Fetching document from storage...","[10:01:18 AM]   ???? Running AI analysis...","[10:01:18 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 86.1% (1/1)","[10:01:18 AM] \n???? Performing compliance verification...","[10:01:18 AM] ???? Mandatory documents: 5 required","[10:01:18 AM] ???? Optional documents provided: 0/12","[10:01:18 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:01:19 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:01:20 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:01:21 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:01:21 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:01:21 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:01:21 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:01:21 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:01:22 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:01:22 AM] ???? Average document quality: 86.1%","[10:01:22 AM] \n??? Calculating risk assessment...","[10:01:22 AM] ???? Document Completeness Risk: HIGH","[10:01:22 AM]    ??????  2 claimed certification(s) not uploaded","[10:01:22 AM] ???? Document Quality Risk: LOW","[10:01:22 AM] \n???? Base Score: 20.6/100","[10:01:22 AM] ???? Risk Penalty: -15.0 points","[10:01:22 AM] ???? Claimed Missing Penalty: -4.0 points","[10:01:22 AM] ???? Overall Supplier Score: 1.6/100","[10:01:22 AM] ??? Analysis complete!","[10:01:22 AM] \n???? Key Insights:","[10:01:22 AM]    ??? Significant compliance gaps identified","[10:01:22 AM]    ??? Multiple required documents missing or inadequate","[10:01:22 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 1.6%"}	{"aiMode": "ollama", "overallScore": 1.611683585620639, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:01:11.713	2025-11-11 08:01:22.295	\N	ollama	1	1	2025-11-11 08:01:11.704	2025-11-11 08:01:22.311
cmhtbcubd000pbpmoo586bsc5	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:45:03 PM] ???? Checking AI backend status...","[5:45:04 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:45:04 PM] ??? Ollama detected directly - Full AI analysis enabled","[5:45:04 PM]    Models available: llama3.1:latest","[5:45:04 PM] ???? Found 2 version(s) of documents","[5:45:04 PM] ???? Analyzing latest version (v2)...","[5:45:04 PM] ???? Total documents to process: 2","[5:45:04 PM] \n???? Processing category: good Standing","[5:45:04 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:45:04 PM]   ???? Fetching document from storage...","[5:45:05 PM]   ???? Running AI analysis...","[5:45:05 PM]   ??????  AI processing unavailable, using basic analysis...","[5:45:05 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:45:05 PM] \n???? Processing category: bbbee Accreditation","[5:45:05 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:45:05 PM]   ???? Fetching document from storage...","[5:45:05 PM]   ???? Running AI analysis...","[5:45:05 PM]   ??????  AI processing unavailable, using basic analysis...","[5:45:05 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:45:05 PM] \n???? Performing compliance verification...","[5:45:05 PM] ???? Mandatory documents: 5 required","[5:45:05 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:45:05 PM] ???? Optional documents provided: 1/12","[5:45:05 PM] ??? All required documents provided","[5:45:05 PM] ???? Average document quality: 0.0%","[5:45:05 PM] \n??? Calculating risk assessment...","[5:45:05 PM] ???? Document Completeness Risk: LOW","[5:45:05 PM] ???? Document Quality Risk: HIGH","[5:45:05 PM] \n???? Base Score: 92.0/100","[5:45:05 PM] ???? Risk Penalty: -10.0 points","[5:45:05 PM] ???? Overall Supplier Score: 82.0/100","[5:45:05 PM] ??? Analysis complete!","[5:45:05 PM] \n???? Key Insights:","[5:45:05 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:45:05 PM]    ??? All critical requirements met","[5:45:05 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:45:05 PM]    ??? Recommended for approval after NDA verification","[5:45:05 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "ollama", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:45:03.9	2025-11-10 15:45:05.405	\N	ollama	2	2	2025-11-10 15:45:03.86	2025-11-10 15:45:05.409
cmhubcul20007bpkwi15yb69u	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.774969656030709, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.77496965603071, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 97.74969656030709, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 97.74969656030709, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:32:50 AM] ???? Checking AI backend status...","[10:32:50 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:32:50 AM]    Model: llama3.1","[10:32:50 AM] ???? Found 1 version(s) of documents","[10:32:50 AM] ???? Analyzing latest version (v1)...","[10:32:50 AM] ???? Total documents to process: 1","[10:32:50 AM] \n???? Processing category: company Registration","[10:32:50 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:32:50 AM]   ???? Fetching document from storage...","[10:32:50 AM]   ???? Running AI analysis...","[10:32:51 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 97.7% (1/1)","[10:32:51 AM] \n???? Performing compliance verification...","[10:32:51 AM] ???? Mandatory documents: 5 required","[10:32:51 AM] ???? Optional documents provided: 0/12","[10:32:51 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:32:51 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:32:51 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:32:51 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:32:51 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:32:51 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:32:51 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:32:51 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:32:52 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:32:52 AM] ???? Average document quality: 97.7%","[10:32:52 AM] \n??? Calculating risk assessment...","[10:32:52 AM] ???? Document Completeness Risk: HIGH","[10:32:52 AM]    ??????  2 claimed certification(s) not uploaded","[10:32:52 AM] ???? Document Quality Risk: LOW","[10:32:52 AM] \n???? Base Score: 21.8/100","[10:32:52 AM] ???? Risk Penalty: -15.0 points","[10:32:52 AM] ???? Claimed Missing Penalty: -4.0 points","[10:32:52 AM] ???? Overall Supplier Score: 2.8/100","[10:32:52 AM] ??? Analysis complete!","[10:32:52 AM] \n???? Key Insights:","[10:32:52 AM]    ??? Significant compliance gaps identified","[10:32:52 AM]    ??? Multiple required documents missing or inadequate","[10:32:52 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.8%"}	{"aiMode": "ollama", "overallScore": 2.774969656030709, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:32:50.397	2025-11-11 08:32:52.275	\N	ollama	1	1	2025-11-11 08:32:50.39	2025-11-11 08:32:52.278
cmhsyzba5000bbpmofrp0xqez	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[11:58:37 AM] ???? Checking AI backend status...","[11:58:37 AM] ??????  Could not connect to worker service: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON","[11:58:37 AM] ??????  Using fallback mode - Limited analysis","[11:58:37 AM] ???? Make sure WORKER_API_URL is set correctly (current: http://localhost:8001)","[11:58:37 AM] ???? Found 2 version(s) of documents","[11:58:38 AM] ???? Analyzing latest version (v2)...","[11:58:38 AM] ???? Total documents to process: 2","[11:58:38 AM] \n???? Processing category: good Standing","[11:58:38 AM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[11:58:38 AM]   ???? Fetching document from storage...","[11:58:38 AM]   ???? Running AI analysis...","[11:58:38 AM]   ??????  AI processing unavailable, using basic analysis...","[11:58:38 AM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[11:58:38 AM] \n???? Processing category: bbbee Accreditation","[11:58:38 AM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[11:58:38 AM]   ???? Fetching document from storage...","[11:58:38 AM]   ???? Running AI analysis...","[11:58:38 AM]   ??????  AI processing unavailable, using basic analysis...","[11:58:38 AM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[11:58:38 AM] \n???? Performing compliance verification...","[11:58:38 AM] ???? Mandatory documents: 5 required","[11:58:38 AM] ??? Tax requirement satisfied with: Letter of Good Standing","[11:58:38 AM] ???? Optional documents provided: 1/12","[11:58:38 AM] ??? All required documents provided","[11:58:38 AM] ???? Average document quality: 0.0%","[11:58:38 AM] \n??? Calculating risk assessment...","[11:58:38 AM] ???? Document Completeness Risk: LOW","[11:58:38 AM] ???? Document Quality Risk: HIGH","[11:58:38 AM] \n???? Base Score: 92.0/100","[11:58:38 AM] ???? Risk Penalty: -10.0 points","[11:58:38 AM] ???? Overall Supplier Score: 82.0/100","[11:58:38 AM] ??? Analysis complete!","[11:58:38 AM] \n???? Key Insights:","[11:58:38 AM]    ??? Supplier demonstrates strong compliance and documentation quality","[11:58:38 AM]    ??? All critical requirements met","[11:58:38 AM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[11:58:38 AM]    ??? Recommended for approval after NDA verification","[11:58:38 AM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 09:58:37.302	2025-11-10 09:58:38.939	\N	\N	2	2	2025-11-10 09:58:37.275	2025-11-10 09:58:38.94
cmhtbx32w0011bpmogirkc3ha	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 100, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 100, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 95.36932531435534, "totalDocumentsAnalyzed": 2}, "documentAnalysis": {"goodStanding": [{"aiMode": "full", "status": "analyzed", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "AI analysis of document d280adc0-4eff-4989-980d-20cc5f6d1ef0: Content appears to be valid.", "riskLevel": "Low risk - document appears legitimate.", "confidence": 92.56930563809237, "extractedData": {}, "complianceStatus": "Document meets basic compliance requirements."}], "bbbeeAccreditation": [{"aiMode": "full", "status": "analyzed", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "AI analysis of document 92a04619-8e08-4840-aebc-a946d8cff3e9: Content appears to be valid.", "riskLevel": "Low risk - document appears legitimate.", "confidence": 98.16934499061828, "extractedData": {}, "complianceStatus": "Document meets basic compliance requirements."}]}}	{"???? Starting AI document analysis...","[6:00:48 PM] ???? Checking AI backend status...","[6:00:48 PM] ???? Checking Ollama directly at http://localhost:11434...","[6:00:48 PM] ??? Ollama detected directly - Full AI analysis enabled","[6:00:48 PM]    Models available: llama3.1:latest","[6:00:48 PM] ???? Found 2 version(s) of documents","[6:00:48 PM] ???? Analyzing latest version (v2)...","[6:00:48 PM] ???? Total documents to process: 2","[6:00:48 PM] \n???? Processing category: good Standing","[6:00:48 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[6:00:48 PM]   ???? Fetching document from storage...","[6:00:48 PM]   ???? Running AI analysis...","[6:00:53 PM]   ??? ??????  [Fallback] Completed: 1761304989587-Good_Standing_Tax.pdf - Confidence: 92.6% (1/2)","[6:00:53 PM] \n???? Processing category: bbbee Accreditation","[6:00:53 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[6:00:53 PM]   ???? Fetching document from storage...","[6:00:53 PM]   ???? Running AI analysis...","[6:00:57 PM]   ??? ??????  [Fallback] Completed: 1761304989583-BEE_Certificate.pdf - Confidence: 98.2% (2/2)","[6:00:57 PM] \n???? Performing compliance verification...","[6:00:57 PM] ???? Mandatory documents: 5 required","[6:00:57 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[6:00:57 PM] ???? Optional documents provided: 1/12","[6:00:57 PM] ??? All required documents provided","[6:00:57 PM] ???? Average document quality: 95.4%","[6:00:57 PM] \n??? Calculating risk assessment...","[6:00:57 PM] ???? Document Completeness Risk: LOW","[6:00:57 PM] ???? Document Quality Risk: LOW","[6:00:57 PM] \n???? Base Score: 100.0/100","[6:00:57 PM] ???? Risk Penalty: -0.0 points","[6:00:57 PM] ???? Overall Supplier Score: 100.0/100","[6:00:57 PM] ??? Analysis complete!","[6:00:57 PM] \n???? Key Insights:","[6:00:57 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[6:00:57 PM]    ??? All critical requirements met","[6:00:57 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[6:00:57 PM]    ??? Recommended for approval after NDA verification","[6:00:57 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 100.0%"}	{"aiMode": "ollama", "overallScore": 100, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 16:00:48.347	2025-11-10 16:00:57.691	\N	ollama	2	2	2025-11-10 16:00:48.344	2025-11-10 16:00:57.694
cmhuakylc001lbpmogv69t6xm	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.562885391719078, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.56288539171908, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 95.62885391719077, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 95.62885391719077, "extractedData": {}, "complianceStatus": "Manual review required"}]}}	{"???? Starting AI document analysis...","[10:11:09 AM] ???? Checking AI backend status...","[10:11:09 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:11:09 AM]    Model: llama3.1","[10:11:09 AM] ???? Found 1 version(s) of documents","[10:11:09 AM] ???? Analyzing latest version (v1)...","[10:11:09 AM] ???? Total documents to process: 1","[10:11:09 AM] \n???? Processing category: company Registration","[10:11:09 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:11:09 AM]   ???? Fetching document from storage...","[10:11:11 AM]   ???? Running AI analysis...","[10:11:11 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 95.6% (1/1)","[10:11:11 AM] \n???? Performing compliance verification...","[10:11:11 AM] ???? Mandatory documents: 5 required","[10:11:11 AM] ???? Optional documents provided: 0/12","[10:11:11 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:11:11 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:11:11 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:11:11 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:11:11 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:11:11 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:11:11 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:11:12 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:11:12 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:11:12 AM] ???? Average document quality: 95.6%","[10:11:12 AM] \n??? Calculating risk assessment...","[10:11:12 AM] ???? Document Completeness Risk: HIGH","[10:11:12 AM]    ??????  2 claimed certification(s) not uploaded","[10:11:12 AM] ???? Document Quality Risk: LOW","[10:11:12 AM] \n???? Base Score: 21.6/100","[10:11:12 AM] ???? Risk Penalty: -15.0 points","[10:11:12 AM] ???? Claimed Missing Penalty: -4.0 points","[10:11:12 AM] ???? Overall Supplier Score: 2.6/100","[10:11:12 AM] ??? Analysis complete!","[10:11:12 AM] \n???? Key Insights:","[10:11:12 AM]    ??? Significant compliance gaps identified","[10:11:12 AM]    ??? Multiple required documents missing or inadequate","[10:11:12 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.6%"}	{"aiMode": "ollama", "overallScore": 2.562885391719078, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:11:09.235	2025-11-11 08:11:12.443	\N	ollama	1	1	2025-11-11 08:11:09.216	2025-11-11 08:11:12.445
cmht9ql1e000fbpmowu91y7yw	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[4:59:45 PM] ???? Checking AI backend status...","[4:59:47 PM] ??????  Could not connect to worker service: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON","[4:59:47 PM] ??????  Using fallback mode - Limited analysis","[4:59:47 PM] ???? Make sure WORKER_API_URL is set correctly (current: http://localhost:8001)","[4:59:47 PM] ???? Found 2 version(s) of documents","[4:59:47 PM] ???? Analyzing latest version (v2)...","[4:59:47 PM] ???? Total documents to process: 2","[4:59:47 PM] \n???? Processing category: good Standing","[4:59:47 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[4:59:47 PM]   ???? Fetching document from storage...","[4:59:47 PM]   ???? Running AI analysis...","[4:59:47 PM]   ??????  AI processing unavailable, using basic analysis...","[4:59:47 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[4:59:47 PM] \n???? Processing category: bbbee Accreditation","[4:59:47 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[4:59:47 PM]   ???? Fetching document from storage...","[4:59:48 PM]   ???? Running AI analysis...","[4:59:48 PM]   ??????  AI processing unavailable, using basic analysis...","[4:59:48 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[4:59:48 PM] \n???? Performing compliance verification...","[4:59:48 PM] ???? Mandatory documents: 5 required","[4:59:48 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[4:59:48 PM] ???? Optional documents provided: 1/12","[4:59:48 PM] ??? All required documents provided","[4:59:48 PM] ???? Average document quality: 0.0%","[4:59:48 PM] \n??? Calculating risk assessment...","[4:59:48 PM] ???? Document Completeness Risk: LOW","[4:59:48 PM] ???? Document Quality Risk: HIGH","[4:59:48 PM] \n???? Base Score: 92.0/100","[4:59:48 PM] ???? Risk Penalty: -10.0 points","[4:59:48 PM] ???? Overall Supplier Score: 82.0/100","[4:59:48 PM] ??? Analysis complete!","[4:59:48 PM] \n???? Key Insights:","[4:59:48 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[4:59:48 PM]    ??? All critical requirements met","[4:59:48 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[4:59:48 PM]    ??? Recommended for approval after NDA verification","[4:59:48 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 14:59:45.857	2025-11-10 14:59:48.291	\N	\N	2	2	2025-11-10 14:59:45.791	2025-11-10 14:59:48.294
cmhtber95000rbpmonkoa6315	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable: Failed to parse URL from /api/worker/upload)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable: Failed to parse URL from /api/worker/upload)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:46:33 PM] ???? Checking AI backend status...","[5:46:33 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:46:33 PM] ??? Ollama detected directly - Full AI analysis enabled","[5:46:33 PM]    Models available: llama3.1:latest","[5:46:33 PM] ???? Found 2 version(s) of documents","[5:46:33 PM] ???? Analyzing latest version (v2)...","[5:46:33 PM] ???? Total documents to process: 2","[5:46:33 PM] \n???? Processing category: good Standing","[5:46:33 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:46:33 PM]   ???? Fetching document from storage...","[5:46:34 PM]   ???? Running AI analysis...","[5:46:34 PM]   ??????  AI processing unavailable: Failed to parse URL from /api/worker/upload, using basic analysis...","[5:46:34 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:46:34 PM] \n???? Processing category: bbbee Accreditation","[5:46:34 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:46:34 PM]   ???? Fetching document from storage...","[5:46:34 PM]   ???? Running AI analysis...","[5:46:34 PM]   ??????  AI processing unavailable: Failed to parse URL from /api/worker/upload, using basic analysis...","[5:46:34 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:46:34 PM] \n???? Performing compliance verification...","[5:46:34 PM] ???? Mandatory documents: 5 required","[5:46:34 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:46:34 PM] ???? Optional documents provided: 1/12","[5:46:34 PM] ??? All required documents provided","[5:46:34 PM] ???? Average document quality: 0.0%","[5:46:34 PM] \n??? Calculating risk assessment...","[5:46:34 PM] ???? Document Completeness Risk: LOW","[5:46:34 PM] ???? Document Quality Risk: HIGH","[5:46:34 PM] \n???? Base Score: 92.0/100","[5:46:34 PM] ???? Risk Penalty: -10.0 points","[5:46:34 PM] ???? Overall Supplier Score: 82.0/100","[5:46:34 PM] ??? Analysis complete!","[5:46:34 PM] \n???? Key Insights:","[5:46:34 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:46:34 PM]    ??? All critical requirements met","[5:46:34 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:46:34 PM]    ??? Recommended for approval after NDA verification","[5:46:34 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "ollama", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:46:33.233	2025-11-10 15:46:34.324	\N	ollama	2	2	2025-11-10 15:46:33.209	2025-11-10 15:46:34.325
cmhubgtt30009bpkwzar99mfo	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 0, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 15.41546101580406, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 34.1546101580406, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "================================================================================\\n\\n?????? DOCUMENT TYPE MISMATCH DETECTED:\\n   Expected: companyRegistration\\n   Actual: bank_confirmation_letter\\n   This document appears to be a bank_confirmation_letter but was uploaded as companyRegistration.\\n   Please verify the correct document was uploaded.\\n\\n================================================================================\\n\\nAnalysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 34.1546101580406, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": true}]}}	{"???? Starting AI document analysis...","[10:35:56 AM] ???? Checking AI backend status...","[10:35:56 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:35:56 AM]    Model: llama3.1","[10:35:56 AM] ???? Found 1 version(s) of documents","[10:35:56 AM] ???? Analyzing latest version (v1)...","[10:35:56 AM] ???? Total documents to process: 1","[10:35:56 AM] \n???? Processing category: company Registration","[10:35:56 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:35:56 AM]   ???? Fetching document from storage...","[10:35:56 AM]   ???? Running AI analysis...","[10:35:58 AM]   ??????  DOCUMENT TYPE MISMATCH detected for 1762848015555-BankConfirmationLetter.pdf","[10:35:58 AM]      Expected: companyRegistration, Actual: bank_confirmation_letter","[10:35:58 AM]   ??????  Confidence reduced due to document type mismatch: 34.2%","[10:35:58 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 34.2% ?????? MISMATCH (1/1)","[10:35:58 AM] \n???? Performing compliance verification...","[10:35:58 AM] ???? Mandatory documents: 5 required","[10:35:58 AM] ???? Optional documents provided: 0/12","[10:35:58 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:35:58 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:35:58 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:35:58 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:35:58 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:35:58 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:35:58 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:35:58 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:35:58 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:35:58 AM] ???? Average document quality: 34.2%","[10:35:58 AM] \n??? Calculating risk assessment...","[10:35:59 AM] ???? Document Completeness Risk: HIGH","[10:35:59 AM]    ??????  2 claimed certification(s) not uploaded","[10:35:59 AM] ???? Document Quality Risk: HIGH","[10:35:59 AM] \n???? Base Score: 15.4/100","[10:35:59 AM] ???? Risk Penalty: -25.0 points","[10:35:59 AM] ???? Claimed Missing Penalty: -4.0 points","[10:35:59 AM] ???? Overall Supplier Score: 0.0/100","[10:35:59 AM] ??? Analysis complete!","[10:35:59 AM] \n???? Key Insights:","[10:35:59 AM]    ??? Significant compliance gaps identified","[10:35:59 AM]    ??? Multiple required documents missing or inadequate","[10:35:59 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 0.0%"}	{"aiMode": "ollama", "overallScore": 0, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:35:56.015	2025-11-11 08:35:59.144	\N	ollama	1	1	2025-11-11 08:35:56.008	2025-11-11 08:35:59.145
cmht9sv8r000hbpmo6zmgf40h	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:01:32 PM] ???? Checking AI backend status...","[5:01:32 PM] ??????  Worker service available but AI mode is: unknown","[5:01:32 PM] ??????  Using fallback mode - Limited analysis (Ollama unavailable)","[5:01:32 PM] ???? Found 2 version(s) of documents","[5:01:32 PM] ???? Analyzing latest version (v2)...","[5:01:32 PM] ???? Total documents to process: 2","[5:01:32 PM] \n???? Processing category: good Standing","[5:01:32 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:01:32 PM]   ???? Fetching document from storage...","[5:01:32 PM]   ???? Running AI analysis...","[5:01:32 PM]   ??????  AI processing unavailable, using basic analysis...","[5:01:32 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:01:32 PM] \n???? Processing category: bbbee Accreditation","[5:01:32 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:01:32 PM]   ???? Fetching document from storage...","[5:01:33 PM]   ???? Running AI analysis...","[5:01:33 PM]   ??????  AI processing unavailable, using basic analysis...","[5:01:33 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:01:33 PM] \n???? Performing compliance verification...","[5:01:33 PM] ???? Mandatory documents: 5 required","[5:01:33 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:01:33 PM] ???? Optional documents provided: 1/12","[5:01:33 PM] ??? All required documents provided","[5:01:33 PM] ???? Average document quality: 0.0%","[5:01:33 PM] \n??? Calculating risk assessment...","[5:01:33 PM] ???? Document Completeness Risk: LOW","[5:01:33 PM] ???? Document Quality Risk: HIGH","[5:01:33 PM] \n???? Base Score: 92.0/100","[5:01:33 PM] ???? Risk Penalty: -10.0 points","[5:01:33 PM] ???? Overall Supplier Score: 82.0/100","[5:01:33 PM] ??? Analysis complete!","[5:01:33 PM] \n???? Key Insights:","[5:01:33 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:01:33 PM]    ??? All critical requirements met","[5:01:33 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:01:33 PM]    ??? Recommended for approval after NDA verification","[5:01:33 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:01:32.338	2025-11-10 15:01:33.259	\N	unknown	2	2	2025-11-10 15:01:32.33	2025-11-10 15:01:33.262
cmht9w489000jbpmofpld6td1	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:04:03 PM] ???? Checking AI backend status...","[5:04:04 PM] ??????  Using fallback mode - Limited analysis (Ollama unavailable)","[5:04:04 PM] ???? Found 2 version(s) of documents","[5:04:04 PM] ???? Analyzing latest version (v2)...","[5:04:04 PM] ???? Total documents to process: 2","[5:04:04 PM] \n???? Processing category: good Standing","[5:04:04 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:04:04 PM]   ???? Fetching document from storage...","[5:04:04 PM]   ???? Running AI analysis...","[5:04:04 PM]   ??????  AI processing unavailable, using basic analysis...","[5:04:04 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:04:04 PM] \n???? Processing category: bbbee Accreditation","[5:04:04 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:04:04 PM]   ???? Fetching document from storage...","[5:04:05 PM]   ???? Running AI analysis...","[5:04:05 PM]   ??????  AI processing unavailable, using basic analysis...","[5:04:05 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:04:05 PM] \n???? Performing compliance verification...","[5:04:05 PM] ???? Mandatory documents: 5 required","[5:04:05 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:04:05 PM] ???? Optional documents provided: 1/12","[5:04:05 PM] ??? All required documents provided","[5:04:05 PM] ???? Average document quality: 0.0%","[5:04:05 PM] \n??? Calculating risk assessment...","[5:04:05 PM] ???? Document Completeness Risk: LOW","[5:04:05 PM] ???? Document Quality Risk: HIGH","[5:04:05 PM] \n???? Base Score: 92.0/100","[5:04:05 PM] ???? Risk Penalty: -10.0 points","[5:04:05 PM] ???? Overall Supplier Score: 82.0/100","[5:04:05 PM] ??? Analysis complete!","[5:04:05 PM] \n???? Key Insights:","[5:04:05 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:04:05 PM]    ??? All critical requirements met","[5:04:05 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:04:05 PM]    ??? Recommended for approval after NDA verification","[5:04:05 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "unknown", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:04:03.954	2025-11-10 15:04:05.111	\N	unknown	2	2	2025-11-10 15:04:03.945	2025-11-10 15:04:05.114
cmht9xi5q000lbpmotezkde2n	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:05:08 PM] ???? Checking AI backend status...","[5:05:08 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:05:08 PM] ??????  Ollama is running but no models are installed","[5:05:08 PM] ???? Install a model with: ollama pull llama3.1","[5:05:08 PM] ??????  Using fallback mode - Limited analysis (Ollama unavailable)","[5:05:08 PM] ???? Found 2 version(s) of documents","[5:05:08 PM] ???? Analyzing latest version (v2)...","[5:05:08 PM] ???? Total documents to process: 2","[5:05:08 PM] \n???? Processing category: good Standing","[5:05:08 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:05:08 PM]   ???? Fetching document from storage...","[5:05:09 PM]   ???? Running AI analysis...","[5:05:09 PM]   ??????  AI processing unavailable, using basic analysis...","[5:05:09 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:05:09 PM] \n???? Processing category: bbbee Accreditation","[5:05:09 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:05:09 PM]   ???? Fetching document from storage...","[5:05:09 PM]   ???? Running AI analysis...","[5:05:09 PM]   ??????  AI processing unavailable, using basic analysis...","[5:05:09 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:05:09 PM] \n???? Performing compliance verification...","[5:05:09 PM] ???? Mandatory documents: 5 required","[5:05:09 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:05:09 PM] ???? Optional documents provided: 1/12","[5:05:09 PM] ??? All required documents provided","[5:05:09 PM] ???? Average document quality: 0.0%","[5:05:09 PM] \n??? Calculating risk assessment...","[5:05:09 PM] ???? Document Completeness Risk: LOW","[5:05:09 PM] ???? Document Quality Risk: HIGH","[5:05:09 PM] \n???? Base Score: 92.0/100","[5:05:09 PM] ???? Risk Penalty: -10.0 points","[5:05:09 PM] ???? Overall Supplier Score: 82.0/100","[5:05:09 PM] ??? Analysis complete!","[5:05:09 PM] \n???? Key Insights:","[5:05:09 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:05:09 PM]    ??? All critical requirements met","[5:05:09 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:05:09 PM]    ??? Recommended for approval after NDA verification","[5:05:09 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "simplified", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:05:08.671	2025-11-10 15:05:09.721	\N	simplified	2	2	2025-11-10 15:05:08.654	2025-11-10 15:05:09.724
cmht9y84t000nbpmo2szz4t1g	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:05:42 PM] ???? Checking AI backend status...","[5:05:42 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:05:42 PM] ??????  Ollama is running but no models are installed","[5:05:42 PM] ???? Install a model with: ollama pull llama3.1","[5:05:42 PM] ??????  Using fallback mode - Limited analysis (Ollama unavailable)","[5:05:42 PM] ???? Found 2 version(s) of documents","[5:05:42 PM] ???? Analyzing latest version (v2)...","[5:05:42 PM] ???? Total documents to process: 2","[5:05:42 PM] \n???? Processing category: good Standing","[5:05:42 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:05:42 PM]   ???? Fetching document from storage...","[5:05:42 PM]   ???? Running AI analysis...","[5:05:42 PM]   ??????  AI processing unavailable, using basic analysis...","[5:05:42 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:05:42 PM] \n???? Processing category: bbbee Accreditation","[5:05:42 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:05:42 PM]   ???? Fetching document from storage...","[5:05:42 PM]   ???? Running AI analysis...","[5:05:42 PM]   ??????  AI processing unavailable, using basic analysis...","[5:05:42 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:05:42 PM] \n???? Performing compliance verification...","[5:05:42 PM] ???? Mandatory documents: 5 required","[5:05:42 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:05:42 PM] ???? Optional documents provided: 1/12","[5:05:42 PM] ??? All required documents provided","[5:05:42 PM] ???? Average document quality: 0.0%","[5:05:42 PM] \n??? Calculating risk assessment...","[5:05:42 PM] ???? Document Completeness Risk: LOW","[5:05:42 PM] ???? Document Quality Risk: HIGH","[5:05:42 PM] \n???? Base Score: 92.0/100","[5:05:42 PM] ???? Risk Penalty: -10.0 points","[5:05:42 PM] ???? Overall Supplier Score: 82.0/100","[5:05:42 PM] ??? Analysis complete!","[5:05:42 PM] \n???? Key Insights:","[5:05:42 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:05:42 PM]    ??? All critical requirements met","[5:05:42 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:05:42 PM]    ??? Recommended for approval after NDA verification","[5:05:42 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "simplified", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:05:42.322	2025-11-10 15:05:42.968	\N	simplified	2	2	2025-11-10 15:05:42.318	2025-11-10 15:05:42.97
cmhtbi27g000vbpmorgkh33fv	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable: Server returned non-JSON response (500): <!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"w)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable: Server returned non-JSON response (500): <!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"w)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:49:07 PM] ???? Checking AI backend status...","[5:49:07 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:49:07 PM] ??? Ollama detected directly - Full AI analysis enabled","[5:49:07 PM]    Models available: llama3.1:latest","[5:49:07 PM] ???? Found 2 version(s) of documents","[5:49:07 PM] ???? Analyzing latest version (v2)...","[5:49:07 PM] ???? Total documents to process: 2","[5:49:07 PM] \n???? Processing category: good Standing","[5:49:07 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:49:07 PM]   ???? Fetching document from storage...","[5:49:07 PM]   ???? Running AI analysis...","[5:49:08 PM]   ??????  AI processing unavailable: Server returned non-JSON response (500): <!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"w, using basic analysis...","[5:49:08 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:49:08 PM] \n???? Processing category: bbbee Accreditation","[5:49:08 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:49:08 PM]   ???? Fetching document from storage...","[5:49:09 PM]   ???? Running AI analysis...","[5:49:10 PM]   ??????  AI processing unavailable: Server returned non-JSON response (500): <!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"w, using basic analysis...","[5:49:10 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:49:10 PM] \n???? Performing compliance verification...","[5:49:10 PM] ???? Mandatory documents: 5 required","[5:49:10 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:49:10 PM] ???? Optional documents provided: 1/12","[5:49:10 PM] ??? All required documents provided","[5:49:10 PM] ???? Average document quality: 0.0%","[5:49:10 PM] \n??? Calculating risk assessment...","[5:49:10 PM] ???? Document Completeness Risk: LOW","[5:49:10 PM] ???? Document Quality Risk: HIGH","[5:49:10 PM] \n???? Base Score: 92.0/100","[5:49:10 PM] ???? Risk Penalty: -10.0 points","[5:49:10 PM] ???? Overall Supplier Score: 82.0/100","[5:49:10 PM] ??? Analysis complete!","[5:49:10 PM] \n???? Key Insights:","[5:49:10 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:49:10 PM]    ??? All critical requirements met","[5:49:10 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:49:10 PM]    ??? Recommended for approval after NDA verification","[5:49:10 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "ollama", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:49:07.383	2025-11-10 15:49:10.116	\N	ollama	2	2	2025-11-10 15:49:07.373	2025-11-10 15:49:10.117
cmhtbgaah000tbpmos8yl6nz1	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 82, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 92, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 0, "totalDocumentsAnalyzed": 0}, "documentAnalysis": {"goodStanding": [{"status": "basic_check", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Document received and validated (AI analysis unavailable: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}], "bbbeeAccreditation": [{"status": "basic_check", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Document received and validated (AI analysis unavailable: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON)", "riskLevel": "To be determined", "confidence": 75, "complianceStatus": "Pending manual review"}]}}	{"???? Starting AI document analysis...","[5:47:44 PM] ???? Checking AI backend status...","[5:47:44 PM] ???? Checking Ollama directly at http://localhost:11434...","[5:47:44 PM] ??? Ollama detected directly - Full AI analysis enabled","[5:47:44 PM]    Models available: llama3.1:latest","[5:47:44 PM] ???? Found 2 version(s) of documents","[5:47:44 PM] ???? Analyzing latest version (v2)...","[5:47:44 PM] ???? Total documents to process: 2","[5:47:44 PM] \n???? Processing category: good Standing","[5:47:44 PM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[5:47:44 PM]   ???? Fetching document from storage...","[5:47:45 PM]   ???? Running AI analysis...","[5:47:46 PM]   ??????  AI processing unavailable: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON, using basic analysis...","[5:47:46 PM]   ??? Basic check completed: 1761304989587-Good_Standing_Tax.pdf (1/2)","[5:47:46 PM] \n???? Processing category: bbbee Accreditation","[5:47:46 PM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[5:47:46 PM]   ???? Fetching document from storage...","[5:47:46 PM]   ???? Running AI analysis...","[5:47:47 PM]   ??????  AI processing unavailable: Unexpected token '<', \\"<!DOCTYPE \\"... is not valid JSON, using basic analysis...","[5:47:47 PM]   ??? Basic check completed: 1761304989583-BEE_Certificate.pdf (2/2)","[5:47:47 PM] \n???? Performing compliance verification...","[5:47:47 PM] ???? Mandatory documents: 5 required","[5:47:47 PM] ??? Tax requirement satisfied with: Letter of Good Standing","[5:47:47 PM] ???? Optional documents provided: 1/12","[5:47:47 PM] ??? All required documents provided","[5:47:47 PM] ???? Average document quality: 0.0%","[5:47:47 PM] \n??? Calculating risk assessment...","[5:47:47 PM] ???? Document Completeness Risk: LOW","[5:47:47 PM] ???? Document Quality Risk: HIGH","[5:47:47 PM] \n???? Base Score: 92.0/100","[5:47:47 PM] ???? Risk Penalty: -10.0 points","[5:47:47 PM] ???? Overall Supplier Score: 82.0/100","[5:47:47 PM] ??? Analysis complete!","[5:47:47 PM] \n???? Key Insights:","[5:47:47 PM]    ??? Supplier demonstrates strong compliance and documentation quality","[5:47:47 PM]    ??? All critical requirements met","[5:47:47 PM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[5:47:47 PM]    ??? Recommended for approval after NDA verification","[5:47:47 PM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 82.0%"}	{"aiMode": "ollama", "overallScore": 82, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-10 15:47:44.544	2025-11-10 15:47:47.754	\N	ollama	2	2	2025-11-10 15:47:44.537	2025-11-10 15:47:47.756
cmhuanq2i001nbpmoax4261lh	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 1.69203907767367, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 20.69203907767367, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 86.9203907767367, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 86.9203907767367, "extractedData": {}, "complianceStatus": "Manual review required"}]}}	{"???? Starting AI document analysis...","[10:13:18 AM] ???? Checking AI backend status...","[10:13:18 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:13:18 AM]    Model: llama3.1","[10:13:18 AM] ???? Found 1 version(s) of documents","[10:13:18 AM] ???? Analyzing latest version (v1)...","[10:13:18 AM] ???? Total documents to process: 1","[10:13:18 AM] \n???? Processing category: company Registration","[10:13:18 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:13:18 AM]   ???? Fetching document from storage...","[10:13:18 AM]   ???? Running AI analysis...","[10:13:19 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 86.9% (1/1)","[10:13:19 AM] \n???? Performing compliance verification...","[10:13:19 AM] ???? Mandatory documents: 5 required","[10:13:19 AM] ???? Optional documents provided: 0/12","[10:13:19 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:13:19 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:13:19 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:13:19 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:13:19 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:13:19 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:13:19 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:13:19 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:13:19 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:13:19 AM] ???? Average document quality: 86.9%","[10:13:19 AM] \n??? Calculating risk assessment...","[10:13:19 AM] ???? Document Completeness Risk: HIGH","[10:13:19 AM]    ??????  2 claimed certification(s) not uploaded","[10:13:19 AM] ???? Document Quality Risk: LOW","[10:13:20 AM] \n???? Base Score: 20.7/100","[10:13:20 AM] ???? Risk Penalty: -15.0 points","[10:13:20 AM] ???? Claimed Missing Penalty: -4.0 points","[10:13:20 AM] ???? Overall Supplier Score: 1.7/100","[10:13:20 AM] ??? Analysis complete!","[10:13:20 AM] \n???? Key Insights:","[10:13:20 AM]    ??? Significant compliance gaps identified","[10:13:20 AM]    ??? Multiple required documents missing or inadequate","[10:13:20 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 1.7%"}	{"aiMode": "ollama", "overallScore": 1.69203907767367, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:13:18.144	2025-11-11 08:13:20.911	\N	ollama	1	1	2025-11-11 08:13:18.138	2025-11-11 08:13:20.914
cmhub1eww001vbpmo0x4cd4o5	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.548962439428344, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.54896243942834, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 95.48962439428344, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 95.48962439428344, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:23:56 AM] ???? Checking AI backend status...","[10:23:56 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:23:56 AM]    Model: llama3.1","[10:23:56 AM] ???? Found 1 version(s) of documents","[10:23:56 AM] ???? Analyzing latest version (v1)...","[10:23:56 AM] ???? Total documents to process: 1","[10:23:56 AM] \n???? Processing category: company Registration","[10:23:56 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:23:56 AM]   ???? Fetching document from storage...","[10:23:57 AM]   ???? Running AI analysis...","[10:24:01 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 95.5% (1/1)","[10:24:01 AM] \n???? Performing compliance verification...","[10:24:01 AM] ???? Mandatory documents: 5 required","[10:24:01 AM] ???? Optional documents provided: 0/12","[10:24:01 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:24:01 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:24:01 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:24:01 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:24:01 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:24:01 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:24:01 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:24:01 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:24:01 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:24:01 AM] ???? Average document quality: 95.5%","[10:24:01 AM] \n??? Calculating risk assessment...","[10:24:01 AM] ???? Document Completeness Risk: HIGH","[10:24:01 AM]    ??????  2 claimed certification(s) not uploaded","[10:24:01 AM] ???? Document Quality Risk: LOW","[10:24:01 AM] \n???? Base Score: 21.5/100","[10:24:01 AM] ???? Risk Penalty: -15.0 points","[10:24:01 AM] ???? Claimed Missing Penalty: -4.0 points","[10:24:01 AM] ???? Overall Supplier Score: 2.5/100","[10:24:02 AM] ??? Analysis complete!","[10:24:02 AM] \n???? Key Insights:","[10:24:02 AM]    ??? Significant compliance gaps identified","[10:24:02 AM]    ??? Multiple required documents missing or inadequate","[10:24:02 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.5%"}	{"aiMode": "ollama", "overallScore": 2.548962439428344, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:23:56.868	2025-11-11 08:24:02.83	\N	ollama	1	1	2025-11-11 08:23:56.864	2025-11-11 08:24:02.832
cmhuasjc4001pbpmozucc5q8y	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.933356948126907, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.93335694812691, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 99.33356948126908, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Basic analysis of document 29a4038d-dd73-42c5-b821-f71cc83a7e6d: Content appears to be valid.", "riskLevel": "Low risk - document appears legitimate.", "confidence": 99.33356948126908, "extractedData": {}, "complianceStatus": "Document meets basic compliance requirements."}]}}	{"???? Starting AI document analysis...","[10:17:03 AM] ???? Checking AI backend status...","[10:17:03 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:17:03 AM]    Model: llama3.1","[10:17:03 AM] ???? Found 1 version(s) of documents","[10:17:03 AM] ???? Analyzing latest version (v1)...","[10:17:03 AM] ???? Total documents to process: 1","[10:17:03 AM] \n???? Processing category: company Registration","[10:17:03 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:17:03 AM]   ???? Fetching document from storage...","[10:17:13 AM]   ???? Running AI analysis...","[10:17:15 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 99.3% (1/1)","[10:17:15 AM] \n???? Performing compliance verification...","[10:17:15 AM] ???? Mandatory documents: 5 required","[10:17:15 AM] ???? Optional documents provided: 0/12","[10:17:15 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:17:15 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:17:15 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:17:15 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:17:15 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:17:15 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:17:15 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:17:15 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:17:15 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:17:15 AM] ???? Average document quality: 99.3%","[10:17:15 AM] \n??? Calculating risk assessment...","[10:17:15 AM] ???? Document Completeness Risk: HIGH","[10:17:15 AM]    ??????  2 claimed certification(s) not uploaded","[10:17:15 AM] ???? Document Quality Risk: LOW","[10:17:15 AM] \n???? Base Score: 21.9/100","[10:17:15 AM] ???? Risk Penalty: -15.0 points","[10:17:15 AM] ???? Claimed Missing Penalty: -4.0 points","[10:17:15 AM] ???? Overall Supplier Score: 2.9/100","[10:17:15 AM] ??? Analysis complete!","[10:17:15 AM] \n???? Key Insights:","[10:17:15 AM]    ??? Significant compliance gaps identified","[10:17:15 AM]    ??? Multiple required documents missing or inadequate","[10:17:15 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.9%"}	{"aiMode": "ollama", "overallScore": 2.933356948126907, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:17:02.821	2025-11-11 08:17:15.91	\N	ollama	1	1	2025-11-11 08:17:02.692	2025-11-11 08:17:15.912
cmhub2wk1001xbpmoqm31eimx	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.095381793959636, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.09538179395964, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 90.95381793959635, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 90.95381793959635, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:25:06 AM] ???? Checking AI backend status...","[10:25:06 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:25:06 AM]    Model: llama3.1","[10:25:06 AM] ???? Found 1 version(s) of documents","[10:25:06 AM] ???? Analyzing latest version (v1)...","[10:25:06 AM] ???? Total documents to process: 1","[10:25:06 AM] \n???? Processing category: company Registration","[10:25:06 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:25:06 AM]   ???? Fetching document from storage...","[10:25:06 AM]   ???? Running AI analysis...","[10:25:08 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 91.0% (1/1)","[10:25:08 AM] \n???? Performing compliance verification...","[10:25:08 AM] ???? Mandatory documents: 5 required","[10:25:08 AM] ???? Optional documents provided: 0/12","[10:25:08 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:25:08 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:25:08 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:25:08 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:25:08 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:25:08 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:25:08 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:25:08 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:25:08 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:25:08 AM] ???? Average document quality: 91.0%","[10:25:08 AM] \n??? Calculating risk assessment...","[10:25:08 AM] ???? Document Completeness Risk: HIGH","[10:25:08 AM]    ??????  2 claimed certification(s) not uploaded","[10:25:08 AM] ???? Document Quality Risk: LOW","[10:25:08 AM] \n???? Base Score: 21.1/100","[10:25:08 AM] ???? Risk Penalty: -15.0 points","[10:25:08 AM] ???? Claimed Missing Penalty: -4.0 points","[10:25:08 AM] ???? Overall Supplier Score: 2.1/100","[10:25:09 AM] ??? Analysis complete!","[10:25:09 AM] \n???? Key Insights:","[10:25:09 AM]    ??? Significant compliance gaps identified","[10:25:09 AM]    ??? Multiple required documents missing or inadequate","[10:25:09 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.1%"}	{"aiMode": "ollama", "overallScore": 2.095381793959636, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:25:06.391	2025-11-11 08:25:09.638	\N	ollama	1	1	2025-11-11 08:25:06.385	2025-11-11 08:25:09.64
cmhuawib2001rbpmone9wbvkt	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 1.911158516900816, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 20.91115851690082, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 89.11158516900815, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 89.11158516900815, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:20:08 AM] ???? Checking AI backend status...","[10:20:08 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:20:08 AM]    Model: llama3.1","[10:20:08 AM] ???? Found 1 version(s) of documents","[10:20:08 AM] ???? Analyzing latest version (v1)...","[10:20:08 AM] ???? Total documents to process: 1","[10:20:08 AM] \n???? Processing category: company Registration","[10:20:08 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:20:08 AM]   ???? Fetching document from storage...","[10:20:16 AM]   ???? Running AI analysis...","[10:20:18 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 89.1% (1/1)","[10:20:18 AM] \n???? Performing compliance verification...","[10:20:19 AM] ???? Mandatory documents: 5 required","[10:20:19 AM] ???? Optional documents provided: 0/12","[10:20:19 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:20:19 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:20:19 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:20:19 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:20:19 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:20:19 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:20:19 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:20:19 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:20:19 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:20:19 AM] ???? Average document quality: 89.1%","[10:20:19 AM] \n??? Calculating risk assessment...","[10:20:19 AM] ???? Document Completeness Risk: HIGH","[10:20:19 AM]    ??????  2 claimed certification(s) not uploaded","[10:20:19 AM] ???? Document Quality Risk: LOW","[10:20:19 AM] \n???? Base Score: 20.9/100","[10:20:19 AM] ???? Risk Penalty: -15.0 points","[10:20:19 AM] ???? Claimed Missing Penalty: -4.0 points","[10:20:19 AM] ???? Overall Supplier Score: 1.9/100","[10:20:19 AM] ??? Analysis complete!","[10:20:19 AM] \n???? Key Insights:","[10:20:19 AM]    ??? Significant compliance gaps identified","[10:20:19 AM]    ??? Multiple required documents missing or inadequate","[10:20:19 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 1.9%"}	{"aiMode": "ollama", "overallScore": 1.911158516900816, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:20:08.076	2025-11-11 08:20:20.069	\N	ollama	1	1	2025-11-11 08:20:07.982	2025-11-11 08:20:20.072
cmhu9nfs50013bpmoovx5qzaq	cmh4qn1op000lbpbkvnma7mv3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 100, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "LOW"}, "complianceCheck": {"complianceScore": 100, "missingDocuments": [], "claimedButMissing": [], "optionalDocsCount": 1, "optionalDocuments": ["goodStanding"], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 92.05663247349167, "totalDocumentsAnalyzed": 2}, "documentAnalysis": {"goodStanding": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1761304989587-Good_Standing_Tax.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 94.42755297554456, "extractedData": {}, "complianceStatus": "Manual review required"}], "bbbeeAccreditation": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1761304989583-BEE_Certificate.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 89.6857119714388, "extractedData": {}, "complianceStatus": "Manual review required"}]}}	{"???? Starting AI document analysis...","[9:45:05 AM] ???? Checking AI backend status...","[9:45:05 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[9:45:05 AM]    Model: llama3.1","[9:45:05 AM] ???? Found 2 version(s) of documents","[9:45:05 AM] ???? Analyzing latest version (v2)...","[9:45:05 AM] ???? Total documents to process: 2","[9:45:05 AM] \n???? Processing category: good Standing","[9:45:05 AM]   ??? Analyzing: 1761304989587-Good_Standing_Tax.pdf...","[9:45:05 AM]   ???? Fetching document from storage...","[9:45:05 AM]   ???? Running AI analysis...","[9:45:05 AM]   ??? ???? [Ollama] Completed: 1761304989587-Good_Standing_Tax.pdf - Confidence: 94.4% (1/2)","[9:45:05 AM] \n???? Processing category: bbbee Accreditation","[9:45:05 AM]   ??? Analyzing: 1761304989583-BEE_Certificate.pdf...","[9:45:05 AM]   ???? Fetching document from storage...","[9:45:09 AM]   ???? Running AI analysis...","[9:45:10 AM]   ??? ???? [Ollama] Completed: 1761304989583-BEE_Certificate.pdf - Confidence: 89.7% (2/2)","[9:45:10 AM] \n???? Performing compliance verification...","[9:45:10 AM] ???? Mandatory documents: 5 required","[9:45:10 AM] ??? Tax requirement satisfied with: Letter of Good Standing","[9:45:10 AM] ???? Optional documents provided: 1/12","[9:45:10 AM] ??? All required documents provided","[9:45:10 AM] ???? Average document quality: 92.1%","[9:45:10 AM] \n??? Calculating risk assessment...","[9:45:10 AM] ???? Document Completeness Risk: LOW","[9:45:10 AM] ???? Document Quality Risk: LOW","[9:45:10 AM] \n???? Base Score: 100.0/100","[9:45:10 AM] ???? Risk Penalty: -0.0 points","[9:45:10 AM] ???? Overall Supplier Score: 100.0/100","[9:45:10 AM] ??? Analysis complete!","[9:45:10 AM] \n???? Key Insights:","[9:45:10 AM]    ??? Supplier demonstrates strong compliance and documentation quality","[9:45:10 AM]    ??? All critical requirements met","[9:45:10 AM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[9:45:10 AM]    ??? Recommended for approval after NDA verification","[9:45:10 AM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 100.0%"}	{"aiMode": "ollama", "overallScore": 100, "totalDocuments": 2, "processedDocuments": 2}	\N	\N	2025-11-11 07:45:05.206	2025-11-11 07:45:10.969	\N	ollama	2	2	2025-11-11 07:45:05.187	2025-11-11 07:45:10.975
cmhub14z9001tbpmoeome278f	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.29387534561365, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.29387534561365, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 92.93875345613648, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 92.93875345613648, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:23:44 AM] ???? Checking AI backend status...","[10:23:44 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:23:44 AM]    Model: llama3.1","[10:23:44 AM] ???? Found 1 version(s) of documents","[10:23:44 AM] ???? Analyzing latest version (v1)...","[10:23:44 AM] ???? Total documents to process: 1","[10:23:44 AM] \n???? Processing category: company Registration","[10:23:44 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:23:44 AM]   ???? Fetching document from storage...","[10:23:45 AM]   ???? Running AI analysis...","[10:23:49 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 92.9% (1/1)","[10:23:49 AM] \n???? Performing compliance verification...","[10:23:49 AM] ???? Mandatory documents: 5 required","[10:23:49 AM] ???? Optional documents provided: 0/12","[10:23:49 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:23:49 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:23:49 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:23:49 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:23:49 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:23:49 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:23:49 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:23:49 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:23:49 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:23:49 AM] ???? Average document quality: 92.9%","[10:23:49 AM] \n??? Calculating risk assessment...","[10:23:49 AM] ???? Document Completeness Risk: HIGH","[10:23:49 AM]    ??????  2 claimed certification(s) not uploaded","[10:23:49 AM] ???? Document Quality Risk: LOW","[10:23:49 AM] \n???? Base Score: 21.3/100","[10:23:49 AM] ???? Risk Penalty: -15.0 points","[10:23:51 AM] ???? Claimed Missing Penalty: -4.0 points","[10:23:51 AM] ???? Overall Supplier Score: 2.3/100","[10:23:51 AM] ??? Analysis complete!","[10:23:51 AM] \n???? Key Insights:","[10:23:51 AM]    ??? Significant compliance gaps identified","[10:23:51 AM]    ??? Multiple required documents missing or inadequate","[10:23:51 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.3%"}	{"aiMode": "ollama", "overallScore": 2.29387534561365, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:23:44.003	2025-11-11 08:23:51.211	\N	ollama	1	1	2025-11-11 08:23:43.989	2025-11-11 08:23:51.215
cmhubnkbc000fbpkwgq321hji	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 36.89223874966888, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "HIGH", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "MEDIUM"}, "complianceCheck": {"complianceScore": 58.89223874966888, "missingDocuments": ["taxClearance", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 3, "requiredDocuments": 5, "averageDocumentQuality": 68.92238749668887, "totalDocumentsAnalyzed": 3}, "documentAnalysis": {"bankConfirmation": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762850416903-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 97.87905362479056, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}], "bbbeeAccreditation": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762850416899-BEE_Certificate.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 88.76591709023563, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}], "companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762850416895-BEE_Certificate.pdf", "findings": "================================================================================\\n\\n?????? DOCUMENT TYPE MISMATCH DETECTED:\\n   Expected: companyRegistration\\n   Actual: bbbee_certificate\\n   This document appears to be a bbbee_certificate but was uploaded as companyRegistration.\\n   Please verify the correct document was uploaded.\\n\\n================================================================================\\n\\nAnalysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 20.12219177504038, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": true}]}}	{"???? Starting AI document analysis...","[10:41:10 AM] ???? Checking AI backend status...","[10:41:10 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:41:10 AM]    Model: llama3.1","[10:41:10 AM] ???? Found 2 version(s) of documents","[10:41:10 AM] ???? Analyzing latest version (v2)...","[10:41:10 AM] ???? Total documents to process: 3","[10:41:10 AM] \n???? Processing category: bank Confirmation","[10:41:10 AM]   ??? Analyzing: 1762850416903-BankConfirmationLetter.pdf...","[10:41:10 AM]   ???? Fetching document from storage...","[10:41:12 AM]   ???? Running AI analysis...","[10:41:14 AM]   ??? ???? [Ollama] Completed: 1762850416903-BankConfirmationLetter.pdf - Confidence: 97.9% (1/3)","[10:41:14 AM] \n???? Processing category: bbbee Accreditation","[10:41:14 AM]   ??? Analyzing: 1762850416899-BEE_Certificate.pdf...","[10:41:14 AM]   ???? Fetching document from storage...","[10:41:17 AM]   ???? Running AI analysis...","[10:41:18 AM]   ??? ???? [Ollama] Completed: 1762850416899-BEE_Certificate.pdf - Confidence: 88.8% (2/3)","[10:41:18 AM] \n???? Processing category: company Registration","[10:41:18 AM]   ??? Analyzing: 1762850416895-BEE_Certificate.pdf...","[10:41:18 AM]   ???? Fetching document from storage...","[10:41:20 AM]   ???? Running AI analysis...","[10:41:21 AM]   ??????  DOCUMENT TYPE MISMATCH detected for 1762850416895-BEE_Certificate.pdf","[10:41:21 AM]      Expected: companyRegistration, Actual: bbbee_certificate","[10:41:21 AM]   ??????  Confidence reduced due to document type mismatch: 20.1%","[10:41:21 AM]   ??? ???? [Ollama] Completed: 1762850416895-BEE_Certificate.pdf - Confidence: 20.1% ?????? MISMATCH (3/3)","[10:41:21 AM] \n???? Performing compliance verification...","[10:41:21 AM] ???? Mandatory documents: 5 required","[10:41:21 AM] ???? Optional documents provided: 0/12","[10:41:21 AM] \n??????  MISSING MANDATORY DOCUMENTS (2/5):","[10:41:21 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:41:21 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:41:21 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:41:21 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:41:21 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:41:21 AM] ??????  Missing required documents: taxClearance, nda","[10:41:21 AM] ???? Average document quality: 68.9%","[10:41:21 AM] \n??? Calculating risk assessment...","[10:41:21 AM] ???? Document Completeness Risk: MEDIUM","[10:41:21 AM]    ??????  2 claimed certification(s) not uploaded","[10:41:21 AM] ???? Document Quality Risk: HIGH","[10:41:21 AM] \n???? Base Score: 58.9/100","[10:41:21 AM] ???? Risk Penalty: -18.0 points","[10:41:21 AM] ???? Claimed Missing Penalty: -4.0 points","[10:41:21 AM] ???? Overall Supplier Score: 36.9/100","[10:41:21 AM] ??? Analysis complete!","[10:41:21 AM] \n???? Key Insights:","[10:41:21 AM]    ??? Significant compliance gaps identified","[10:41:21 AM]    ??? Multiple required documents missing or inadequate","[10:41:21 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 36.9%"}	{"aiMode": "ollama", "overallScore": 36.89223874966888, "totalDocuments": 3, "processedDocuments": 3}	\N	\N	2025-11-11 08:41:10.305	2025-11-11 08:41:21.973	\N	ollama	3	3	2025-11-11 08:41:10.297	2025-11-11 08:41:21.976
cmhu9u5b00015bpmo888wntco	cmhswgjtp0007bp5w61x9ivg3	COMPLETED	100	Processing bbbeeAccreditation documents	{"insights": ["??? Supplier demonstrates strong compliance and documentation quality", "??? All critical requirements met", "???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages", "??? Recommended for approval after NDA verification", "???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA"], "overallScore": 88, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "MEDIUM"}, "complianceCheck": {"complianceScore": 100, "missingDocuments": [], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 5, "requiredDocuments": 5, "averageDocumentQuality": 89.99826467714236, "totalDocumentsAnalyzed": 3}, "documentAnalysis": {"nda": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762765042547-standard-nda.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 86.7004488026976, "extractedData": {}, "complianceStatus": "Manual review required"}], "taxClearance": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762765042544-Good_Standing_Tax.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 85.10855923499524, "extractedData": {}, "complianceStatus": "Manual review required"}], "bbbeeAccreditation": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762765042541-BEE_Certificate.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 98.1857859937343, "extractedData": {}, "complianceStatus": "Manual review required"}]}}	{"???? Starting AI document analysis...","[9:50:18 AM] ???? Checking AI backend status...","[9:50:18 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[9:50:18 AM]    Model: llama3.1","[9:50:18 AM] ???? Found 2 version(s) of documents","[9:50:18 AM] ???? Analyzing latest version (v4)...","[9:50:18 AM] ???? Total documents to process: 3","[9:50:18 AM] \n???? Processing category: nda","[9:50:18 AM]   ??? Analyzing: 1762765042547-standard-nda.pdf...","[9:50:18 AM]   ???? Fetching document from storage...","[9:50:18 AM]   ???? Running AI analysis...","[9:50:18 AM]   ??? ???? [Ollama] Completed: 1762765042547-standard-nda.pdf - Confidence: 86.7% (1/3)","[9:50:18 AM] \n???? Processing category: tax Clearance","[9:50:18 AM]   ??? Analyzing: 1762765042544-Good_Standing_Tax.pdf...","[9:50:18 AM]   ???? Fetching document from storage...","[9:50:21 AM]   ???? Running AI analysis...","[9:50:21 AM]   ??? ???? [Ollama] Completed: 1762765042544-Good_Standing_Tax.pdf - Confidence: 85.1% (2/3)","[9:50:21 AM] \n???? Processing category: bbbee Accreditation","[9:50:22 AM]   ??? Analyzing: 1762765042541-BEE_Certificate.pdf...","[9:50:22 AM]   ???? Fetching document from storage...","[9:50:23 AM]   ???? Running AI analysis...","[9:50:23 AM]   ??? ???? [Ollama] Completed: 1762765042541-BEE_Certificate.pdf - Confidence: 98.2% (3/3)","[9:50:23 AM] \n???? Performing compliance verification...","[9:50:23 AM] ???? Mandatory documents: 5 required","[9:50:23 AM] ??? Tax requirement satisfied with: Tax Clearance Certificate","[9:50:23 AM] ???? Optional documents provided: 0/12","[9:50:23 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[9:50:23 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[9:50:23 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[9:50:23 AM] ??? All required documents provided","[9:50:23 AM] ???? Average document quality: 90.0%","[9:50:23 AM] \n??? Calculating risk assessment...","[9:50:23 AM] ???? Document Completeness Risk: MEDIUM","[9:50:23 AM]    ??????  2 claimed certification(s) not uploaded","[9:50:24 AM] ???? Document Quality Risk: LOW","[9:50:24 AM] \n???? Base Score: 100.0/100","[9:50:24 AM] ???? Risk Penalty: -8.0 points","[9:50:24 AM] ???? Claimed Missing Penalty: -4.0 points","[9:50:24 AM] ???? Overall Supplier Score: 88.0/100","[9:50:24 AM] ??? Analysis complete!","[9:50:24 AM] \n???? Key Insights:","[9:50:24 AM]    ??? Supplier demonstrates strong compliance and documentation quality","[9:50:24 AM]    ??? All critical requirements met","[9:50:24 AM]    ???? MANUAL CHECK REQUIRED: Verify NDA is signed and initialed on all pages","[9:50:24 AM]    ??? Recommended for approval after NDA verification","[9:50:24 AM]    ???? Remember: AI cannot verify handwritten signatures - manual review essential for NDA","\n??? Analysis completed successfully! Overall score: 88.0%"}	{"aiMode": "ollama", "overallScore": 88, "totalDocuments": 3, "processedDocuments": 3}	\N	\N	2025-11-11 07:50:18.214	2025-11-11 07:50:24.581	\N	ollama	3	3	2025-11-11 07:50:18.204	2025-11-11 07:50:24.583
cmhub3d16001zbpmoxfwd7xre	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.001100929764505, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.0011009297645, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 90.01100929764505, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 90.01100929764505, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:25:27 AM] ???? Checking AI backend status...","[10:25:27 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:25:27 AM]    Model: llama3.1","[10:25:27 AM] ???? Found 1 version(s) of documents","[10:25:27 AM] ???? Analyzing latest version (v1)...","[10:25:27 AM] ???? Total documents to process: 1","[10:25:27 AM] \n???? Processing category: company Registration","[10:25:27 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:25:27 AM]   ???? Fetching document from storage...","[10:25:28 AM]   ???? Running AI analysis...","[10:25:31 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 90.0% (1/1)","[10:25:31 AM] \n???? Performing compliance verification...","[10:25:31 AM] ???? Mandatory documents: 5 required","[10:25:31 AM] ???? Optional documents provided: 0/12","[10:25:31 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:25:31 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:25:31 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:25:31 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:25:31 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:25:31 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:25:31 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:25:31 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:25:31 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:25:31 AM] ???? Average document quality: 90.0%","[10:25:31 AM] \n??? Calculating risk assessment...","[10:25:31 AM] ???? Document Completeness Risk: HIGH","[10:25:31 AM]    ??????  2 claimed certification(s) not uploaded","[10:25:31 AM] ???? Document Quality Risk: LOW","[10:25:31 AM] \n???? Base Score: 21.0/100","[10:25:31 AM] ???? Risk Penalty: -15.0 points","[10:25:31 AM] ???? Claimed Missing Penalty: -4.0 points","[10:25:31 AM] ???? Overall Supplier Score: 2.0/100","[10:25:32 AM] ??? Analysis complete!","[10:25:32 AM] \n???? Key Insights:","[10:25:32 AM]    ??? Significant compliance gaps identified","[10:25:32 AM]    ??? Multiple required documents missing or inadequate","[10:25:32 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.0%"}	{"aiMode": "ollama", "overallScore": 2.001100929764505, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:25:27.743	2025-11-11 08:25:32.925	\N	ollama	1	1	2025-11-11 08:25:27.739	2025-11-11 08:25:32.93
cmhub5xoy0001bpkwmmurax44	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.027691459407635, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.02769145940763, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 90.27691459407633, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 90.27691459407633, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:27:27 AM] ???? Checking AI backend status...","[10:27:27 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:27:27 AM]    Model: llama3.1","[10:27:27 AM] ???? Found 1 version(s) of documents","[10:27:27 AM] ???? Analyzing latest version (v1)...","[10:27:28 AM] ???? Total documents to process: 1","[10:27:28 AM] \n???? Processing category: company Registration","[10:27:28 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:27:28 AM]   ???? Fetching document from storage...","[10:27:28 AM]   ???? Running AI analysis...","[10:27:33 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 90.3% (1/1)","[10:27:33 AM] \n???? Performing compliance verification...","[10:27:33 AM] ???? Mandatory documents: 5 required","[10:27:33 AM] ???? Optional documents provided: 0/12","[10:27:33 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:27:33 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:27:34 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:27:34 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:27:34 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:27:34 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:27:34 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:27:34 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:27:34 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:27:34 AM] ???? Average document quality: 90.3%","[10:27:34 AM] \n??? Calculating risk assessment...","[10:27:34 AM] ???? Document Completeness Risk: HIGH","[10:27:34 AM]    ??????  2 claimed certification(s) not uploaded","[10:27:34 AM] ???? Document Quality Risk: LOW","[10:27:34 AM] \n???? Base Score: 21.0/100","[10:27:34 AM] ???? Risk Penalty: -15.0 points","[10:27:34 AM] ???? Claimed Missing Penalty: -4.0 points","[10:27:34 AM] ???? Overall Supplier Score: 2.0/100","[10:27:34 AM] ??? Analysis complete!","[10:27:34 AM] \n???? Key Insights:","[10:27:34 AM]    ??? Significant compliance gaps identified","[10:27:34 AM]    ??? Multiple required documents missing or inadequate","[10:27:35 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.0%"}	{"aiMode": "ollama", "overallScore": 2.027691459407635, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:27:27.844	2025-11-11 08:27:35.456	\N	ollama	1	1	2025-11-11 08:27:27.825	2025-11-11 08:27:35.459
cmhub8pn80003bpkwnzu3f04d	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.371875195984352, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.37187519598435, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 93.71875195984353, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 93.71875195984353, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:29:37 AM] ???? Checking AI backend status...","[10:29:37 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:29:37 AM]    Model: llama3.1","[10:29:37 AM] ???? Found 1 version(s) of documents","[10:29:37 AM] ???? Analyzing latest version (v1)...","[10:29:37 AM] ???? Total documents to process: 1","[10:29:37 AM] \n???? Processing category: company Registration","[10:29:37 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:29:37 AM]   ???? Fetching document from storage...","[10:29:39 AM]   ???? Running AI analysis...","[10:29:42 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 93.7% (1/1)","[10:29:42 AM] \n???? Performing compliance verification...","[10:29:42 AM] ???? Mandatory documents: 5 required","[10:29:42 AM] ???? Optional documents provided: 0/12","[10:29:42 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:29:42 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:29:42 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:29:42 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:29:42 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:29:42 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:29:42 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:29:42 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:29:42 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:29:42 AM] ???? Average document quality: 93.7%","[10:29:42 AM] \n??? Calculating risk assessment...","[10:29:42 AM] ???? Document Completeness Risk: HIGH","[10:29:42 AM]    ??????  2 claimed certification(s) not uploaded","[10:29:42 AM] ???? Document Quality Risk: LOW","[10:29:42 AM] \n???? Base Score: 21.4/100","[10:29:42 AM] ???? Risk Penalty: -15.0 points","[10:29:42 AM] ???? Claimed Missing Penalty: -4.0 points","[10:29:42 AM] ???? Overall Supplier Score: 2.4/100","[10:29:42 AM] ??? Analysis complete!","[10:29:42 AM] \n???? Key Insights:","[10:29:42 AM]    ??? Significant compliance gaps identified","[10:29:42 AM]    ??? Multiple required documents missing or inadequate","[10:29:42 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.4%"}	{"aiMode": "ollama", "overallScore": 2.371875195984352, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:29:37.383	2025-11-11 08:29:42.375	\N	ollama	1	1	2025-11-11 08:29:37.365	2025-11-11 08:29:42.377
cmhubc4wc0005bpkww7eqgc2w	cmhua43kv001dbpmodhx93bh8	COMPLETED	100	Processing companyRegistration documents	{"insights": ["??? Significant compliance gaps identified", "??? Multiple required documents missing or inadequate", "??? Not recommended for approval - revision required"], "overallScore": 2.315160673684019, "riskFindings": {"high": [], "medium": []}, "riskAssessment": {"documentQuality": "LOW", "complianceHistory": "NO_ISSUES", "financialStability": "ACCEPTABLE", "companyVerification": "VERIFIED", "documentCompleteness": "HIGH"}, "complianceCheck": {"complianceScore": 21.31516067368402, "missingDocuments": ["bbbeeAccreditation", "taxClearance", "bankConfirmation", "nda"], "claimedButMissing": [{"doc": "qualityCert", "certName": "Quality Management Certification"}, {"doc": "healthSafety", "certName": "Safety, Health and Environment (SHE) Certification"}], "optionalDocsCount": 0, "optionalDocuments": [], "providedDocuments": 1, "requiredDocuments": 5, "averageDocumentQuality": 93.1516067368402, "totalDocumentsAnalyzed": 1}, "documentAnalysis": {"companyRegistration": [{"aiMode": "ollama", "status": "analyzed", "fileName": "1762848015555-BankConfirmationLetter.pdf", "findings": "Analysis attempted but encountered error: [Errno 111] Connection refused", "riskLevel": "To be determined", "confidence": 93.1516067368402, "extractedData": {}, "complianceStatus": "Manual review required", "documentTypeMismatch": false}]}}	{"???? Starting AI document analysis...","[10:32:17 AM] ???? Checking AI backend status...","[10:32:17 AM] ??? Using Ollama (Local LLM) - Full AI analysis enabled","[10:32:17 AM]    Model: llama3.1","[10:32:17 AM] ???? Found 1 version(s) of documents","[10:32:17 AM] ???? Analyzing latest version (v1)...","[10:32:17 AM] ???? Total documents to process: 1","[10:32:17 AM] \n???? Processing category: company Registration","[10:32:17 AM]   ??? Analyzing: 1762848015555-BankConfirmationLetter.pdf...","[10:32:17 AM]   ???? Fetching document from storage...","[10:32:17 AM]   ???? Running AI analysis...","[10:32:20 AM]   ??? ???? [Ollama] Completed: 1762848015555-BankConfirmationLetter.pdf - Confidence: 93.2% (1/1)","[10:32:20 AM] \n???? Performing compliance verification...","[10:32:20 AM] ???? Mandatory documents: 5 required","[10:32:20 AM] ???? Optional documents provided: 0/12","[10:32:20 AM] \n??????  MISSING MANDATORY DOCUMENTS (4/5):","[10:32:20 AM]    ??? B-BBEE Certificate - Required to validate: Status Level (Level 1), Black ownership %, Expiry date","[10:32:20 AM]    ??? Tax Clearance Certificate OR Letter of Good Standing - Required to validate: Taxpayer name, Purpose \\"Good Standing\\", Age < 3 months (Either one is acceptable)","[10:32:20 AM]    ??? Bank Confirmation Letter - Required to validate: Bank (FNB), Account # (62389745698), Branch (Kyalami)","[10:32:20 AM]    ??? Non-Disclosure Agreement (NDA) - Must be signed and initialed on all pages","[10:32:20 AM] \n??????  CLAIMED CERTIFICATIONS NOT UPLOADED (2):","[10:32:20 AM]    ??? Quality Management Certification - Supplier indicated they have this but did not upload certificate","[10:32:20 AM]    ??? Safety, Health and Environment (SHE) Certification - Supplier indicated they have this but did not upload certificate","[10:32:20 AM] ??????  Missing required documents: bbbeeAccreditation, taxClearance, bankConfirmation, nda","[10:32:20 AM] ???? Average document quality: 93.2%","[10:32:20 AM] \n??? Calculating risk assessment...","[10:32:20 AM] ???? Document Completeness Risk: HIGH","[10:32:20 AM]    ??????  2 claimed certification(s) not uploaded","[10:32:20 AM] ???? Document Quality Risk: LOW","[10:32:20 AM] \n???? Base Score: 21.3/100","[10:32:20 AM] ???? Risk Penalty: -15.0 points","[10:32:20 AM] ???? Claimed Missing Penalty: -4.0 points","[10:32:20 AM] ???? Overall Supplier Score: 2.3/100","[10:32:20 AM] ??? Analysis complete!","[10:32:20 AM] \n???? Key Insights:","[10:32:20 AM]    ??? Significant compliance gaps identified","[10:32:20 AM]    ??? Multiple required documents missing or inadequate","[10:32:20 AM]    ??? Not recommended for approval - revision required","\n??? Analysis completed successfully! Overall score: 2.3%"}	{"aiMode": "ollama", "overallScore": 2.315160673684019, "totalDocuments": 1, "processedDocuments": 1}	\N	\N	2025-11-11 08:32:17.114	2025-11-11 08:32:20.387	\N	ollama	1	1	2025-11-11 08:32:17.1	2025-11-11 08:32:20.39
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", "userName", action, "entityType", "entityId", changes, metadata, "ipAddress", "userAgent", "timestamp") FROM stdin;
cmg7xjuqn000abplkukm1fa0x	cmg7xjska0002bplkanw3yu83	avashna002	CREATE	SupplierOnboarding	cmg7xjtiu0006bplkzcd82jwy	{}	{"businessType": "pty-ltd", "contactEmail": "avashna002@gmail.com", "supplierCode": "SUP-1759319742151"}	\N	\N	2025-10-01 11:55:44.351
\.


--
-- Data for Name: contract_amendments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_amendments (id, "contractId", "amendmentNumber", description, "effectiveDate", "changesSummary", "createdAt") FROM stdin;
\.


--
-- Data for Name: contract_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_approvals (id, "contractId", "approverId", status, comments, "requestedAt", "respondedAt") FROM stdin;
\.


--
-- Data for Name: contract_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_documents (id, "contractId", "documentName", "fileName", "filePath", "fileSize", "mimeType", version, "uploadedAt") FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, "contractNumber", "supplierId", "contractName", "contractType", description, "totalValue", currency, "paymentTerms", "deliveryTerms", "startDate", "endDate", "renewalDate", "autoRenewal", "renewalNoticeDays", status, "daysUntilExpiry", "isExpiringSoon", "renewalReminderSent", "renewalReminderSentAt", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deliveries (id, "deliveryNumber", "purchaseOrderId", "supplierId", "expectedDeliveryDate", "actualDeliveryDate", "deliveryStatus", "orderPlacedDate", "leadTimeDays", "expectedLeadTimeDays", "onTime", "delayDays", "deliveryAddress", "deliveryContact", "deliveryNotes", "issuesReported", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: document_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_verifications (id, "supplierId", version, category, "fileName", "isVerified", "verifiedAt", "verifiedBy", "verificationNotes", "createdAt", "updatedAt") FROM stdin;
cmh4r4z3c0000bph8830hvzdn	cmh4qn1op000lbpbkvnma7mv3	1	bankConfirmation	1761303673424-BankConfirmationLetter.pdf	t	2025-10-24 11:12:36.263	cmg7xjska0002bplkanw3yu83	\N	2025-10-24 11:12:36.264	2025-10-24 11:12:36.264
cmh4r9nb10001bph8q0xjw6dl	cmh4qn1op000lbpbkvnma7mv3	1	nda	1761303673427-standard-nda.pdf	t	2025-10-24 11:16:16.111	cmg7xjska0002bplkanw3yu83	\N	2025-10-24 11:16:14.27	2025-10-24 11:16:16.113
cmh4r9pov0002bph8d5h2ay1m	cmh4qn1op000lbpbkvnma7mv3	1	companyRegistration	1761303673422-Company_Reg_Docs.pdf	t	2025-10-24 11:16:17.358	cmg7xjska0002bplkanw3yu83	\N	2025-10-24 11:16:17.359	2025-10-24 11:16:17.359
cmhswtacw000kbp5wdn2e5xvs	cmhswgjtp0007bp5w61x9ivg3	1	bankConfirmation	1762764604233-BankConfirmationLetter.pdf	t	2025-11-10 08:57:56.912	cmg7xjska0002bplkanw3yu83	\N	2025-11-10 08:57:56.913	2025-11-10 08:57:56.913
cmhswtj3b000lbp5wtyq8a81j	cmhswgjtp0007bp5w61x9ivg3	1	companyRegistration	1762764604229-Company_Reg_Docs.pdf	t	2025-11-10 08:58:08.23	cmg7xjska0002bplkanw3yu83	\N	2025-11-10 08:58:08.231	2025-11-10 08:58:08.231
cmhswtpin000mbp5wm78r7egv	cmhswgjtp0007bp5w61x9ivg3	4	nda	1762765042547-standard-nda.pdf	t	2025-11-10 08:58:16.559	cmg7xjska0002bplkanw3yu83	\N	2025-11-10 08:58:16.56	2025-11-10 08:58:16.56
cmhswtqb4000nbp5wxvsw5f6d	cmhswgjtp0007bp5w61x9ivg3	4	taxClearance	1762765042544-Good_Standing_Tax.pdf	t	2025-11-10 08:58:17.584	cmg7xjska0002bplkanw3yu83	\N	2025-11-10 08:58:17.585	2025-11-10 08:58:17.585
cmhswtr4f000obp5w0o5eqlkm	cmhswgjtp0007bp5w61x9ivg3	4	bbbeeAccreditation	1762765042541-BEE_Certificate.pdf	t	2025-11-10 08:58:18.638	cmg7xjska0002bplkanw3yu83	\N	2025-11-10 08:58:18.639	2025-11-10 08:58:18.639
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_logs (id, "sentById", "recipientEmail", "recipientName", subject, content, "emailType", "referenceType", "referenceId", status, "messageId", "errorMessage", "sentAt", "deliveredAt", "openedAt", "clickedAt", "bouncedAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_reminders (id, "onboardingId", "recipientEmail", "reminderType", "scheduledFor", sent, "sentAt", attempts, "lastAttemptAt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "invoiceNumber", "purchaseOrderId", "supplierId", "invoiceDate", "dueDate", amount, currency, "taxAmount", "totalAmount", status, "paidDate", "paidAmount", "paymentReference", "documentPath", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: manager_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manager_approvals (id, "initiationId", "approverId", status, comments, "approvedAt", "createdAt", "updatedAt") FROM stdin;
cmh4qmq23000hbpbkzn60qzn1	cmh4qmq1r000fbpbkytllrxrc	cmh4p3jli0000bpw8v1qw0paz	APPROVED		2025-10-24 10:58:36.427	2025-10-24 10:58:24.747	2025-10-24 10:58:36.428
cmhswb5it0003bp5w7feb4a08	cmhswb5hu0001bp5wk08z38kz	cmh4p3jli0000bpw8v1qw0paz	APPROVED		2025-11-10 08:47:33.807	2025-11-10 08:43:50.837	2025-11-10 08:47:33.809
cmhua3i650019bpmou8hi5fe2	cmhua3i5h0017bpmofqkrt79m	cmh4p3jli0000bpw8v1qw0paz	APPROVED		2025-11-11 07:57:59.702	2025-11-11 07:57:34.781	2025-11-11 07:57:59.703
cmhubq5f0000jbpkwkj0vawf9	cmhubq5ec000hbpkw1b9xuqsx	cmh4p3jli0000bpw8v1qw0paz	APPROVED		2025-11-11 08:51:55.235	2025-11-11 08:43:10.956	2025-11-11 08:51:55.237
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", type, title, message, "referenceType", "referenceId", "actionUrl", "isRead", "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: onboarding_timeline; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_timeline (id, "onboardingId", step, status, action, description, "performedBy", metadata, "timestamp") FROM stdin;
cmh4qqc80000pbpbkqjysz5iz	cmh4qn1ou000nbpbk868yr76v	PENDING_SUPPLIER_RESPONSE	DOCUMENTS_RECEIVED	Supplier form submitted	The Innoverse submitted onboarding form with 3 document categories	Avashna Govender	{"source": "custom-form", "totalFiles": 3, "documentsCategories": ["companyRegistration", "bankConfirmation", "nda"]}	2025-10-24 11:01:13.441
cmh4rh91y0004bph84zg8fssn	cmh4qn1ou000nbpbk868yr76v	REVIEW	REVISION_NEEDED	Revision requested	Revision requested: Dear Avashna Govender,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Tax Clearance Certificate OR Letter of Good Standing\n2. B-BBEE Certificate\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	Admin	\N	2025-10-24 11:22:09.046
cmh4rijs50006bph8og508zku	cmh4qn1ou000nbpbk868yr76v	PENDING_SUPPLIER_RESPONSE	DOCUMENTS_RECEIVED	Supplier form submitted	The Innoverse submitted onboarding form with 2 document categories	Avashna Govender	{"source": "custom-form", "totalFiles": 2, "documentsCategories": ["bbbeeAccreditation", "goodStanding"]}	2025-10-24 11:23:09.605
cmh4ttob60001bp1ozl2nry2o	cmh4qn1ou000nbpbk868yr76v	REVIEW	APPROVED	Status updated to APPROVED	Supplier status changed to APPROVED	Admin	\N	2025-10-24 12:27:47.921
cmhswj5nn000bbp5w7tpa973o	cmhswgju00009bp5wetxw35a2	PENDING_SUPPLIER_RESPONSE	DOCUMENTS_RECEIVED	Supplier form submitted	Test Company submitted onboarding form with 2 document categories	Avashna Govender	{"source": "custom-form", "totalFiles": 2, "documentsCategories": ["companyRegistration", "bankConfirmation"]}	2025-11-10 08:50:04.259
cmhswlgt0000dbp5w8j5qsk2e	cmhswgju00009bp5wetxw35a2	REVIEW	REVISION_NEEDED	Revision requested	Revision requested: Dear Avashna Govender,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Non-Disclosure Agreement (NDA)\n2. Tax Clearance Certificate OR Letter of Good Standing\n3. B-BBEE Certificate\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	Admin	\N	2025-11-10 08:51:52.02
cmhswmjv9000fbp5w4qc7ruek	cmhswgju00009bp5wetxw35a2	REVIEW	REVISION_NEEDED	Revision requested	Revision requested: Dear Avashna Govender,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Non-Disclosure Agreement (NDA)\n2. Tax Clearance Certificate OR Letter of Good Standing\n3. B-BBEE Certificate\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	Admin	\N	2025-11-10 08:52:42.645
cmhswr68n000hbp5wv81dswai	cmhswgju00009bp5wetxw35a2	REVIEW	REVISION_NEEDED	Revision requested	Revision requested: Dear Avashna Govender,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Non-Disclosure Agreement (NDA)\n2. Tax Clearance Certificate OR Letter of Good Standing\n3. B-BBEE Certificate\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	Admin	\N	2025-11-10 08:56:18.264
cmhswsjus000jbp5w2m2jf1dh	cmhswgju00009bp5wetxw35a2	PENDING_SUPPLIER_RESPONSE	DOCUMENTS_RECEIVED	Supplier form submitted	Test Company submitted onboarding form with 3 document categories	Avashna Govender	{"source": "custom-form", "totalFiles": 3, "documentsCategories": ["bbbeeAccreditation", "taxClearance", "nda"]}	2025-11-10 08:57:22.565
cmhswv3q9000qbp5w5kkq1koo	cmhswgju00009bp5wetxw35a2	REVIEW	APPROVED	Status updated to APPROVED	Supplier status changed to APPROVED	Admin	\N	2025-11-10 08:59:21.634
cmhua6y8r001hbpmoh6o4ojun	cmhua43l5001fbpmo2f44wfjk	PENDING_SUPPLIER_RESPONSE	DOCUMENTS_RECEIVED	Supplier form submitted	KGM Solutions submitted onboarding form with 1 document categories	Kyle Collin Gounden	{"source": "custom-form", "totalFiles": 1, "documentsCategories": ["companyRegistration"]}	2025-11-11 08:00:15.579
cmhubit9r000bbpkw6irm4pjy	cmhua43l5001fbpmo2f44wfjk	REVIEW	REVISION_NEEDED	Revision requested	Revision requested: Dear Kyle Collin Gounden,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Non-Disclosure Agreement (NDA)\n2. Tax Clearance Certificate OR Letter of Good Standing\n3. Bank Confirmation Letter\n4. B-BBEE Certificate\n5. Incorrect Company Reg\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	Admin	\N	2025-11-11 08:37:28.623
cmhubmf4q000dbpkwmpf47bn1	cmhua43l5001fbpmo2f44wfjk	PENDING_SUPPLIER_RESPONSE	DOCUMENTS_RECEIVED	Supplier form submitted	KGM Solutions submitted onboarding form with 3 document categories	Kyle Collin Gounden	{"source": "custom-form", "totalFiles": 3, "documentsCategories": ["companyRegistration", "bbbeeAccreditation", "bankConfirmation"]}	2025-11-11 08:40:16.922
\.


--
-- Data for Name: po_line_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.po_line_items (id, "purchaseOrderId", "lineNumber", "itemDescription", "itemCode", quantity, "unitOfMeasure", "unitPrice", "totalPrice", "deliveredQuantity", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: procurement_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.procurement_approvals (id, "initiationId", "approverId", status, comments, "approvedAt", "createdAt", "updatedAt") FROM stdin;
cmhswb5j30005bp5wphdqg5vj	cmhswb5hu0001bp5wk08z38kz	cmg7u862x0001bp4szw91448h	APPROVED		2025-11-10 08:48:02.634	2025-11-10 08:43:50.848	2025-11-10 08:48:02.636
cmhua3i6e001bbpmorw4aqepi	cmhua3i5h0017bpmofqkrt79m	cmg7u862x0001bp4szw91448h	APPROVED		2025-11-11 07:58:02.508	2025-11-11 07:57:34.789	2025-11-11 07:58:02.509
cmhubq5fi000lbpkwl0swqgln	cmhubq5ec000hbpkw1b9xuqsx	cmg7u862x0001bp4szw91448h	REJECTED	insufficient details	2025-11-11 08:53:22.516	2025-11-11 08:43:10.975	2025-11-11 08:53:22.517
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, "poNumber", "requisitionId", "supplierId", title, description, "totalAmount", currency, "paymentTerms", "deliveryTerms", status, "orderDate", "expectedDeliveryDate", "actualDeliveryDate", "supplierAcknowledged", "supplierAcknowledgedAt", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reminder_configurations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reminder_configurations (id, "reminderType", "isEnabled", "emailSubjectTemplate", "emailBodyTemplate", "createdAt", "updatedAt", "finalReminderAfterHours", "firstReminderAfterHours", "secondReminderAfterHours") FROM stdin;
cmh4sdx5w0000bplc39rnzh5r	SUPPLIER_DOCUMENT_SUBMISSION	t	Reminder: Complete Your Supplier Onboarding Documentation	Dear {supplierName},\n\nThis is a reminder to complete your supplier onboarding documentation for Schauenburg Systems.\n\nWe sent you the onboarding invitation {daysAgo} days ago, but we haven't received your documentation yet.\n\nTo complete your registration, please click the link below:\n{onboardingLink}\n\nRequired documents include:\n- Company Registration (CIPC Documents)\n- B-BBEE Certificate\n- Tax Clearance or Letter of Good Standing\n- Bank Confirmation Letter\n- Signed NDA\n\nIf you need assistance or have questions, please don't hesitate to contact our procurement team.\n\nBest regards,\nSchauenburg Systems Procurement Team	2025-10-24 11:47:33.283	2025-10-24 11:47:33.283	14	3	7
cmh4sdx670001bplcd8uumc5w	MANAGER_APPROVAL_PENDING	t	Reminder: Supplier Initiation Awaiting Your Approval	Dear {managerName},\n\nA supplier initiation request is awaiting your approval.\n\n<strong>Supplier Details:</strong>\n- <strong>Supplier Name:</strong> {supplierName}\n- <strong>Requested By:</strong> {requesterName}\n- <strong>Category:</strong> {category}\n- <strong>Submitted:</strong> {submittedDate}\n\nThis request has been pending for {daysAgo} days. Please review and approve/reject at your earliest convenience.\n\n{approvalsLink}\n\nBest regards,\nProcurement System	2025-10-24 11:47:33.296	2025-10-24 11:47:33.296	14	3	7
cmh4sdx6a0002bplcgk6x8chr	PROCUREMENT_APPROVAL_PENDING	t	Reminder: Supplier Initiation Awaiting Procurement Approval	Dear {procurementManagerName},\n\nA supplier initiation request is awaiting your procurement approval.\n\n<strong>Supplier Details:</strong>\n- <strong>Supplier Name:</strong> {supplierName}\n- <strong>Requested By:</strong> {requesterName}\n- <strong>Category:</strong> {category}\n- <strong>Submitted:</strong> {submittedDate}\n- <strong>Manager Status:</strong> {managerStatus}\n\nThis request has been pending for {daysAgo} days. Please review and approve/reject at your earliest convenience.\n\n{approvalsLink}\n\nBest regards,\nProcurement System	2025-10-24 11:47:33.298	2025-10-24 11:47:33.298	14	3	7
cmh4sdx6b0003bplcp8mdm0fq	BUYER_REVIEW_PENDING	t	Reminder: Supplier Documents Awaiting Your Review	Dear {buyerName},\n\nA supplier has submitted their onboarding documents and they are awaiting your review.\n\n<strong>Supplier Details:</strong>\n- <strong>Supplier Name:</strong> {supplierName}\n- <strong>Submitted:</strong> {submittedDate}\n- <strong>Days Pending:</strong> {daysAgo}\n\nPlease review the documents and approve, reject, or request revisions.\n\n{reviewLink}\n\nBest regards,\nProcurement System	2025-10-24 11:47:33.3	2025-10-24 11:47:33.3	14	3	7
cmh4sdx6f0004bplcp8po2ljv	SUPPLIER_REVISION_PENDING	t	Reminder: Please Resubmit Your Revised Documents	Dear {supplierName},\n\nWe requested revisions to your supplier onboarding documentation {daysAgo} days ago.\n\n<strong>Revision Requested:</strong> {revisionDate}\n<strong>Revision Notes:</strong>\n{revisionNotes}\n\nPlease resubmit your documents with the requested changes using the link below:\n{onboardingLink}\n\nIf you have questions about the requested revisions, please contact our procurement team.\n\nBest regards,\nSchauenburg Systems Procurement Team	2025-10-24 11:47:33.303	2025-10-24 11:47:33.303	14	3	7
\.


--
-- Data for Name: reminder_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reminder_logs (id, "reminderType", "referenceId", "referenceType", "recipientEmail", "recipientName", "reminderCount", subject, content, status, "sentAt", "errorMessage", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: requisition_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requisition_approvals (id, "requisitionId", "approvalLevel", "approverId", status, decision, comments, "requestedAt", "respondedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: requisition_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requisition_attachments (id, "requisitionId", "fileName", "filePath", "fileSize", "mimeType", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: requisition_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requisition_comments (id, "requisitionId", "userId", comment, "isInternal", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: requisition_line_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requisition_line_items (id, "requisitionId", "lineNumber", "itemDescription", "itemCode", quantity, "unitOfMeasure", "unitPrice", "totalPrice", "suggestedSupplier", specifications, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: requisitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.requisitions (id, "requisitionNumber", "requestedById", department, priority, title, description, justification, "budgetCode", "estimatedTotalAmount", currency, status, "currentApprovalLevel", "requiredByDate", "submittedAt", "approvedAt", "rejectedAt", "completedAt", "processStartedAt", "processEndedAt", "totalProcessingTimeHours", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: session_resumptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_resumptions (id, "userId", "moduleType", "processId", "processStep", "processData", "lastAccessedAt", "expiresAt", "isCompleted", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: supplier_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_documents (id, "onboardingId", "documentType", "documentName", "fileName", "fileSize", "filePath", "mimeType", "isRequired", "isVerified", "verifiedAt", "verifiedBy", "verificationNotes", "uploadedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: supplier_evaluations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_evaluations (id, "supplierId", "evaluationPeriod", "evaluationDate", "qualityScore", "deliveryScore", "priceScore", "serviceScore", "complianceScore", "overallScore", "onTimeDeliveryRate", "defectRate", "responseTime", "performanceRating", strengths, "areasForImprovement", recommendations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: supplier_initiations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_initiations (id, "businessUnit", "processReadUnderstood", "dueDiligenceCompleted", "supplierName", "productServiceCategory", "requesterName", "relationshipDeclaration", "regularPurchase", "annualPurchaseValue", "creditApplication", "creditApplicationReason", "onceOffPurchase", "onboardingReason", status, "submittedAt", "emailSent", "emailSentAt", "initiatedById", "createdAt", "updatedAt", "supplierEmail", "supplierContactPerson") FROM stdin;
cmh4qmq1r000fbpbkytllrxrc	SCHAUENBURG_PTY_LTD_300	t	t	The Innoverse	AI Consulting	Avashna Govender	None	f	\N	f	Not required	t	Agentic AI	SUPPLIER_EMAILED	2025-10-24 10:58:24.735	t	2025-10-24 10:58:40.269	cmg7xjska0002bplkanw3yu83	2025-10-24 10:58:24.735	2025-10-24 10:58:40.271	avashna002@gmail.com	Avashna Govender
cmhswb5hu0001bp5wk08z38kz	SCHAUENBURG_SYSTEMS_200	t	t	Test Company	AI Consulting	Avashna Govender	None	f	\N	f	Not needed	t	Require AI Consulting Services	SUPPLIER_EMAILED	2025-11-10 08:43:50.744	t	2025-11-10 08:48:03.319	cmg7xjska0002bplkanw3yu83	2025-11-10 08:43:50.744	2025-11-10 08:48:03.321	avashna002@gmail.com	Avashna Govender
cmhua3i5h0017bpmofqkrt79m	SCHAUENBURG_SYSTEMS_200	t	t	KGM Solutions	AI Consulting	Avashna	None	f	\N	f	None	t	services required	SUPPLIER_EMAILED	2025-11-11 07:57:34.753	t	2025-11-11 07:58:03.126	cmg7xjska0002bplkanw3yu83	2025-11-11 07:57:34.753	2025-11-11 07:58:03.127	avashna002@gmail.com	Kyle Gounden
cmhubq5ec000hbpkw1b9xuqsx	SCHAUENBURG_SYSTEMS_200	t	t	Test Company	AI Consulting	Avashna Govender	None	f	\N	f	None	t	AI	REJECTED	2025-11-11 08:43:10.93	f	\N	cmg7xjska0002bplkanw3yu83	2025-11-11 08:43:10.93	2025-11-11 08:53:22.524	avashna002@gmail.com	Avashna Govender
\.


--
-- Data for Name: supplier_onboardings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_onboardings (id, "supplierId", "currentStep", "overallStatus", "contactName", "contactEmail", "businessType", sector, "emailSent", "emailSentAt", "emailSubject", "emailContent", "emailMessageId", "supplierFormSubmitted", "supplierFormSubmittedAt", "supplierResponseData", "documentsUploaded", "documentsUploadedAt", "requiredDocuments", "reviewStartedAt", "reviewCompletedAt", "reviewNotes", "reviewedById", "revisionCount", "revisionRequested", "revisionNotes", "revisionRequestedAt", "approvalStatus", "approvedAt", "rejectedAt", "rejectionReason", "completedAt", "processStartedAt", "processEndedAt", "totalProcessingTimeHours", "initiatedById", "createdAt", "updatedAt", "onboardingToken", "initiationId") FROM stdin;
cmhswgju00009bp5wetxw35a2	cmhswgjtp0007bp5w61x9ivg3	REVIEW	DOCUMENTS_RECEIVED	Test Company	avashna002@gmail.com	OTHER	AI Consulting	f	\N	\N	\N	\N	t	2025-11-10 08:57:22.557	{"rpSHE": "Avashna Govender", "field39": "", "rpBBBEE": "Avashna Govender", "bankName": "FNB", "rpBanking": "Avashna Govender", "rpQuality": "Avashna Govender", "branchName": "Kyalami", "rpSHEEmail": "avashna002@gmail.com", "rpSHEPhone": "0784588458", "bbbeeStatus": "Level 1", "tradingName": "The Innoverse", "branchNumber": "250655", "emailAddress": "avashna002@gmail.com", "rpBBBEEEmail": "avashna002@gmail.com", "rpBBBEEPhone": "0784588458", "supplierName": "Test Company", "accountNumber": "62530889536", "contactNumber": "0784588458", "contactPerson": "Avashna Govender", "postalAddress": "305 The Woods", "typeOfAccount": "Business", "uploadedFiles": {"nda": ["1762765042547-standard-nda.pdf"], "taxClearance": ["1762765042544-Good_Standing_Tax.pdf"], "bbbeeAccreditation": ["1762765042541-BEE_Certificate.pdf"]}, "nameOfBusiness": "Test Company", "rpBankingEmail": "avashna002@gmail.com", "rpBankingPhone": "0784588458", "rpQualityEmail": "avashna002@gmail.com", "rpQualityPhone": "0784588458", "bankAccountName": "Tech Hub Innoverse", "physicalAddress": "7 Colt Street", "natureOfBusiness": "AI Consulting", "sheCertification": true, "associatedCompany": "", "numberOfEmployees": "5", "productsAndServices": "AI Consulting", "companyRegistrationNo": "2024/08/809", "qualityManagementCert": true, "authorizationAgreement": true, "branchesContactNumbers": "", "associatedCompanyBranchName": "", "associatedCompanyRegistrationNo": ""}	t	2025-11-10 08:57:22.557	\N	\N	\N	\N	\N	3	t	Dear Avashna Govender,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Non-Disclosure Agreement (NDA)\n2. Tax Clearance Certificate OR Letter of Good Standing\n3. B-BBEE Certificate\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	2025-11-10 08:56:18.254	APPROVED	2025-11-10 08:59:21.626	\N	\N	2025-11-10 08:59:21.626	2025-11-10 08:48:02.665	\N	\N	cmg7xjska0002bplkanw3yu83	2025-11-10 08:48:02.665	2025-11-10 08:59:21.629	init_cmhswb5hu0001bp5wk08z38kz_1762764482679	cmhswb5hu0001bp5wk08z38kz
cmhua43l5001fbpmo2f44wfjk	cmhua43kv001dbpmodhx93bh8	REVIEW	DOCUMENTS_RECEIVED	KGM Solutions	avashna002@gmail.com	OTHER	AI Consulting	f	\N	\N	\N	\N	t	2025-11-11 08:40:16.915	{"rpSHE": "Avashna Govender", "field39": "", "rpBBBEE": "Avashna Govender", "bankName": "FNB", "rpBanking": "Avashna Govender", "rpQuality": "Avashna Govender", "branchName": "Kyalami", "rpSHEEmail": "avashna002@gmail.com", "rpSHEPhone": "0784588458", "bbbeeStatus": "Level 1", "tradingName": "KGM Omni Solutions", "branchNumber": "250655", "emailAddress": "avashna002@gmail.com", "rpBBBEEEmail": "avashna002@gmail.com", "rpBBBEEPhone": "0784588458", "supplierName": "KGM Solutions", "accountNumber": "62389745698", "contactNumber": "0784588458", "contactPerson": "Kyle Collin Gounden", "postalAddress": "305 The Woods", "typeOfAccount": "Business", "uploadedFiles": {"bankConfirmation": ["1762850416903-BankConfirmationLetter.pdf"], "bbbeeAccreditation": ["1762850416899-BEE_Certificate.pdf"], "companyRegistration": ["1762850416895-BEE_Certificate.pdf"]}, "nameOfBusiness": "KGM Solutions", "rpBankingEmail": "avashna002@gmail.com", "rpBankingPhone": "0784588458", "rpQualityEmail": "avashna002@gmail.com", "rpQualityPhone": "0784588458", "bankAccountName": "KGM Omni Solutions", "physicalAddress": "7 Colt Street", "natureOfBusiness": "University", "sheCertification": true, "associatedCompany": "", "numberOfEmployees": "5", "productsAndServices": "AI", "companyRegistrationNo": "2024/08/963", "qualityManagementCert": true, "authorizationAgreement": true, "branchesContactNumbers": "", "associatedCompanyBranchName": "", "associatedCompanyRegistrationNo": ""}	t	2025-11-11 08:40:16.915	\N	\N	\N	\N	\N	1	t	Dear Kyle Collin Gounden,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Non-Disclosure Agreement (NDA)\n2. Tax Clearance Certificate OR Letter of Good Standing\n3. Bank Confirmation Letter\n4. B-BBEE Certificate\n5. Incorrect Company Reg\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	2025-11-11 08:37:28.614	\N	\N	\N	\N	\N	2025-11-11 07:58:02.534	\N	\N	cmg7xjska0002bplkanw3yu83	2025-11-11 07:58:02.534	2025-11-11 08:40:16.917	init_cmhua3i5h0017bpmofqkrt79m_1762847882544	cmhua3i5h0017bpmofqkrt79m
cmh4qn1ou000nbpbk868yr76v	cmh4qn1op000lbpbkvnma7mv3	REVIEW	DOCUMENTS_RECEIVED	The Innoverse	avashna002@gmail.com	OTHER	AI Consulting	f	\N	\N	\N	\N	t	2025-10-24 11:23:09.597	{"rpSHE": "Avashna Govender", "field39": "", "rpBBBEE": "Avashna Govender", "bankName": "FNB", "rpBanking": "Avashna Govender", "rpQuality": "Avashna Govender", "branchName": "Kyalami", "rpSHEEmail": "avashna002@gmail.com", "rpSHEPhone": "0784588458", "bbbeeStatus": "Level 1", "tradingName": "The Innoverse", "branchNumber": "250655", "emailAddress": "avashna002@gmail.com", "rpBBBEEEmail": "avashna002@gmail.com", "rpBBBEEPhone": "0784588458", "supplierName": "Tech Hub Innoverse", "accountNumber": "62530889536", "contactNumber": "0784588458", "contactPerson": "Avashna Govender", "postalAddress": "7 Colt Street, 305 The Woods, Kyalami, 1689", "typeOfAccount": "Business", "uploadedFiles": {"goodStanding": ["1761304989587-Good_Standing_Tax.pdf"], "bbbeeAccreditation": ["1761304989583-BEE_Certificate.pdf"]}, "nameOfBusiness": "The Innoverse", "rpBankingEmail": "avashna002@gmail.com", "rpBankingPhone": "0784588458", "rpQualityEmail": "avashna002@gmail.com", "rpQualityPhone": "0784588458", "bankAccountName": "Tech Hub Innoverse", "physicalAddress": "7 Colt Street, 305 The Woods, Kyalami, 1689", "natureOfBusiness": "AI Consulting", "sheCertification": false, "associatedCompany": "", "numberOfEmployees": "5", "productsAndServices": "AI Consulting", "companyRegistrationNo": "2024/07/08", "qualityManagementCert": false, "authorizationAgreement": true, "branchesContactNumbers": "", "associatedCompanyBranchName": "", "associatedCompanyRegistrationNo": ""}	t	2025-10-24 11:23:09.597	\N	\N	\N	\N	\N	1	t	Dear Avashna Govender,\n\nWe have reviewed your submission and found that the following compulsory documents are missing:\n\n1. Tax Clearance Certificate OR Letter of Good Standing\n2. B-BBEE Certificate\n\nPlease upload these mandatory documents to complete your supplier onboarding application. All documents should be:\n- Clear and legible\n- Current and valid (not expired)\n- In PDF format where possible\n\nYou can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.\n\nIf you have any questions or need clarification, please don't hesitate to contact us.\n\nBest regards,\nProcurement Team	2025-10-24 11:22:09.038	APPROVED	2025-10-24 12:27:47.912	\N	\N	2025-10-24 12:27:47.912	2025-10-24 10:58:39.822	\N	\N	cmg7xjska0002bplkanw3yu83	2025-10-24 10:58:39.822	2025-10-24 12:27:47.914	init_cmh4qmq1r000fbpbkytllrxrc_1761303519828	cmh4qmq1r000fbpbkytllrxrc
\.


--
-- Data for Name: supplier_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_reviews (id, "supplierId", "reviewedById", rating, comment, "createdAt") FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, "supplierCode", "companyName", "contactPerson", "contactEmail", "contactPhone", "businessType", sector, "registrationNumber", "vatNumber", "taxClearance", "bbbeeLevel", "physicalAddress", city, province, "postalCode", country, status, "isActive", "approvedAt", "createdById", "createdAt", "updatedAt", "accountNumber", "airtableData", "airtableRecordId", "associatedCompany", "associatedCompanyBranchName", "associatedCompanyRegNo", "authorizationAgreement", "bankAccountName", "bankName", "branchName", "branchNumber", "branchesContactNumbers", field39, "natureOfBusiness", "numberOfEmployees", "postalAddress", "productsAndServices", "qualityManagementCert", "rpBBBEE", "rpBBBEEEmail", "rpBBBEEPhone", "rpBanking", "rpBankingEmail", "rpBankingPhone", "rpQuality", "rpQualityEmail", "rpQualityPhone", "rpSHE", "rpSHEEmail", "rpSHEPhone", "sheCertification", "supplierName", "tradingName", "typeOfAccount") FROM stdin;
cmh4qn1op000lbpbkvnma7mv3	SUP-1761303519816	The Innoverse	Avashna Govender	avashna002@gmail.com	0784588458	OTHER	AI Consulting	2024/07/08	\N	\N	Level 1	7 Colt Street, 305 The Woods, Kyalami, 1689	\N	\N	\N	South Africa	APPROVED	t	2025-10-24 12:27:47.658	cmg7xjska0002bplkanw3yu83	2025-10-24 10:58:39.817	2025-10-24 12:27:47.666	62530889536	{"source": "custom-form", "version": 2, "allVersions": [{"date": "2025-10-24T11:01:13.430Z", "version": 1, "uploadedFiles": {"nda": ["1761303673427-standard-nda.pdf"], "bankConfirmation": ["1761303673424-BankConfirmationLetter.pdf"], "companyRegistration": ["1761303673422-Company_Reg_Docs.pdf"]}}, {"date": "2025-10-24T11:23:09.589Z", "version": 2, "uploadedFiles": {"goodStanding": ["1761304989587-Good_Standing_Tax.pdf"], "bbbeeAccreditation": ["1761304989583-BEE_Certificate.pdf"]}}], "uploadedFiles": {"goodStanding": ["1761304989587-Good_Standing_Tax.pdf"], "bbbeeAccreditation": ["1761304989583-BEE_Certificate.pdf"]}, "submissionDate": "2025-10-24T11:23:09.589Z", "onboardingToken": "init_cmh4qmq1r000fbpbkytllrxrc_1761303519828"}	\N				t	Tech Hub Innoverse	FNB	Kyalami	250655			AI Consulting	5	7 Colt Street, 305 The Woods, Kyalami, 1689	AI Consulting	f	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	f	Tech Hub Innoverse	The Innoverse	Business
cmhua43kv001dbpmodhx93bh8	SUP-1762847882522	KGM Solutions	Kyle Collin Gounden	avashna002@gmail.com	0784588458	OTHER	University	2024/08/963	\N	\N	Level 1	7 Colt Street	\N	\N	\N	South Africa	UNDER_REVIEW	t	\N	cmg7xjska0002bplkanw3yu83	2025-11-11 07:58:02.524	2025-11-11 08:40:16.908	62389745698	{"source": "custom-form", "version": 2, "allVersions": [{"date": "2025-11-11T08:00:15.559Z", "version": 1, "uploadedFiles": {"companyRegistration": ["1762848015555-BankConfirmationLetter.pdf"]}}, {"date": "2025-11-11T08:40:16.905Z", "version": 2, "uploadedFiles": {"bankConfirmation": ["1762850416903-BankConfirmationLetter.pdf"], "bbbeeAccreditation": ["1762850416899-BEE_Certificate.pdf"], "companyRegistration": ["1762850416895-BEE_Certificate.pdf"]}}], "uploadedFiles": {"bankConfirmation": ["1762850416903-BankConfirmationLetter.pdf"], "bbbeeAccreditation": ["1762850416899-BEE_Certificate.pdf"], "companyRegistration": ["1762850416895-BEE_Certificate.pdf"]}, "submissionDate": "2025-11-11T08:40:16.905Z", "onboardingToken": "init_cmhua3i5h0017bpmofqkrt79m_1762847882544"}	\N				t	KGM Omni Solutions	FNB	Kyalami	250655			University	5	305 The Woods	AI	t	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	t	KGM Solutions	KGM Omni Solutions	Business
cmhswgjtp0007bp5w61x9ivg3	SUP-1762764482651	Test Company	Avashna Govender	avashna002@gmail.com	0784588458	OTHER	AI Consulting	2024/08/809	\N	\N	Level 1	7 Colt Street	\N	\N	\N	South Africa	APPROVED	t	2025-11-10 08:59:21.617	cmg7xjska0002bplkanw3yu83	2025-11-10 08:48:02.653	2025-11-10 09:12:32.525	62530889536	{"source": "custom-form", "version": 4, "allVersions": [{"date": "2025-11-10T08:50:04.237Z", "version": 1, "uploadedFiles": {"bankConfirmation": ["1762764604233-BankConfirmationLetter.pdf"], "companyRegistration": ["1762764604229-Company_Reg_Docs.pdf"]}}, {"date": "2025-11-10T08:57:22.549Z", "version": 4, "uploadedFiles": {"nda": ["1762765042547-standard-nda.pdf"], "taxClearance": ["1762765042544-Good_Standing_Tax.pdf"], "bbbeeAccreditation": ["1762765042541-BEE_Certificate.pdf"]}}], "uploadedFiles": {"nda": ["1762765042547-standard-nda.pdf"], "taxClearance": ["1762765042544-Good_Standing_Tax.pdf"], "bbbeeAccreditation": ["1762765042541-BEE_Certificate.pdf"]}, "submissionDate": "2025-11-10T08:57:22.549Z", "onboardingToken": "init_cmhswb5hu0001bp5wk08z38kz_1762764482679"}	\N				t	Tech Hub Innoverse	FNB	Kyalami	250655			AI Consulting	5	305 The Woods	AI Consulting	t	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	Avashna Govender	avashna002@gmail.com	0784588458	t	Test Company	The Innoverse	Business
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_config (id, key, value, description, category, "updatedAt", "createdAt") FROM stdin;
cmg7u8a9f0006bp4sz58wqvz7	REQUISITION_APPROVAL_THRESHOLD	50000	Amount threshold that requires additional approval	REQUISITIONS	2025-10-01 10:22:45.747	2025-10-01 10:22:45.747
cmg7u8c6e0007bp4stngzbs6h	CONTRACT_RENEWAL_NOTICE_DAYS	30	Days before contract expiry to send renewal notice	CONTRACTS	2025-10-01 10:22:48.23	2025-10-01 10:22:48.23
cmg7u8ddj0008bp4sytcodbq0	EMAIL_REMINDER_DAYS	3	Days before sending follow-up email reminder	EMAILS	2025-10-01 10:22:49.784	2025-10-01 10:22:49.784
cmg7u8eki0009bp4sfrmerb8l	SESSION_EXPIRY_HOURS	24	Hours before session resumption expires	SYSTEM	2025-10-01 10:22:51.331	2025-10-01 10:22:51.331
\.


--
-- Data for Name: user_delegations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_delegations (id, "delegatorId", "delegateId", "delegationType", "startDate", "endDate", "isActive", reason, notes, "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, password, role, department, "phoneNumber", "isActive", "lastLoginAt", "createdAt", "updatedAt", "managerId") FROM stdin;
cmh4p3jli0000bpw8v1qw0paz	agovender@theinnoverse.co.za	Test Manager	$2b$10$B7qa7wAm/1LblpW.QmL2EOr5gXaXZkgxqvt28ylZfHILD.0klYUlG	MANAGER	Operations	+27123456789	t	2025-11-11 08:51:36.473	2025-10-24 10:15:30.295	2025-11-11 08:51:36.475	\N
cmg7u862x0001bp4szw91448h	theinnoverse1212@gmail.com	Procurement Manager	$2b$10$B7qa7wAm/1LblpW.QmL2EOr5gXaXZkgxqvt28ylZfHILD.0klYUlG	PROCUREMENT_MANAGER	Procurement	+27 11 123 4568	t	2025-11-11 08:53:08.719	2025-10-01 10:22:40.33	2025-11-11 08:53:08.721	\N
cmg7xjska0002bplkanw3yu83	avashna002@gmail.com	Avashna	$2b$10$TAhXXf56tw0h1LscKTkpz.9nhjaIiiGrxG0aBhR16diqM1y61fnf.	ADMIN	Management	\N	t	2025-11-12 08:35:08.842	2025-10-01 11:55:41.531	2025-11-12 08:35:08.844	\N
\.


--
-- Data for Name: verification_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification_checks (id, "onboardingId", "checkType", "checkName", status, result, "verifiedBy", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-10-01 09:54:09
20211116045059	2025-10-01 09:54:09
20211116050929	2025-10-01 09:54:09
20211116051442	2025-10-01 09:54:09
20211116212300	2025-10-01 09:54:09
20211116213355	2025-10-01 09:54:09
20211116213934	2025-10-01 09:54:09
20211116214523	2025-10-01 09:54:10
20211122062447	2025-10-01 09:54:10
20211124070109	2025-10-01 09:54:10
20211202204204	2025-10-01 09:54:10
20211202204605	2025-10-01 09:54:10
20211210212804	2025-10-01 09:54:10
20211228014915	2025-10-01 09:54:10
20220107221237	2025-10-01 09:54:10
20220228202821	2025-10-01 09:54:10
20220312004840	2025-10-01 09:54:10
20220603231003	2025-10-01 09:54:10
20220603232444	2025-10-01 09:54:10
20220615214548	2025-10-01 09:54:10
20220712093339	2025-10-01 09:54:10
20220908172859	2025-10-01 09:54:11
20220916233421	2025-10-01 09:54:11
20230119133233	2025-10-01 09:54:11
20230128025114	2025-10-01 09:54:11
20230128025212	2025-10-01 09:54:11
20230227211149	2025-10-01 09:54:11
20230228184745	2025-10-01 09:54:11
20230308225145	2025-10-01 09:54:11
20230328144023	2025-10-01 09:54:11
20231018144023	2025-10-01 09:54:11
20231204144023	2025-10-01 09:54:11
20231204144024	2025-10-01 09:54:11
20231204144025	2025-10-01 09:54:11
20240108234812	2025-10-01 09:54:11
20240109165339	2025-10-01 09:54:11
20240227174441	2025-10-01 09:54:11
20240311171622	2025-10-01 09:54:11
20240321100241	2025-10-01 09:54:11
20240401105812	2025-10-01 09:54:11
20240418121054	2025-10-01 09:54:11
20240523004032	2025-10-01 09:54:11
20240618124746	2025-10-01 09:54:11
20240801235015	2025-10-01 09:54:11
20240805133720	2025-10-01 09:54:11
20240827160934	2025-10-01 09:54:11
20240919163303	2025-10-01 09:54:11
20240919163305	2025-10-01 09:54:11
20241019105805	2025-10-01 09:54:11
20241030150047	2025-10-01 09:54:11
20241108114728	2025-10-01 09:54:11
20241121104152	2025-10-01 09:54:11
20241130184212	2025-10-01 09:54:11
20241220035512	2025-10-01 09:54:11
20241220123912	2025-10-01 09:54:11
20241224161212	2025-10-01 09:54:11
20250107150512	2025-10-01 09:54:11
20250110162412	2025-10-01 09:54:11
20250123174212	2025-10-01 09:54:11
20250128220012	2025-10-01 09:54:11
20250506224012	2025-10-01 09:54:11
20250523164012	2025-10-01 09:54:11
20250714121412	2025-10-01 09:54:11
20250905041441	2025-10-01 09:54:11
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-10-01 09:54:10.623196
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-10-01 09:54:10.629072
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-10-01 09:54:10.633807
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-10-01 09:54:10.692143
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-10-01 09:54:11.182508
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-10-01 09:54:11.187834
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-10-01 09:54:11.228555
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-10-01 09:54:11.236404
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-10-01 09:54:11.241556
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-10-01 09:54:11.410641
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-10-01 09:54:11.59932
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-10-01 09:54:11.606334
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-10-01 09:54:11.616089
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-10-01 09:54:11.62808
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-10-01 09:54:11.633389
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-10-01 09:54:11.745067
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-10-01 09:54:11.751977
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-10-01 09:54:11.757879
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-10-01 09:54:11.769354
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-10-01 09:54:11.79393
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-10-01 09:54:11.801383
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-10-01 09:54:11.814544
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-10-01 09:54:11.878088
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-10-01 09:54:11.90162
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-10-01 09:54:11.906959
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-10-01 09:54:11.921581
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-10-02 07:00:39.506945
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-10-02 07:00:40.20582
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-10-02 07:00:40.410324
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-10-02 07:00:40.503099
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-10-02 07:00:40.506759
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-10-02 07:00:40.515405
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-10-02 07:00:40.612164
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-10-02 07:00:41.401804
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-10-02 07:00:41.403431
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-10-02 07:00:41.415067
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-10-02 07:00:41.417854
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-10-02 07:00:41.426814
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-10-02 07:00:41.430095
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-10-02 07:00:41.443739
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-10-02 07:00:41.447056
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-10-02 07:00:41.603716
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-10-02 07:00:41.615092
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-10-02 07:00:41.623245
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 38, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ai_analysis_jobs ai_analysis_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_analysis_jobs
    ADD CONSTRAINT ai_analysis_jobs_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: contract_amendments contract_amendments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_amendments
    ADD CONSTRAINT contract_amendments_pkey PRIMARY KEY (id);


--
-- Name: contract_approvals contract_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_approvals
    ADD CONSTRAINT contract_approvals_pkey PRIMARY KEY (id);


--
-- Name: contract_documents contract_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_documents
    ADD CONSTRAINT contract_documents_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: document_verifications document_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_verifications
    ADD CONSTRAINT document_verifications_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: email_reminders email_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_reminders
    ADD CONSTRAINT email_reminders_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: manager_approvals manager_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_approvals
    ADD CONSTRAINT manager_approvals_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onboarding_timeline onboarding_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_timeline
    ADD CONSTRAINT onboarding_timeline_pkey PRIMARY KEY (id);


--
-- Name: po_line_items po_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_line_items
    ADD CONSTRAINT po_line_items_pkey PRIMARY KEY (id);


--
-- Name: procurement_approvals procurement_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurement_approvals
    ADD CONSTRAINT procurement_approvals_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: reminder_configurations reminder_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_configurations
    ADD CONSTRAINT reminder_configurations_pkey PRIMARY KEY (id);


--
-- Name: reminder_logs reminder_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_logs
    ADD CONSTRAINT reminder_logs_pkey PRIMARY KEY (id);


--
-- Name: requisition_approvals requisition_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_approvals
    ADD CONSTRAINT requisition_approvals_pkey PRIMARY KEY (id);


--
-- Name: requisition_attachments requisition_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_attachments
    ADD CONSTRAINT requisition_attachments_pkey PRIMARY KEY (id);


--
-- Name: requisition_comments requisition_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_comments
    ADD CONSTRAINT requisition_comments_pkey PRIMARY KEY (id);


--
-- Name: requisition_line_items requisition_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_line_items
    ADD CONSTRAINT requisition_line_items_pkey PRIMARY KEY (id);


--
-- Name: requisitions requisitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisitions
    ADD CONSTRAINT requisitions_pkey PRIMARY KEY (id);


--
-- Name: session_resumptions session_resumptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_resumptions
    ADD CONSTRAINT session_resumptions_pkey PRIMARY KEY (id);


--
-- Name: supplier_documents supplier_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_documents
    ADD CONSTRAINT supplier_documents_pkey PRIMARY KEY (id);


--
-- Name: supplier_evaluations supplier_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_evaluations
    ADD CONSTRAINT supplier_evaluations_pkey PRIMARY KEY (id);


--
-- Name: supplier_initiations supplier_initiations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_initiations
    ADD CONSTRAINT supplier_initiations_pkey PRIMARY KEY (id);


--
-- Name: supplier_onboardings supplier_onboardings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_onboardings
    ADD CONSTRAINT supplier_onboardings_pkey PRIMARY KEY (id);


--
-- Name: supplier_reviews supplier_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_reviews
    ADD CONSTRAINT supplier_reviews_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: user_delegations user_delegations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_delegations
    ADD CONSTRAINT user_delegations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_checks verification_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_checks
    ADD CONSTRAINT verification_checks_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: ai_analysis_jobs_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ai_analysis_jobs_status_createdAt_idx" ON public.ai_analysis_jobs USING btree (status, "createdAt");


--
-- Name: ai_analysis_jobs_supplierId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ai_analysis_jobs_supplierId_status_idx" ON public.ai_analysis_jobs USING btree ("supplierId", status);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_entityType_entityId_idx" ON public.audit_logs USING btree ("entityType", "entityId");


--
-- Name: audit_logs_userId_timestamp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_timestamp_idx" ON public.audit_logs USING btree ("userId", "timestamp");


--
-- Name: contract_amendments_contractId_amendmentNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contract_amendments_contractId_amendmentNumber_idx" ON public.contract_amendments USING btree ("contractId", "amendmentNumber");


--
-- Name: contract_approvals_contractId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contract_approvals_contractId_idx" ON public.contract_approvals USING btree ("contractId");


--
-- Name: contract_documents_contractId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contract_documents_contractId_idx" ON public.contract_documents USING btree ("contractId");


--
-- Name: contracts_contractNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contracts_contractNumber_idx" ON public.contracts USING btree ("contractNumber");


--
-- Name: contracts_contractNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "contracts_contractNumber_key" ON public.contracts USING btree ("contractNumber");


--
-- Name: contracts_endDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contracts_endDate_idx" ON public.contracts USING btree ("endDate");


--
-- Name: contracts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contracts_status_idx ON public.contracts USING btree (status);


--
-- Name: contracts_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contracts_supplierId_idx" ON public.contracts USING btree ("supplierId");


--
-- Name: deliveries_deliveryNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deliveries_deliveryNumber_idx" ON public.deliveries USING btree ("deliveryNumber");


--
-- Name: deliveries_deliveryNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "deliveries_deliveryNumber_key" ON public.deliveries USING btree ("deliveryNumber");


--
-- Name: deliveries_deliveryStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deliveries_deliveryStatus_idx" ON public.deliveries USING btree ("deliveryStatus");


--
-- Name: deliveries_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "deliveries_supplierId_idx" ON public.deliveries USING btree ("supplierId");


--
-- Name: document_verifications_isVerified_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "document_verifications_isVerified_idx" ON public.document_verifications USING btree ("isVerified");


--
-- Name: document_verifications_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "document_verifications_supplierId_idx" ON public.document_verifications USING btree ("supplierId");


--
-- Name: document_verifications_supplierId_version_category_fileName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "document_verifications_supplierId_version_category_fileName_key" ON public.document_verifications USING btree ("supplierId", version, category, "fileName");


--
-- Name: email_logs_emailType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_logs_emailType_idx" ON public.email_logs USING btree ("emailType");


--
-- Name: email_logs_referenceType_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_logs_referenceType_referenceId_idx" ON public.email_logs USING btree ("referenceType", "referenceId");


--
-- Name: email_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_logs_status_idx ON public.email_logs USING btree (status);


--
-- Name: email_reminders_onboardingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_reminders_onboardingId_idx" ON public.email_reminders USING btree ("onboardingId");


--
-- Name: email_reminders_scheduledFor_sent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_reminders_scheduledFor_sent_idx" ON public.email_reminders USING btree ("scheduledFor", sent);


--
-- Name: invoices_invoiceNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_invoiceNumber_idx" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: invoices_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_supplierId_idx" ON public.invoices USING btree ("supplierId");


--
-- Name: manager_approvals_initiationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "manager_approvals_initiationId_idx" ON public.manager_approvals USING btree ("initiationId");


--
-- Name: manager_approvals_initiationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "manager_approvals_initiationId_key" ON public.manager_approvals USING btree ("initiationId");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: onboarding_timeline_onboardingId_timestamp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "onboarding_timeline_onboardingId_timestamp_idx" ON public.onboarding_timeline USING btree ("onboardingId", "timestamp");


--
-- Name: po_line_items_purchaseOrderId_lineNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "po_line_items_purchaseOrderId_lineNumber_idx" ON public.po_line_items USING btree ("purchaseOrderId", "lineNumber");


--
-- Name: procurement_approvals_initiationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "procurement_approvals_initiationId_idx" ON public.procurement_approvals USING btree ("initiationId");


--
-- Name: procurement_approvals_initiationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "procurement_approvals_initiationId_key" ON public.procurement_approvals USING btree ("initiationId");


--
-- Name: purchase_orders_poNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_orders_poNumber_idx" ON public.purchase_orders USING btree ("poNumber");


--
-- Name: purchase_orders_poNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "purchase_orders_poNumber_key" ON public.purchase_orders USING btree ("poNumber");


--
-- Name: purchase_orders_requisitionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "purchase_orders_requisitionId_key" ON public.purchase_orders USING btree ("requisitionId");


--
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- Name: purchase_orders_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_orders_supplierId_idx" ON public.purchase_orders USING btree ("supplierId");


--
-- Name: reminder_configurations_reminderType_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reminder_configurations_reminderType_key" ON public.reminder_configurations USING btree ("reminderType");


--
-- Name: reminder_logs_recipientEmail_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reminder_logs_recipientEmail_idx" ON public.reminder_logs USING btree ("recipientEmail");


--
-- Name: reminder_logs_reminderType_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reminder_logs_reminderType_referenceId_idx" ON public.reminder_logs USING btree ("reminderType", "referenceId");


--
-- Name: reminder_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reminder_logs_status_idx ON public.reminder_logs USING btree (status);


--
-- Name: requisition_approvals_approverId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisition_approvals_approverId_status_idx" ON public.requisition_approvals USING btree ("approverId", status);


--
-- Name: requisition_approvals_requisitionId_approvalLevel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisition_approvals_requisitionId_approvalLevel_idx" ON public.requisition_approvals USING btree ("requisitionId", "approvalLevel");


--
-- Name: requisition_attachments_requisitionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisition_attachments_requisitionId_idx" ON public.requisition_attachments USING btree ("requisitionId");


--
-- Name: requisition_comments_requisitionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisition_comments_requisitionId_idx" ON public.requisition_comments USING btree ("requisitionId");


--
-- Name: requisition_line_items_requisitionId_lineNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisition_line_items_requisitionId_lineNumber_idx" ON public.requisition_line_items USING btree ("requisitionId", "lineNumber");


--
-- Name: requisitions_department_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requisitions_department_idx ON public.requisitions USING btree (department);


--
-- Name: requisitions_requestedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisitions_requestedById_idx" ON public.requisitions USING btree ("requestedById");


--
-- Name: requisitions_requisitionNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "requisitions_requisitionNumber_idx" ON public.requisitions USING btree ("requisitionNumber");


--
-- Name: requisitions_requisitionNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "requisitions_requisitionNumber_key" ON public.requisitions USING btree ("requisitionNumber");


--
-- Name: requisitions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requisitions_status_idx ON public.requisitions USING btree (status);


--
-- Name: session_resumptions_moduleType_processId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "session_resumptions_moduleType_processId_idx" ON public.session_resumptions USING btree ("moduleType", "processId");


--
-- Name: session_resumptions_userId_isCompleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "session_resumptions_userId_isCompleted_idx" ON public.session_resumptions USING btree ("userId", "isCompleted");


--
-- Name: supplier_documents_documentType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_documents_documentType_idx" ON public.supplier_documents USING btree ("documentType");


--
-- Name: supplier_documents_onboardingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_documents_onboardingId_idx" ON public.supplier_documents USING btree ("onboardingId");


--
-- Name: supplier_evaluations_supplierId_evaluationDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_evaluations_supplierId_evaluationDate_idx" ON public.supplier_evaluations USING btree ("supplierId", "evaluationDate");


--
-- Name: supplier_initiations_initiatedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_initiations_initiatedById_idx" ON public.supplier_initiations USING btree ("initiatedById");


--
-- Name: supplier_initiations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX supplier_initiations_status_idx ON public.supplier_initiations USING btree (status);


--
-- Name: supplier_onboardings_currentStep_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_onboardings_currentStep_idx" ON public.supplier_onboardings USING btree ("currentStep");


--
-- Name: supplier_onboardings_emailSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_onboardings_emailSent_idx" ON public.supplier_onboardings USING btree ("emailSent");


--
-- Name: supplier_onboardings_initiationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "supplier_onboardings_initiationId_key" ON public.supplier_onboardings USING btree ("initiationId");


--
-- Name: supplier_onboardings_onboardingToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "supplier_onboardings_onboardingToken_key" ON public.supplier_onboardings USING btree ("onboardingToken");


--
-- Name: supplier_onboardings_overallStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_onboardings_overallStatus_idx" ON public.supplier_onboardings USING btree ("overallStatus");


--
-- Name: supplier_onboardings_supplierFormSubmitted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_onboardings_supplierFormSubmitted_idx" ON public.supplier_onboardings USING btree ("supplierFormSubmitted");


--
-- Name: supplier_onboardings_supplierId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "supplier_onboardings_supplierId_key" ON public.supplier_onboardings USING btree ("supplierId");


--
-- Name: supplier_reviews_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "supplier_reviews_supplierId_idx" ON public.supplier_reviews USING btree ("supplierId");


--
-- Name: suppliers_airtableRecordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_airtableRecordId_idx" ON public.suppliers USING btree ("airtableRecordId");


--
-- Name: suppliers_airtableRecordId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "suppliers_airtableRecordId_key" ON public.suppliers USING btree ("airtableRecordId");


--
-- Name: suppliers_businessType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_businessType_idx" ON public.suppliers USING btree ("businessType");


--
-- Name: suppliers_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX suppliers_status_idx ON public.suppliers USING btree (status);


--
-- Name: suppliers_supplierCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_supplierCode_idx" ON public.suppliers USING btree ("supplierCode");


--
-- Name: suppliers_supplierCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON public.suppliers USING btree ("supplierCode");


--
-- Name: system_config_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX system_config_key_key ON public.system_config USING btree (key);


--
-- Name: user_delegations_delegateId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_delegations_delegateId_isActive_idx" ON public.user_delegations USING btree ("delegateId", "isActive");


--
-- Name: user_delegations_delegatorId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_delegations_delegatorId_isActive_idx" ON public.user_delegations USING btree ("delegatorId", "isActive");


--
-- Name: user_delegations_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_delegations_startDate_endDate_idx" ON public.user_delegations USING btree ("startDate", "endDate");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_managerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_managerId_idx" ON public.users USING btree ("managerId");


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: verification_checks_onboardingId_checkType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "verification_checks_onboardingId_checkType_idx" ON public.verification_checks USING btree ("onboardingId", "checkType");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: ai_analysis_jobs ai_analysis_jobs_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_analysis_jobs
    ADD CONSTRAINT "ai_analysis_jobs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contract_amendments contract_amendments_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_amendments
    ADD CONSTRAINT "contract_amendments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_approvals contract_approvals_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_approvals
    ADD CONSTRAINT "contract_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contract_approvals contract_approvals_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_approvals
    ADD CONSTRAINT "contract_approvals_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_documents contract_documents_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_documents
    ADD CONSTRAINT "contract_documents_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contracts contracts_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contracts contracts_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deliveries deliveries_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deliveries deliveries_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: email_logs email_logs_sentById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT "email_logs_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_reminders email_reminders_onboardingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_reminders
    ADD CONSTRAINT "email_reminders_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES public.supplier_onboardings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: manager_approvals manager_approvals_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_approvals
    ADD CONSTRAINT "manager_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: manager_approvals manager_approvals_initiationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_approvals
    ADD CONSTRAINT "manager_approvals_initiationId_fkey" FOREIGN KEY ("initiationId") REFERENCES public.supplier_initiations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: onboarding_timeline onboarding_timeline_onboardingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_timeline
    ADD CONSTRAINT "onboarding_timeline_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES public.supplier_onboardings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: po_line_items po_line_items_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_line_items
    ADD CONSTRAINT "po_line_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: procurement_approvals procurement_approvals_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurement_approvals
    ADD CONSTRAINT "procurement_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: procurement_approvals procurement_approvals_initiationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procurement_approvals
    ADD CONSTRAINT "procurement_approvals_initiationId_fkey" FOREIGN KEY ("initiationId") REFERENCES public.supplier_initiations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_requisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES public.requisitions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: requisition_approvals requisition_approvals_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_approvals
    ADD CONSTRAINT "requisition_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: requisition_approvals requisition_approvals_requisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_approvals
    ADD CONSTRAINT "requisition_approvals_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES public.requisitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requisition_attachments requisition_attachments_requisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_attachments
    ADD CONSTRAINT "requisition_attachments_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES public.requisitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requisition_comments requisition_comments_requisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_comments
    ADD CONSTRAINT "requisition_comments_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES public.requisitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requisition_line_items requisition_line_items_requisitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisition_line_items
    ADD CONSTRAINT "requisition_line_items_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES public.requisitions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: requisitions requisitions_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requisitions
    ADD CONSTRAINT "requisitions_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: session_resumptions session_resumptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_resumptions
    ADD CONSTRAINT "session_resumptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: supplier_documents supplier_documents_onboardingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_documents
    ADD CONSTRAINT "supplier_documents_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES public.supplier_onboardings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: supplier_evaluations supplier_evaluations_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_evaluations
    ADD CONSTRAINT "supplier_evaluations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: supplier_initiations supplier_initiations_initiatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_initiations
    ADD CONSTRAINT "supplier_initiations_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: supplier_onboardings supplier_onboardings_initiatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_onboardings
    ADD CONSTRAINT "supplier_onboardings_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: supplier_onboardings supplier_onboardings_initiationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_onboardings
    ADD CONSTRAINT "supplier_onboardings_initiationId_fkey" FOREIGN KEY ("initiationId") REFERENCES public.supplier_initiations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: supplier_onboardings supplier_onboardings_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_onboardings
    ADD CONSTRAINT "supplier_onboardings_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: supplier_onboardings supplier_onboardings_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_onboardings
    ADD CONSTRAINT "supplier_onboardings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: supplier_reviews supplier_reviews_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_reviews
    ADD CONSTRAINT "supplier_reviews_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: supplier_reviews supplier_reviews_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_reviews
    ADD CONSTRAINT "supplier_reviews_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: suppliers suppliers_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "suppliers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_delegations user_delegations_delegateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_delegations
    ADD CONSTRAINT "user_delegations_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_delegations user_delegations_delegatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_delegations
    ADD CONSTRAINT "user_delegations_delegatorId_fkey" FOREIGN KEY ("delegatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: verification_checks verification_checks_onboardingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_checks
    ADD CONSTRAINT "verification_checks_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES public.supplier_onboardings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict 9pfMsyevBUV9yifEeyW8lhLpcPml96Ob36gg0o27GuUtNntxJ9ic7zvUEluIgmh

