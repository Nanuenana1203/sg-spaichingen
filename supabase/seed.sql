


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."kasse_saldo_after_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update kasse_saldo set saldo = saldo - coalesce(old.gesamtpreis, 0) where id = 1;
  return old;
end;
$$;


ALTER FUNCTION "public"."kasse_saldo_after_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kasse_saldo_after_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update kasse_saldo set saldo = saldo + coalesce(new.gesamtpreis, 0) where id = 1;
  return new;
end;
$$;


ALTER FUNCTION "public"."kasse_saldo_after_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kasse_saldo_after_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update kasse_saldo
     set saldo = saldo + (coalesce(new.gesamtpreis,0) - coalesce(old.gesamtpreis,0))
   where id = 1;
  return new;
end;
$$;


ALTER FUNCTION "public"."kasse_saldo_after_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_set_mitgliedsnr"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.mitgliedsnr is null or new.mitgliedsnr = '' then
    new.mitgliedsnr := nextval('mitgliedsnr_seq')::text;
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."trg_set_mitgliedsnr"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_login"("p_name" "text", "p_password" "text") RETURNS TABLE("id" integer, "name" "text", "istadmin" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select b.id, b.name, b.istadmin
  from public.benutzer b
  where b.name = p_name
    and b.kennwort = crypt(p_password, b.kennwort)
  limit 1;
end;
$$;


ALTER FUNCTION "public"."verify_login"("p_name" "text", "p_password" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artikel" (
    "id" integer NOT NULL,
    "artnr" "text" NOT NULL,
    "bezeichnung" "text" NOT NULL,
    "preis1" numeric(10,2),
    "preis2" numeric(10,2),
    "preis3" numeric(10,2),
    "preis4" numeric(10,2),
    "preis5" numeric(10,2),
    "preis6" numeric(10,2),
    "preis7" numeric(10,2),
    "preis8" numeric(10,2),
    "preis9" numeric(10,2),
    "kachel" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."artikel" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."artikel_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."artikel_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."artikel_id_seq" OWNED BY "public"."artikel"."id";



CREATE TABLE IF NOT EXISTS "public"."bahn_buchungen" (
    "id" bigint NOT NULL,
    "bahn_id" bigint NOT NULL,
    "datum" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_buchung_time_range" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."bahn_buchungen" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bahn_buchungen_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bahn_buchungen_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bahn_buchungen_id_seq" OWNED BY "public"."bahn_buchungen"."id";



CREATE TABLE IF NOT EXISTS "public"."bahn_regeln" (
    "id" bigint NOT NULL,
    "bahn_id" bigint NOT NULL,
    "weekday" smallint NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "slot_minutes" integer DEFAULT 60 NOT NULL,
    "aktiv" boolean DEFAULT true NOT NULL,
    CONSTRAINT "bahn_regeln_slot_minutes_check" CHECK (("slot_minutes" = ANY (ARRAY[15, 30, 45, 60, 90, 120]))),
    CONSTRAINT "bahn_regeln_weekday_check" CHECK ((("weekday" >= 0) AND ("weekday" <= 6))),
    CONSTRAINT "chk_time_range" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."bahn_regeln" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bahn_regeln_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bahn_regeln_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bahn_regeln_id_seq" OWNED BY "public"."bahn_regeln"."id";



CREATE TABLE IF NOT EXISTS "public"."bahnen" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "nummer" "text"
);


ALTER TABLE "public"."bahnen" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bahnen_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bahnen_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bahnen_id_seq" OWNED BY "public"."bahnen"."id";



CREATE TABLE IF NOT EXISTS "public"."benutzer" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "kennwort" "text" NOT NULL,
    "istadmin" boolean DEFAULT false NOT NULL,
    "email" "text",
    "createdat" timestamp with time zone DEFAULT "now"(),
    "erlaubter_rechner_hash" "text"
);


ALTER TABLE "public"."benutzer" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."benutzer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."benutzer_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."benutzer_id_seq" OWNED BY "public"."benutzer"."id";



CREATE TABLE IF NOT EXISTS "public"."kasse" (
    "id" bigint NOT NULL,
    "datum" "date",
    "uhrzeit" time without time zone,
    "mitglied_id" integer,
    "mitglied_nummer" "text",
    "mitglied_name" "text",
    "artikel_id" integer,
    "artikel_nummer" "text",
    "artikel_bezeichnung" "text",
    "menge" integer,
    "einzelpreis" numeric(10,2),
    "gesamtpreis" numeric(10,2),
    "benutzer_id" integer,
    "benutzer_name" "text"
);


ALTER TABLE "public"."kasse" OWNER TO "postgres";


ALTER TABLE "public"."kasse" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."kasse_id_seq1"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."kasse_saldo" (
    "id" integer DEFAULT 1 NOT NULL,
    "saldo" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."kasse_saldo" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mitglieder" (
    "id" integer NOT NULL,
    "mitgliedsnr" "text" NOT NULL,
    "name" "text" NOT NULL,
    "strasse" "text",
    "landkz" "text",
    "plz" "text",
    "ort" "text",
    "preisgruppe" integer,
    "ausweisnr" "text",
    "mitglied" boolean DEFAULT false NOT NULL,
    "gesperrt" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mitglieder" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mitglieder_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mitglieder_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mitglieder_id_seq" OWNED BY "public"."mitglieder"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."mitgliedsnr_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mitgliedsnr_seq" OWNER TO "postgres";


ALTER TABLE ONLY "public"."artikel" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."artikel_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bahn_buchungen" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bahn_buchungen_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bahn_regeln" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bahn_regeln_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bahnen" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bahnen_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."benutzer" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."benutzer_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mitglieder" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mitglieder_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."artikel"
    ADD CONSTRAINT "artikel_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bahn_buchungen"
    ADD CONSTRAINT "bahn_buchungen_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bahn_regeln"
    ADD CONSTRAINT "bahn_regeln_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bahnen"
    ADD CONSTRAINT "bahnen_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."bahnen"
    ADD CONSTRAINT "bahnen_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."benutzer"
    ADD CONSTRAINT "benutzer_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."benutzer"
    ADD CONSTRAINT "benutzer_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kasse"
    ADD CONSTRAINT "kasse_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kasse_saldo"
    ADD CONSTRAINT "kasse_saldo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mitglieder"
    ADD CONSTRAINT "mitglieder_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bahn_buchungen"
    ADD CONSTRAINT "uniq_bahn_datum_zeit" UNIQUE ("bahn_id", "datum", "start_time", "end_time");



CREATE INDEX "idx_buchungen_bahn_datum" ON "public"."bahn_buchungen" USING "btree" ("bahn_id", "datum");



CREATE INDEX "idx_regeln_bahn_wochentag" ON "public"."bahn_regeln" USING "btree" ("bahn_id", "weekday");



CREATE UNIQUE INDEX "mitglieder_mitgliedsnr_unique" ON "public"."mitglieder" USING "btree" ("mitgliedsnr");



CREATE OR REPLACE TRIGGER "before_insert_mitgliedsnr" BEFORE INSERT ON "public"."mitglieder" FOR EACH ROW EXECUTE FUNCTION "public"."trg_set_mitgliedsnr"();



CREATE OR REPLACE TRIGGER "trg_kasse_saldo_ad" AFTER DELETE ON "public"."kasse" FOR EACH ROW EXECUTE FUNCTION "public"."kasse_saldo_after_delete"();



CREATE OR REPLACE TRIGGER "trg_kasse_saldo_ai" AFTER INSERT ON "public"."kasse" FOR EACH ROW EXECUTE FUNCTION "public"."kasse_saldo_after_insert"();



CREATE OR REPLACE TRIGGER "trg_kasse_saldo_au" AFTER UPDATE OF "gesamtpreis" ON "public"."kasse" FOR EACH ROW EXECUTE FUNCTION "public"."kasse_saldo_after_update"();



ALTER TABLE ONLY "public"."bahn_buchungen"
    ADD CONSTRAINT "bahn_buchungen_bahn_id_fkey" FOREIGN KEY ("bahn_id") REFERENCES "public"."bahnen"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bahn_regeln"
    ADD CONSTRAINT "bahn_regeln_bahn_id_fkey" FOREIGN KEY ("bahn_id") REFERENCES "public"."bahnen"("id") ON DELETE CASCADE;



ALTER TABLE "public"."benutzer" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "benutzer select for anon" ON "public"."benutzer" FOR SELECT TO "anon" USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."kasse_saldo_after_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."kasse_saldo_after_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."kasse_saldo_after_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."kasse_saldo_after_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."kasse_saldo_after_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."kasse_saldo_after_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."kasse_saldo_after_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."kasse_saldo_after_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."kasse_saldo_after_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_set_mitgliedsnr"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_set_mitgliedsnr"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_set_mitgliedsnr"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_login"("p_name" "text", "p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_login"("p_name" "text", "p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_login"("p_name" "text", "p_password" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."artikel" TO "anon";
GRANT ALL ON TABLE "public"."artikel" TO "authenticated";
GRANT ALL ON TABLE "public"."artikel" TO "service_role";



GRANT ALL ON SEQUENCE "public"."artikel_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."artikel_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."artikel_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bahn_buchungen" TO "anon";
GRANT ALL ON TABLE "public"."bahn_buchungen" TO "authenticated";
GRANT ALL ON TABLE "public"."bahn_buchungen" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bahn_buchungen_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bahn_buchungen_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bahn_buchungen_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bahn_regeln" TO "anon";
GRANT ALL ON TABLE "public"."bahn_regeln" TO "authenticated";
GRANT ALL ON TABLE "public"."bahn_regeln" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bahn_regeln_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bahn_regeln_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bahn_regeln_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bahnen" TO "anon";
GRANT ALL ON TABLE "public"."bahnen" TO "authenticated";
GRANT ALL ON TABLE "public"."bahnen" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bahnen_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bahnen_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bahnen_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."benutzer" TO "anon";
GRANT ALL ON TABLE "public"."benutzer" TO "authenticated";
GRANT ALL ON TABLE "public"."benutzer" TO "service_role";



GRANT ALL ON SEQUENCE "public"."benutzer_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."benutzer_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."benutzer_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."kasse" TO "anon";
GRANT ALL ON TABLE "public"."kasse" TO "authenticated";
GRANT ALL ON TABLE "public"."kasse" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kasse_id_seq1" TO "anon";
GRANT ALL ON SEQUENCE "public"."kasse_id_seq1" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kasse_id_seq1" TO "service_role";



GRANT ALL ON TABLE "public"."kasse_saldo" TO "anon";
GRANT ALL ON TABLE "public"."kasse_saldo" TO "authenticated";
GRANT ALL ON TABLE "public"."kasse_saldo" TO "service_role";



GRANT ALL ON TABLE "public"."mitglieder" TO "anon";
GRANT ALL ON TABLE "public"."mitglieder" TO "authenticated";
GRANT ALL ON TABLE "public"."mitglieder" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mitglieder_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mitglieder_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mitglieder_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mitgliedsnr_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mitgliedsnr_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mitgliedsnr_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































