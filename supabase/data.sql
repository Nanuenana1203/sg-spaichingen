SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict cfsYwZWRYXTf5r0g8IBSZia3b5CqWeSWrLL02M45lOPSRIuisaWg3X5UakfnAzs

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."app_settings" ("key", "value") VALUES
	('mitglied_start', '1000');


--
-- Data for Name: artikel; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."artikel" ("id", "artnr", "bezeichnung", "preis1", "preis2", "preis3", "preis4", "preis5", "preis6", "preis7", "preis8", "preis9", "kachel") VALUES
	(13, '9', '9', 9.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(1, 'Test1', 'Langwaffe Großkaliber', 15.00, 9.00, 2.00, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(2, 'Test2', 'Test2', 9.00, 2.00, 10.00, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 6.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(19, '987', '987', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false),
	(18, '156', 'Test156', 15.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(20, 'Test4', 'Test4', 15.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(21, 'Test5', 'Test5', 15.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(22, 'Test6', 'Test6', 15.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(23, '19999', '1', 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, true),
	(24, '1', '2', 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 11.00, true),
	(8, '15', '5', 5.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true),
	(25, '2', '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false);


--
-- Data for Name: bahnen; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bahnen" ("id", "name", "nummer") VALUES
	(25, 'Bahn 2 - Langwaffe 100m, Großkaliber', '102-LW-100-GK'),
	(27, 'Bahn 3 - Langwaffe 100m, Großkaliber', '103-LW-100-GK'),
	(26, 'Bahn 4 - Langwaffe 100m, Großkaliber', '104-LW-100-GK'),
	(28, 'Bahn 5 - Langwaffe 50m, Großkaliber', '105-LW-50-GK'),
	(29, 'Bahn 6 - Langwaffe 50m, Großkaliber', '106-LW-50-GK'),
	(30, 'Bahn 7 - Langwaffe 50m, Kleinkaliber', '107-LW-50-KK'),
	(31, 'Bahn 8 - Langwaffe 50m, Kleinkaliber', '108-LW-50-KK'),
	(32, 'Bahn 9 - Langwaffe 50m, Kleinkaliber', '109-LW-50-KK'),
	(33, 'Bahn 10 - Langwaffe 50m, Kleinkaliber', '110-LW-50-KK'),
	(34, 'Bahn 11 - Langwaffe 50m, Kleinkaliber', '111-LW-50-KK'),
	(35, 'Bahn 12 - Langwaffe 50m, Kleinkaliber', '112-LW-50-KK'),
	(23, 'Bahn 1 - Kurzwaffe, 25m, Großkaliber', '201-KW-25-GK'),
	(4, 'Bahn 1 - Langwaffe 100m, Großkaliber', '101-LW-100-GK'),
	(36, 'Bahn 2 - Kurzwaffe, 25m, Großkaliber', '202-KW-25-GK'),
	(37, 'Bahn 3 - Kurzwaffe, 25m, Großkaliber', '203-KW-25-GK'),
	(38, 'Bahn 4 - Kurzwaffe, 25m, Großkaliber', '204-KW-25-GK'),
	(39, 'Bahn 5 - Kurzwaffe, 25m, Großkaliber', '205-KW-25-GK'),
	(40, 'Bahn 6 - Kurzwaffe, 25m, Großkaliber', '206-KW-25-GK'),
	(41, 'Bahn 7 - Kurzwaffe, 25m, Großkaliber', '207-KW-25-GK'),
	(42, 'Bahn 8 - Kurzwaffe, 25m, Großkaliber', '208-KW-25-GK'),
	(43, 'Bahn 9 - Kurzwaffe, 25m, Großkaliber', '209-KW-25-GK'),
	(44, 'Bahn 10 - Kurzwaffe, 25m, Großkaliber', '210-KW-25-GK');


--
-- Data for Name: bahn_buchungen; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bahn_buchungen" ("id", "bahn_id", "datum", "start_time", "end_time", "name", "email", "created_at") VALUES
	(1, 4, '2025-11-04', '20:00:00', '21:00:00', 'Marion', 'marion.treu@t-online.de', '2025-10-30 09:23:43.106208+00'),
	(10, 4, '2025-11-04', '19:00:00', '20:00:00', 'Marion', 'mm@mm.de', '2025-10-30 13:09:33.374778+00'),
	(11, 4, '2025-11-08', '14:00:00', '15:00:00', 'Esel', 'esel@esel.de', '2025-10-30 13:13:00.106829+00'),
	(14, 4, '2025-11-08', '15:00:00', '16:00:00', 'Der mit dem gaaaaanz langen namen', 'esel@esel.de', '2025-10-30 13:14:15.693487+00'),
	(16, 4, '2025-11-18', '19:00:00', '20:00:00', 'Marion Treu', 'marion.treu@t-online.de', '2025-10-30 14:26:36.58466+00'),
	(19, 4, '2025-11-09', '10:00:00', '11:00:00', 'Marion Treu', 'mm@mm.de', '2025-11-01 08:22:25.987899+00'),
	(23, 4, '2025-11-15', '14:00:00', '15:00:00', 'Test', 'Test@test.de', '2025-11-02 14:11:15.696865+00'),
	(27, 4, '2026-02-03', '19:00:00', '20:00:00', 'Eee', 'eee', '2026-01-31 05:50:45.291178+00'),
	(28, 4, '2026-02-17', '20:00:00', '21:00:00', 'Aaaa', 'aaa', '2026-01-31 14:16:11.934368+00'),
	(29, 4, '2026-01-31', '15:00:00', '16:00:00', 'David Klaut', 'nenova@hotmail.de', '2026-01-31 14:39:42.859655+00');


--
-- Data for Name: bahn_regeln; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bahn_regeln" ("id", "bahn_id", "weekday", "start_time", "end_time", "slot_minutes", "aktiv") VALUES
	(88, 25, 5, '20:00:00', '21:00:00', 60, true),
	(89, 27, 5, '20:00:00', '21:00:00', 60, true),
	(90, 26, 5, '20:00:00', '21:00:00', 60, true),
	(91, 28, 5, '20:00:00', '21:00:00', 60, true),
	(92, 29, 5, '20:00:00', '21:00:00', 60, true),
	(93, 30, 5, '20:00:00', '21:00:00', 60, true),
	(94, 31, 5, '20:00:00', '21:00:00', 60, true),
	(22, 25, 2, '19:00:00', '20:00:00', 60, true),
	(23, 27, 2, '19:00:00', '20:00:00', 60, true),
	(24, 26, 2, '19:00:00', '20:00:00', 60, true),
	(25, 28, 2, '19:00:00', '20:00:00', 60, true),
	(26, 29, 2, '19:00:00', '20:00:00', 60, true),
	(27, 30, 2, '19:00:00', '20:00:00', 60, true),
	(28, 31, 2, '19:00:00', '20:00:00', 60, true),
	(29, 32, 2, '19:00:00', '20:00:00', 60, true),
	(30, 33, 2, '19:00:00', '20:00:00', 60, true),
	(31, 34, 2, '19:00:00', '20:00:00', 60, true),
	(32, 35, 2, '19:00:00', '20:00:00', 60, true),
	(33, 23, 2, '19:00:00', '20:00:00', 60, true),
	(34, 4, 2, '19:00:00', '20:00:00', 60, true),
	(35, 36, 2, '19:00:00', '20:00:00', 60, true),
	(36, 37, 2, '19:00:00', '20:00:00', 60, true),
	(37, 38, 2, '19:00:00', '20:00:00', 60, true),
	(38, 39, 2, '19:00:00', '20:00:00', 60, true),
	(39, 40, 2, '19:00:00', '20:00:00', 60, true),
	(40, 41, 2, '19:00:00', '20:00:00', 60, true),
	(41, 42, 2, '19:00:00', '20:00:00', 60, true),
	(42, 43, 2, '19:00:00', '20:00:00', 60, true),
	(43, 44, 2, '19:00:00', '20:00:00', 60, true),
	(44, 25, 2, '20:00:00', '21:00:00', 60, true),
	(45, 27, 2, '20:00:00', '21:00:00', 60, true),
	(46, 26, 2, '20:00:00', '21:00:00', 60, true),
	(47, 28, 2, '20:00:00', '21:00:00', 60, true),
	(48, 29, 2, '20:00:00', '21:00:00', 60, true),
	(49, 30, 2, '20:00:00', '21:00:00', 60, true),
	(50, 31, 2, '20:00:00', '21:00:00', 60, true),
	(51, 32, 2, '20:00:00', '21:00:00', 60, true),
	(52, 33, 2, '20:00:00', '21:00:00', 60, true),
	(53, 34, 2, '20:00:00', '21:00:00', 60, true),
	(54, 35, 2, '20:00:00', '21:00:00', 60, true),
	(55, 23, 2, '20:00:00', '21:00:00', 60, true),
	(56, 4, 2, '20:00:00', '21:00:00', 60, true),
	(57, 36, 2, '20:00:00', '21:00:00', 60, true),
	(58, 37, 2, '20:00:00', '21:00:00', 60, true),
	(59, 38, 2, '20:00:00', '21:00:00', 60, true),
	(60, 39, 2, '20:00:00', '21:00:00', 60, true),
	(61, 40, 2, '20:00:00', '21:00:00', 60, true),
	(62, 41, 2, '20:00:00', '21:00:00', 60, true),
	(63, 42, 2, '20:00:00', '21:00:00', 60, true),
	(64, 43, 2, '20:00:00', '21:00:00', 60, true),
	(65, 44, 2, '20:00:00', '21:00:00', 60, true),
	(66, 25, 5, '19:00:00', '20:00:00', 60, true),
	(67, 27, 5, '19:00:00', '20:00:00', 60, true),
	(68, 26, 5, '19:00:00', '20:00:00', 60, true),
	(69, 28, 5, '19:00:00', '20:00:00', 60, true),
	(70, 29, 5, '19:00:00', '20:00:00', 60, true),
	(71, 30, 5, '19:00:00', '20:00:00', 60, true),
	(72, 31, 5, '19:00:00', '20:00:00', 60, true),
	(73, 32, 5, '19:00:00', '20:00:00', 60, true),
	(74, 33, 5, '19:00:00', '20:00:00', 60, true),
	(75, 34, 5, '19:00:00', '20:00:00', 60, true),
	(76, 35, 5, '19:00:00', '20:00:00', 60, true),
	(77, 23, 5, '19:00:00', '20:00:00', 60, true),
	(78, 4, 5, '19:00:00', '20:00:00', 60, true),
	(79, 36, 5, '19:00:00', '20:00:00', 60, true),
	(80, 37, 5, '19:00:00', '20:00:00', 60, true),
	(81, 38, 5, '19:00:00', '20:00:00', 60, true),
	(82, 39, 5, '19:00:00', '20:00:00', 60, true),
	(83, 40, 5, '19:00:00', '20:00:00', 60, true),
	(84, 41, 5, '19:00:00', '20:00:00', 60, true),
	(85, 42, 5, '19:00:00', '20:00:00', 60, true),
	(86, 43, 5, '19:00:00', '20:00:00', 60, true),
	(87, 44, 5, '19:00:00', '20:00:00', 60, true),
	(95, 32, 5, '20:00:00', '21:00:00', 60, true),
	(96, 33, 5, '20:00:00', '21:00:00', 60, true),
	(97, 34, 5, '20:00:00', '21:00:00', 60, true),
	(98, 35, 5, '20:00:00', '21:00:00', 60, true),
	(99, 23, 5, '20:00:00', '21:00:00', 60, true),
	(100, 4, 5, '20:00:00', '21:00:00', 60, true),
	(101, 36, 5, '20:00:00', '21:00:00', 60, true),
	(102, 37, 5, '20:00:00', '21:00:00', 60, true),
	(103, 38, 5, '20:00:00', '21:00:00', 60, true),
	(104, 39, 5, '20:00:00', '21:00:00', 60, true),
	(105, 40, 5, '20:00:00', '21:00:00', 60, true),
	(106, 41, 5, '20:00:00', '21:00:00', 60, true),
	(107, 42, 5, '20:00:00', '21:00:00', 60, true),
	(108, 43, 5, '20:00:00', '21:00:00', 60, true),
	(109, 44, 5, '20:00:00', '21:00:00', 60, true),
	(110, 25, 6, '14:00:00', '15:00:00', 60, true),
	(111, 27, 6, '14:00:00', '15:00:00', 60, true),
	(112, 26, 6, '14:00:00', '15:00:00', 60, true),
	(113, 28, 6, '14:00:00', '15:00:00', 60, true),
	(114, 29, 6, '14:00:00', '15:00:00', 60, true),
	(115, 30, 6, '14:00:00', '15:00:00', 60, true),
	(116, 31, 6, '14:00:00', '15:00:00', 60, true),
	(117, 32, 6, '14:00:00', '15:00:00', 60, true),
	(118, 33, 6, '14:00:00', '15:00:00', 60, true),
	(119, 34, 6, '14:00:00', '15:00:00', 60, true),
	(120, 35, 6, '14:00:00', '15:00:00', 60, true),
	(121, 23, 6, '14:00:00', '15:00:00', 60, true),
	(122, 4, 6, '14:00:00', '15:00:00', 60, true),
	(123, 36, 6, '14:00:00', '15:00:00', 60, true),
	(124, 37, 6, '14:00:00', '15:00:00', 60, true),
	(125, 38, 6, '14:00:00', '15:00:00', 60, true),
	(126, 39, 6, '14:00:00', '15:00:00', 60, true),
	(127, 40, 6, '14:00:00', '15:00:00', 60, true),
	(128, 41, 6, '14:00:00', '15:00:00', 60, true),
	(129, 42, 6, '14:00:00', '15:00:00', 60, true),
	(130, 43, 6, '14:00:00', '15:00:00', 60, true),
	(131, 44, 6, '14:00:00', '15:00:00', 60, true),
	(132, 25, 6, '15:00:00', '16:00:00', 60, true),
	(133, 27, 6, '15:00:00', '16:00:00', 60, true),
	(134, 26, 6, '15:00:00', '16:00:00', 60, true),
	(135, 28, 6, '15:00:00', '16:00:00', 60, true),
	(136, 29, 6, '15:00:00', '16:00:00', 60, true),
	(137, 30, 6, '15:00:00', '16:00:00', 60, true),
	(138, 31, 6, '15:00:00', '16:00:00', 60, true),
	(139, 32, 6, '15:00:00', '16:00:00', 60, true),
	(140, 33, 6, '15:00:00', '16:00:00', 60, true),
	(141, 34, 6, '15:00:00', '16:00:00', 60, true),
	(142, 35, 6, '15:00:00', '16:00:00', 60, true),
	(143, 23, 6, '15:00:00', '16:00:00', 60, true),
	(144, 4, 6, '15:00:00', '16:00:00', 60, true),
	(145, 36, 6, '15:00:00', '16:00:00', 60, true),
	(146, 37, 6, '15:00:00', '16:00:00', 60, true),
	(147, 38, 6, '15:00:00', '16:00:00', 60, true),
	(148, 39, 6, '15:00:00', '16:00:00', 60, true),
	(149, 40, 6, '15:00:00', '16:00:00', 60, true),
	(150, 41, 6, '15:00:00', '16:00:00', 60, true),
	(151, 42, 6, '15:00:00', '16:00:00', 60, true),
	(152, 43, 6, '15:00:00', '16:00:00', 60, true),
	(153, 44, 6, '15:00:00', '16:00:00', 60, true),
	(154, 25, 6, '16:00:00', '17:00:00', 60, true),
	(155, 27, 6, '16:00:00', '17:00:00', 60, true),
	(156, 26, 6, '16:00:00', '17:00:00', 60, true),
	(157, 28, 6, '16:00:00', '17:00:00', 60, true),
	(158, 29, 6, '16:00:00', '17:00:00', 60, true),
	(159, 30, 6, '16:00:00', '17:00:00', 60, true),
	(160, 31, 6, '16:00:00', '17:00:00', 60, true),
	(161, 32, 6, '16:00:00', '17:00:00', 60, true),
	(162, 33, 6, '16:00:00', '17:00:00', 60, true),
	(163, 34, 6, '16:00:00', '17:00:00', 60, true),
	(164, 35, 6, '16:00:00', '17:00:00', 60, true),
	(165, 23, 6, '16:00:00', '17:00:00', 60, true),
	(166, 4, 6, '16:00:00', '17:00:00', 60, true),
	(167, 36, 6, '16:00:00', '17:00:00', 60, true),
	(168, 37, 6, '16:00:00', '17:00:00', 60, true),
	(169, 38, 6, '16:00:00', '17:00:00', 60, true),
	(170, 39, 6, '16:00:00', '17:00:00', 60, true),
	(171, 40, 6, '16:00:00', '17:00:00', 60, true),
	(172, 41, 6, '16:00:00', '17:00:00', 60, true),
	(173, 42, 6, '16:00:00', '17:00:00', 60, true),
	(174, 43, 6, '16:00:00', '17:00:00', 60, true),
	(175, 44, 6, '16:00:00', '17:00:00', 60, true),
	(176, 25, 0, '10:00:00', '11:00:00', 60, true),
	(177, 27, 0, '10:00:00', '11:00:00', 60, true),
	(178, 26, 0, '10:00:00', '11:00:00', 60, true),
	(179, 28, 0, '10:00:00', '11:00:00', 60, true),
	(180, 29, 0, '10:00:00', '11:00:00', 60, true),
	(181, 30, 0, '10:00:00', '11:00:00', 60, true),
	(182, 31, 0, '10:00:00', '11:00:00', 60, true),
	(183, 32, 0, '10:00:00', '11:00:00', 60, true),
	(184, 33, 0, '10:00:00', '11:00:00', 60, true),
	(185, 34, 0, '10:00:00', '11:00:00', 60, true),
	(186, 35, 0, '10:00:00', '11:00:00', 60, true),
	(187, 23, 0, '10:00:00', '11:00:00', 60, true),
	(188, 4, 0, '10:00:00', '11:00:00', 60, true),
	(189, 36, 0, '10:00:00', '11:00:00', 60, true),
	(190, 37, 0, '10:00:00', '11:00:00', 60, true),
	(191, 38, 0, '10:00:00', '11:00:00', 60, true),
	(192, 39, 0, '10:00:00', '11:00:00', 60, true),
	(193, 40, 0, '10:00:00', '11:00:00', 60, true),
	(194, 41, 0, '10:00:00', '11:00:00', 60, true),
	(195, 42, 0, '10:00:00', '11:00:00', 60, true),
	(196, 43, 0, '10:00:00', '11:00:00', 60, true),
	(197, 44, 0, '10:00:00', '11:00:00', 60, true),
	(198, 25, 0, '11:00:00', '12:00:00', 60, true),
	(199, 27, 0, '11:00:00', '12:00:00', 60, true),
	(200, 26, 0, '11:00:00', '12:00:00', 60, true),
	(201, 28, 0, '11:00:00', '12:00:00', 60, true),
	(202, 29, 0, '11:00:00', '12:00:00', 60, true),
	(203, 30, 0, '11:00:00', '12:00:00', 60, true),
	(204, 31, 0, '11:00:00', '12:00:00', 60, true),
	(205, 32, 0, '11:00:00', '12:00:00', 60, true),
	(206, 33, 0, '11:00:00', '12:00:00', 60, true),
	(207, 34, 0, '11:00:00', '12:00:00', 60, true),
	(208, 35, 0, '11:00:00', '12:00:00', 60, true),
	(209, 23, 0, '11:00:00', '12:00:00', 60, true),
	(210, 4, 0, '11:00:00', '12:00:00', 60, true),
	(211, 36, 0, '11:00:00', '12:00:00', 60, true),
	(212, 37, 0, '11:00:00', '12:00:00', 60, true),
	(213, 38, 0, '11:00:00', '12:00:00', 60, true),
	(214, 39, 0, '11:00:00', '12:00:00', 60, true),
	(215, 40, 0, '11:00:00', '12:00:00', 60, true),
	(216, 41, 0, '11:00:00', '12:00:00', 60, true),
	(217, 42, 0, '11:00:00', '12:00:00', 60, true),
	(218, 43, 0, '11:00:00', '12:00:00', 60, true),
	(219, 44, 0, '11:00:00', '12:00:00', 60, true);


--
-- Data for Name: benutzer; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."benutzer" ("id", "name", "kennwort", "istadmin", "email", "createdat", "erlaubter_rechner_hash") VALUES
	(1, 'Admin', '$2b$10$WndmhrTb8avOFjkzCieq6OiexCzoKYwxdArzuV/bUEsOAYEWGAjqK', true, 'admin@example.com', '2025-09-21 08:57:37.988384+00', NULL),
	(66, 'Otto', '$2b$10$Mp3jA7RK7CEplrGtFGRiP.ykcb.CkEZlRJFifc4qvE1X.jYLY9nSO', false, NULL, '2026-02-02 16:27:14.435231+00', NULL),
	(65, 'Aaa', '$2b$10$gzsTZ9XaEQHlryItf1mwGOTjXJwP2b9CZGzUt2vJLzaDH7D5rHYUC', false, NULL, '2026-02-02 16:00:24.353959+00', 'f1faaf83-4d2d-438f-b5db-1672f7a13170'),
	(63, 'Heini', '$2b$10$Vo7WpaNZTLWgGHMOGMBMguYti9g0ElXUSnH9o11y0Mrbzha/c3nQu', false, NULL, '2026-02-01 15:55:45.245573+00', '04dc19e7-dbe1-4a7c-8c49-cf18758b293d'),
	(26, 'Marion', '$2b$10$hMyGYktKqa.GHyIJW6MEluoOuyBZt2EwZAfxh8oQphLXuXG9JnpnO', true, NULL, '2025-10-26 07:05:02.545669+00', NULL),
	(71, 'Bbb', '$2b$10$lb089LLXvCXPnQBhtLzkwOY.uAS5./cpPsce3SK6ZRqDAPwVLW1EW', false, NULL, '2026-02-21 15:16:49.459432+00', '04dc19e7-dbe1-4a7c-8c49-cf18758b293d');


--
-- Data for Name: kasse; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."kasse" ("id", "datum", "uhrzeit", "mitglied_id", "mitglied_nummer", "mitglied_name", "artikel_id", "artikel_nummer", "artikel_bezeichnung", "menge", "einzelpreis", "gesamtpreis", "benutzer_id", "benutzer_name") OVERRIDING SYSTEM VALUE VALUES
	(3, '2025-10-28', '12:54:42', 11, 'Test', 'Test', 1, 'Test1', 'Langwaffe Großkaliber', 2, 9.00, 18.00, 10, 'Esel'),
	(4, '2025-10-28', '12:54:42', 11, 'Test', 'Test', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 2, 0.00, 0.00, 10, 'Esel'),
	(5, '2025-10-28', '13:00:39', 1, '1', 'Marion Treu', 1, 'Test1', 'Langwaffe Großkaliber', 2, 2.00, 4.00, 1, 'Admin'),
	(6, '2025-10-28', '13:00:39', 1, '1', 'Marion Treu', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 2, 0.00, 0.00, 1, 'Admin'),
	(7, '2025-10-28', '13:06:52', 10, '666', 'Testjhfjdfvb', 8, '15', '5', 3, 5.00, 15.00, 10, 'Esel'),
	(8, '2025-10-28', '13:06:52', 10, '666', 'Testjhfjdfvb', 18, '156', 'Test156', 3, 15.00, 45.00, 10, 'Esel'),
	(9, '2025-10-28', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'Verwendungszweck', 1, NULL, -15.00, 1, 'Admin'),
	(10, '2025-11-01', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'blabla', 1, NULL, -5.00, 1, 'Admin'),
	(11, '2025-11-01', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'test', 1, NULL, -2.00, 1, 'Admin'),
	(12, '2025-11-01', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'Bestandsübernehme', 1, NULL, 125.70, 1, 'Admin'),
	(13, '2025-11-08', '05:12:15', 1, '1', 'Marion Treu', 24, '1', '2', 2, 5.00, 10.00, 1, 'Admin'),
	(14, '2025-11-08', '05:12:15', 1, '1', 'Marion Treu', 2, 'Test2', 'Test2', 1, 10.00, 10.00, 1, 'Admin'),
	(15, '2025-11-08', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'bvn', 1, NULL, 40.00, 1, 'Admin'),
	(16, '2026-01-23', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'bbb', 1, NULL, -5.00, 1, 'Admin'),
	(17, '2026-01-23', '09:57:11', 1, '1', 'Marion Treu', 24, '1', '2', 1, 5.00, 5.00, 1, 'Admin'),
	(18, '2026-01-23', '09:57:11', 1, '1', 'Marion Treu', 20, 'Test4', 'Test4', 1, 0.00, 0.00, 1, 'Admin'),
	(19, '2026-01-31', '05:43:33', 1, '1', 'Marion Treu', 2, 'Test2', 'Test2', 3, 10.00, 30.00, 1, 'Admin'),
	(20, '2026-01-31', '05:43:33', 1, '1', 'Marion Treu', 21, 'Test5', 'Test5', 1, 0.00, 0.00, 1, 'Admin'),
	(21, '2026-01-31', NULL, NULL, NULL, NULL, NULL, 'ENTNAHME', 'Paddy wars', 1, NULL, -50.00, 1, 'Admin'),
	(22, '2026-01-31', '14:20:51', 1, '1', 'Marion Treu', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 0.00, 0.00, 1, 'Admin'),
	(23, '2026-01-31', '14:58:19', 1, '1', 'Marion Treu', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 3, 0.00, 0.00, 1, 'Admin'),
	(24, '2026-01-31', '14:58:19', 1, '1', 'Marion Treu', 20, 'Test4', 'Test4', 1, 0.00, 0.00, 1, 'Admin'),
	(25, '2026-02-01', '05:01:30', 1, '1', 'Marion Treu', 18, '156', 'Test156', 4, 0.00, 0.00, 1, 'Admin'),
	(26, '2026-02-03', '16:30:54', 1, '1', 'Marion Treu', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 0.00, 0.00, 1, 'Admin'),
	(27, '2026-02-03', '16:30:54', 1, '1', 'Marion Treu', 1, 'Test1', 'Langwaffe Großkaliber', 1, 2.00, 2.00, 1, 'Admin'),
	(28, '2026-02-03', '16:30:54', 1, '1', 'Marion Treu', 18, '156', 'Test156', 1, 0.00, 0.00, 1, 'Admin'),
	(29, '2026-02-03', '16:40:22', 22, '1006', 'A', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 6.00, 6.00, 1, 'Admin'),
	(30, '2026-02-03', '16:40:22', 22, '1006', 'A', 1, 'Test1', 'Langwaffe Großkaliber', 1, 15.00, 15.00, 1, 'Admin'),
	(31, '2026-02-03', '16:41:41', 31, '1015', 'Kleiner Großer', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 6.00, 6.00, 1, 'Admin'),
	(32, '2026-02-03', '16:41:41', 31, '1015', 'Kleiner Großer', 1, 'Test1', 'Langwaffe Großkaliber', 1, 15.00, 15.00, 1, 'Admin'),
	(33, '2026-02-03', '16:42:46', 31, '1015', 'Kleiner Großer', 18, '156', 'Test156', 1, 0.00, 0.00, 1, 'Admin'),
	(34, '2026-02-03', '16:42:46', 31, '1015', 'Kleiner Großer', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 0.00, 0.00, 1, 'Admin'),
	(35, '2026-02-03', '16:42:46', 31, '1015', 'Kleiner Großer', 1, 'Test1', 'Langwaffe Großkaliber', 1, 9.00, 9.00, 1, 'Admin'),
	(36, '2026-02-21', '08:26:07', 1, '1', 'Marion Treu', 13, '9', '9', 1, 0.00, 0.00, 1, 'Admin'),
	(37, '2026-02-21', '08:26:07', 1, '1', 'Marion Treu', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 0.00, 0.00, 1, 'Admin'),
	(38, '2026-02-21', '08:26:07', 1, '1', 'Marion Treu', 24, '1', '2', 1, 5.00, 5.00, 1, 'Admin'),
	(39, '2026-02-21', '08:26:07', 1, '1', 'Marion Treu', 8, '15', '5', 1, 0.00, 0.00, 1, 'Admin'),
	(40, '2026-02-21', '15:32:53', 1, '1', 'Marion Treu', 12, '666', 'Spiegel für Scheibe Blabla Blabla blabla Blabla blabla', 1, 0.00, 0.00, 1, 'Admin'),
	(41, '2026-02-21', '15:32:53', 1, '1', 'Marion Treu', 13, '9', '9', 1, 0.00, 0.00, 1, 'Admin'),
	(42, '2026-02-21', '15:32:53', 1, '1', 'Marion Treu', 2, 'Test2', 'Test2', 1, -10.00, -10.00, 1, 'Admin'),
	(43, '2026-02-21', '15:33:42', 1, '1', 'Marion Treu', 2, 'Test2', 'Test2', 2, -10.00, -20.00, 1, 'Admin'),
	(44, '2026-02-21', '15:33:42', 1, '1', 'Marion Treu', 20, 'Test4', 'Test4', 1, 0.00, 0.00, 1, 'Admin'),
	(45, '2026-02-21', '15:33:42', 1, '1', 'Marion Treu', 21, 'Test5', 'Test5', 1, 0.00, 0.00, 1, 'Admin');


--
-- Data for Name: kasse_saldo; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."kasse_saldo" ("id", "saldo") VALUES
	(1, 253.70);


--
-- Data for Name: mitglieder; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."mitglieder" ("id", "mitgliedsnr", "name", "strasse", "landkz", "plz", "ort", "preisgruppe", "ausweisnr", "mitglied", "gesperrt", "created_at") VALUES
	(2, '2', 'Max Mustermann', 'Musterstr. 2', 'D', '78573', 'Wurmlingen', 1, '', false, false, '2025-10-14 22:00:00+00'),
	(10, '666', 'Testjhfjdfvb', NULL, 'D', NULL, NULL, 1, NULL, false, false, '2025-10-14 22:00:00+00'),
	(11, 'Test', 'Test', NULL, 'D', NULL, NULL, 2, NULL, false, false, '2025-10-14 22:00:00+00'),
	(24, '1008', 'Blödel', '', 'D', '', '', NULL, '', false, false, '2025-11-01 13:12:00.436288+00'),
	(22, '1006', 'A', NULL, 'D', NULL, NULL, 1, NULL, false, false, '2025-10-14 22:00:00+00'),
	(1, '1', 'Marion Treu', 'Brielweg 21', 'D', '78253', 'Eigeltingen', 3, '12345', true, false, '2025-10-14 22:00:00+00'),
	(30, '1014', 'Jubel Jubel', 'Glückstrasse 77', 'D', '66216', 'Trefferstadt', 3, '201576145', true, false, '2026-02-03 16:24:11.124127+00'),
	(31, '1015', 'Kleiner Großer', 'Schützen Straße 12', 'D', '222581', 'Jederhein', 2, '2458134', true, false, '2026-02-03 16:35:16.843241+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: artikel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."artikel_id_seq"', 29, true);


--
-- Name: bahn_buchungen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."bahn_buchungen_id_seq"', 29, true);


--
-- Name: bahn_regeln_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."bahn_regeln_id_seq"', 219, true);


--
-- Name: bahnen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."bahnen_id_seq"', 44, true);


--
-- Name: benutzer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."benutzer_id_seq"', 73, true);


--
-- Name: kasse_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."kasse_id_seq1"', 45, true);


--
-- Name: mitglieder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."mitglieder_id_seq"', 31, true);


--
-- Name: mitgliedsnr_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."mitgliedsnr_seq"', 1015, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict cfsYwZWRYXTf5r0g8IBSZia3b5CqWeSWrLL02M45lOPSRIuisaWg3X5UakfnAzs

RESET ALL;
