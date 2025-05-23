--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12
-- Dumped by pg_dump version 15.12

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: challenge_sexes; Type: TABLE; Schema: public; Owner: drinkster
--

CREATE TABLE public.challenge_sexes (
    challenge_id uuid NOT NULL,
    sex character varying(255),
    player_index integer NOT NULL,
    CONSTRAINT challenge_sexes_sex_check CHECK (((sex)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'ALL'::character varying])::text[])))
);


ALTER TABLE public.challenge_sexes OWNER TO drinkster;

--
-- Name: challenges; Type: TABLE; Schema: public; Owner: drinkster
--

CREATE TABLE public.challenges (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    difficulty character varying(255) NOT NULL,
    players integer NOT NULL,
    sips integer NOT NULL,
    text character varying(255) NOT NULL,
    type smallint NOT NULL,
    penalty_id uuid,
    CONSTRAINT challenges_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['EASY'::character varying, 'MEDIUM'::character varying, 'HARD'::character varying, 'EXTREME'::character varying])::text[]))),
    CONSTRAINT challenges_type_check CHECK (((type >= 0) AND (type <= 3)))
);


ALTER TABLE public.challenges OWNER TO drinkster;

--
-- Name: penalties; Type: TABLE; Schema: public; Owner: drinkster
--

CREATE TABLE public.penalties (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    rounds integer NOT NULL,
    text character varying(255) NOT NULL
);


ALTER TABLE public.penalties OWNER TO drinkster;

--
-- Data for Name: challenge_sexes; Type: TABLE DATA; Schema: public; Owner: drinkster
--

COPY public.challenge_sexes (challenge_id, sex, player_index) FROM stdin;
92712d4b-643f-4b49-9ac4-dd0f6428d67b	ALL	0
b65dcbec-5a43-4228-93da-34240118ec8b	ALL	0
21aaf504-20b9-4baa-a6bb-f20e49716fb1	MALE	0
21aaf504-20b9-4baa-a6bb-f20e49716fb1	MALE	1
2126ddcd-3ed6-4b83-9f70-0071ad234548	ALL	0
e47774df-7f71-442c-b0c8-6eabf94503ce	ALL	0
f6256777-4862-4dab-8662-6db52aa930d4	ALL	0
f6256777-4862-4dab-8662-6db52aa930d4	ALL	1
ddac84cb-6d5f-4db3-9792-4b048cc2783a	ALL	0
6e3f93c4-3b57-4eb0-9647-53479d98c546	ALL	0
6e3f93c4-3b57-4eb0-9647-53479d98c546	ALL	1
bdfeb222-1062-4265-bcd0-17ba5e8bd20f	ALL	0
bdfeb222-1062-4265-bcd0-17ba5e8bd20f	ALL	1
4bcb0471-33b4-4801-940d-11b8eb893713	ALL	0
a1a5e959-7436-4965-9348-c1aa2408b5c2	ALL	0
d4e77aa3-adef-4aa2-b9f0-f86f8ec068ac	ALL	0
4c0a565d-dcba-4474-b75b-dd37218b3c9b	ALL	0
4c0a565d-dcba-4474-b75b-dd37218b3c9b	ALL	1
9186514d-f637-415d-8429-57932830efc0	ALL	0
9186514d-f637-415d-8429-57932830efc0	MALE	1
8afe199c-a6cc-4771-a9e6-34689f2a64c7	ALL	0
35676610-aa2f-47f9-b452-5b27eec08445	ALL	0
ab8fa258-5b86-4bab-9293-b53b9abe1281	ALL	0
ab8fa258-5b86-4bab-9293-b53b9abe1281	ALL	1
ab8fa258-5b86-4bab-9293-b53b9abe1281	ALL	2
5140ec0d-a150-4319-bce4-75e6c35834a2	ALL	0
5140ec0d-a150-4319-bce4-75e6c35834a2	ALL	1
b3d1a381-23f1-4352-9043-fedf6c73f679	ALL	0
b3d1a381-23f1-4352-9043-fedf6c73f679	ALL	1
04586b94-43ff-49bd-83bf-2981fc7c0806	ALL	0
04586b94-43ff-49bd-83bf-2981fc7c0806	ALL	1
ec1ca252-3f70-4ede-8f7c-4843cb6c5aa6	ALL	0
ec1ca252-3f70-4ede-8f7c-4843cb6c5aa6	ALL	1
23eefb86-1b95-4a0d-8bd0-a0de776f63f7	ALL	0
23eefb86-1b95-4a0d-8bd0-a0de776f63f7	ALL	1
264e93f7-d81e-4be1-ac82-ca7e8ab00ad3	ALL	0
8f456c18-a4ce-4f00-8b55-5d8181e2efd2	ALL	0
8f456c18-a4ce-4f00-8b55-5d8181e2efd2	ALL	1
5c69a46b-2bd8-4f1f-96a5-d1e126c6f2dc	ALL	0
5c69a46b-2bd8-4f1f-96a5-d1e126c6f2dc	ALL	1
fea863d3-8dd2-4b4b-acf2-0c807ba5a5c9	ALL	0
e994ee62-1299-48bd-8bf8-af1e07c08e68	ALL	0
897e8383-ce7e-4714-9c2d-3de170c1f70a	ALL	0
897e8383-ce7e-4714-9c2d-3de170c1f70a	ALL	1
7c798caf-b788-42a7-93b7-0e54d2a4ff38	ALL	0
7c798caf-b788-42a7-93b7-0e54d2a4ff38	ALL	1
1e58c980-a688-44cc-815e-9ed3a6269660	ALL	0
1e58c980-a688-44cc-815e-9ed3a6269660	ALL	1
98bef805-6727-46df-98b4-ec4dac200e95	ALL	0
98bef805-6727-46df-98b4-ec4dac200e95	ALL	1
7aae471c-ce21-405c-84cc-1f51f85ec4ce	ALL	0
7aae471c-ce21-405c-84cc-1f51f85ec4ce	MALE	1
a7624c52-6935-43d6-bc2b-425cd64cf656	ALL	0
a7624c52-6935-43d6-bc2b-425cd64cf656	ALL	1
3eae55ee-964d-4f8e-bd6f-ee4c516d75af	ALL	0
3eae55ee-964d-4f8e-bd6f-ee4c516d75af	ALL	1
3eae55ee-964d-4f8e-bd6f-ee4c516d75af	ALL	2
06b5e016-a95f-4e01-aba8-12ca50be3e82	ALL	0
06b5e016-a95f-4e01-aba8-12ca50be3e82	ALL	1
19d70580-39dd-498f-a43e-ea17b0cc47cd	ALL	0
19d70580-39dd-498f-a43e-ea17b0cc47cd	ALL	1
bcaf5047-53bc-4ce0-9c5b-1dc7841adbb1	ALL	0
bcaf5047-53bc-4ce0-9c5b-1dc7841adbb1	ALL	1
87631f94-3416-4a6e-a3c4-00c239cb07eb	ALL	0
6c77b189-d5f9-4e3f-a0cc-0ead83b1ffbd	ALL	0
6c77b189-d5f9-4e3f-a0cc-0ead83b1ffbd	ALL	1
06bf4140-2643-475f-9290-e68ab65ced72	ALL	0
1f489588-c944-4efb-987b-cb860447b60a	ALL	0
235915c8-6c4a-41a7-aa0d-a3bb9facad75	ALL	0
885d5a16-3d65-42b4-ac8a-a5d438fbed7c	ALL	0
885d5a16-3d65-42b4-ac8a-a5d438fbed7c	ALL	1
83a244a4-bad2-4180-b836-9d67feed8366	ALL	0
83a244a4-bad2-4180-b836-9d67feed8366	ALL	1
bfc880c5-0ede-4380-b670-b032b5d277f4	ALL	0
bfc880c5-0ede-4380-b670-b032b5d277f4	ALL	1
e90a43b0-a88d-410c-9d98-f314c62cf3e0	ALL	0
e90a43b0-a88d-410c-9d98-f314c62cf3e0	ALL	1
644a5d8b-34ce-4346-a7f4-bfba2081f00b	ALL	0
644a5d8b-34ce-4346-a7f4-bfba2081f00b	ALL	1
52f4c8bf-75d5-45eb-aa6e-0b20e546665b	ALL	0
52f4c8bf-75d5-45eb-aa6e-0b20e546665b	ALL	1
d25e6010-04db-4461-9134-02e8fd3fb29b	ALL	0
d25e6010-04db-4461-9134-02e8fd3fb29b	ALL	1
bd369fe9-f676-41e7-b9b3-690c79a4c64c	ALL	0
12ad290e-021a-46cd-aa92-7ddd94498d41	ALL	0
12ad290e-021a-46cd-aa92-7ddd94498d41	ALL	1
ecb7418c-be70-437c-b1bb-a75c33a31e28	ALL	0
ecb7418c-be70-437c-b1bb-a75c33a31e28	ALL	1
97c0164c-ed8e-426b-a7bd-b0472ba189ff	ALL	0
97c0164c-ed8e-426b-a7bd-b0472ba189ff	ALL	1
b08edc3a-f541-4400-8cdf-ebd5a14b1fd7	ALL	0
5facd364-2f77-4535-b5c4-59ec164fe29f	ALL	0
2f78c68f-1a1a-460e-adc2-e31c9e4d7ff1	ALL	0
2f78c68f-1a1a-460e-adc2-e31c9e4d7ff1	ALL	1
1a2e58ff-2afa-46be-bcd0-ebd552885e45	ALL	0
8e2bcae9-21e6-41bc-8c2c-2bf50ad1618c	ALL	0
01cc0a96-3153-4dcd-b4ed-0600dca1f141	ALL	0
ec3442bd-3c3a-4cd9-b915-238089c5bd54	ALL	0
e27aa9c0-467a-4d70-8815-cb2e7a2c1f1a	ALL	0
e27aa9c0-467a-4d70-8815-cb2e7a2c1f1a	ALL	1
399a4b7e-ea4c-47b3-90d0-ed56c4777f49	ALL	0
9d511925-9728-479c-a17f-456a89bba1fb	ALL	0
6af2d750-c684-4130-a2a7-7a3691fd81ab	ALL	0
6af2d750-c684-4130-a2a7-7a3691fd81ab	ALL	1
94d1a187-c73e-4f70-a0be-57266fc0bc47	ALL	0
27f86760-5a62-4549-b4a0-0c30a8f609bb	ALL	0
27f86760-5a62-4549-b4a0-0c30a8f609bb	ALL	1
500a3e68-7c3c-4091-919c-28b324523638	ALL	0
2505cf7c-73c0-436a-8777-8618cdd93af1	ALL	0
2505cf7c-73c0-436a-8777-8618cdd93af1	ALL	1
fab067aa-552a-473f-8cd1-85c5a902b041	ALL	0
939a09a2-a9a8-4ff8-89b4-681b98aac5ac	ALL	0
52cde166-bd89-454b-a03f-c4f504817581	ALL	0
52cde166-bd89-454b-a03f-c4f504817581	ALL	1
236b0f9a-1081-440f-bb2e-4b2bfb9bc84f	ALL	0
236b0f9a-1081-440f-bb2e-4b2bfb9bc84f	ALL	1
8b25fe63-d561-4a57-89f7-343fae7c4915	ALL	0
8b25fe63-d561-4a57-89f7-343fae7c4915	ALL	1
56a16589-3fbf-4aa4-87ce-121639d1690c	ALL	0
56a16589-3fbf-4aa4-87ce-121639d1690c	ALL	1
f94794ee-27c1-4754-ba8a-3ab9e36df15d	ALL	0
9236dc3b-efaa-4494-99a7-44b46f60d590	MALE	0
9236dc3b-efaa-4494-99a7-44b46f60d590	MALE	1
6f6f1ec5-1ccb-498a-93e6-36db39ec889d	ALL	0
a635609d-955e-4fb1-b6db-0c9176bbe85a	ALL	0
d39605a9-aec0-4dee-9742-4834226646ac	ALL	0
9b2465eb-81ed-4d9d-a39d-26ded5888266	ALL	0
3d1e2de1-fe63-452e-bed0-9b79e1bdc585	ALL	0
3d1e2de1-fe63-452e-bed0-9b79e1bdc585	ALL	1
1c624459-5db0-4990-8f89-257ec8ddffd7	ALL	0
335f7805-d969-4144-b0ca-647d018bb91f	ALL	0
3ffbfec6-adc9-46e0-bb59-0798b291abb0	ALL	0
d448d150-f166-42a8-a20c-72e521fe056e	ALL	0
2521636b-8503-40c6-b101-e45ecddba01c	MALE	0
2521636b-8503-40c6-b101-e45ecddba01c	MALE	1
ff9ab1f2-8d3d-4283-9148-ce5b4961a20f	ALL	0
ff9ab1f2-8d3d-4283-9148-ce5b4961a20f	ALL	1
422e98df-05c7-4bb7-84db-32d2bbee4a7b	ALL	0
6f4de50e-40f4-41de-a181-e8c00f8ac004	ALL	0
6f4de50e-40f4-41de-a181-e8c00f8ac004	MALE	1
c7009d1a-9640-44bf-a58d-def033f62e04	ALL	0
8870cb71-2da0-4ea0-8d5d-e3c138ff1985	ALL	0
18f36d43-f5e7-4fd7-beb0-27a09ff94328	ALL	0
ac6409d4-d47b-4ec8-bd10-e95c4c0b3df7	ALL	0
22f13772-95a9-4ef3-9e4b-4e56d031a961	ALL	0
22f13772-95a9-4ef3-9e4b-4e56d031a961	ALL	1
0897f319-f5f4-4857-89de-9209e439677b	ALL	0
32f84692-3774-405f-884a-789540a1001f	ALL	0
32f84692-3774-405f-884a-789540a1001f	ALL	1
c8801451-9277-4af2-a4f9-efa17a44705a	ALL	0
d16ec79a-bcd1-49d6-b967-85af8845d2de	ALL	0
70375035-10e3-4fb8-9fed-2dbe7037557d	ALL	0
c16774c2-c28e-4531-8c5f-82754e5ce8ec	ALL	0
318291a5-3a8f-4dd3-b389-e337d8e0c702	ALL	0
b517032b-e37f-48d3-bf96-b45012923ffb	ALL	0
dab5039d-38e8-4b26-aa75-a41a66cc8f56	ALL	0
dab5039d-38e8-4b26-aa75-a41a66cc8f56	ALL	1
28e5d2bb-ba96-4565-af6e-2e7bd223617b	ALL	0
e8ec4c52-8513-473f-891d-4b6178b334d5	ALL	0
e8ec4c52-8513-473f-891d-4b6178b334d5	ALL	1
8bdde1e6-1bda-4690-9da1-4125f321402f	ALL	0
8bdde1e6-1bda-4690-9da1-4125f321402f	ALL	1
6342a9e2-d746-4835-b01e-7ee7e4e2f619	ALL	0
5388502a-9a86-46f8-b79a-5db82aa78d54	ALL	0
5388502a-9a86-46f8-b79a-5db82aa78d54	ALL	1
24f6c69a-224c-4a62-b8ec-d5f91933f63c	ALL	0
9651bcb2-43ad-4170-8274-599ba6354600	ALL	0
9651bcb2-43ad-4170-8274-599ba6354600	ALL	1
d3853dfd-f3bd-4f7c-94c9-25eb1d54e665	ALL	0
146748ce-5b9c-419e-949c-172024699695	ALL	0
94f2b7dd-f7c0-4dea-96f8-adbf651969f9	ALL	0
94f2b7dd-f7c0-4dea-96f8-adbf651969f9	ALL	1
e7ea78a7-e89a-4fda-903f-78cdecf44166	ALL	0
4aa12ffd-0330-431d-8bf0-b9a2914f347d	ALL	0
25b30555-5edc-48e0-a165-d0a5f66aa532	ALL	0
25b30555-5edc-48e0-a165-d0a5f66aa532	ALL	1
562359b2-0b9c-4fd9-a89b-d665d7f57726	ALL	0
79d4a6c2-f0cb-4b5b-98aa-14e39f2169ae	ALL	0
8409ac08-8435-4bcf-ad3c-df67471c51a5	ALL	0
8409ac08-8435-4bcf-ad3c-df67471c51a5	ALL	1
a3cdb5de-2ce9-4c2c-b2ac-847798e0f6a4	ALL	0
a3cdb5de-2ce9-4c2c-b2ac-847798e0f6a4	ALL	1
d7a13c0e-909b-445d-9a0f-fc2ad905423f	ALL	0
d7a13c0e-909b-445d-9a0f-fc2ad905423f	ALL	1
52027502-423a-41cc-a7ca-3deafa089758	ALL	0
52027502-423a-41cc-a7ca-3deafa089758	ALL	1
dd659c5a-a73c-46ea-bbd6-eedf712bfaaf	ALL	0
dd659c5a-a73c-46ea-bbd6-eedf712bfaaf	ALL	1
69d041ee-aab0-481f-8060-d51a3184ce4e	ALL	0
9ca3be5a-f3fd-4594-8a50-f6eae8d3b15d	ALL	0
9ca3be5a-f3fd-4594-8a50-f6eae8d3b15d	ALL	1
4f008225-86e7-4e06-b68b-1837e960f4d2	ALL	0
4f008225-86e7-4e06-b68b-1837e960f4d2	MALE	1
f57f2b91-1827-4995-afb5-b0376c6cd277	ALL	0
f57f2b91-1827-4995-afb5-b0376c6cd277	ALL	1
3820531e-300a-441b-8d63-a2d6cad8a3e4	ALL	0
3820531e-300a-441b-8d63-a2d6cad8a3e4	MALE	1
e28667da-3967-40d8-9932-ac61d0afad87	ALL	0
36699bce-6842-4c02-ae3d-ce6c5223f685	ALL	0
36699bce-6842-4c02-ae3d-ce6c5223f685	MALE	1
717fd9d0-0df5-4bd3-b70b-7bdaa22b7d5d	ALL	0
717fd9d0-0df5-4bd3-b70b-7bdaa22b7d5d	MALE	1
01e9818d-706d-4b8c-835c-c08022c2fc15	ALL	0
01e9818d-706d-4b8c-835c-c08022c2fc15	MALE	1
128754ef-3427-4eff-8cf3-426646b7d2da	ALL	0
128754ef-3427-4eff-8cf3-426646b7d2da	MALE	1
128754ef-3427-4eff-8cf3-426646b7d2da	ALL	2
8fe74b2e-256b-41a0-acb1-1878e1c24ac7	ALL	0
8fe74b2e-256b-41a0-acb1-1878e1c24ac7	MALE	1
048a21a0-ef64-40a4-ac32-8904d1f34a3a	ALL	0
ce633a69-48ab-41d1-9d5d-ec296c541e2b	ALL	0
80685129-30b9-4b1d-9be4-8be06f93786b	ALL	0
cbcfc013-0fb6-454f-a02a-af2ad88f3919	ALL	0
3a6d2d65-da84-4b92-9cd2-b0ba2ab28ebf	ALL	0
3a6d2d65-da84-4b92-9cd2-b0ba2ab28ebf	ALL	1
7a803a8c-976d-449b-9b99-8c3547cb154d	ALL	0
7a803a8c-976d-449b-9b99-8c3547cb154d	ALL	1
33bf7364-9b74-42bd-acf4-89a6324e634a	ALL	0
fa3a15c1-bd9f-441f-9cb8-9670c0ced0ff	ALL	0
fa3a15c1-bd9f-441f-9cb8-9670c0ced0ff	ALL	1
d779db7b-97f2-4b74-9f22-ea07f0487105	ALL	0
cc980fdb-bfd8-4251-8810-c07ff762d94c	ALL	0
9b3f6440-cd46-4905-ba36-5dd324905bd6	ALL	0
9b3f6440-cd46-4905-ba36-5dd324905bd6	ALL	1
3e22a5df-8cc8-41d9-bb91-7a1fd585fb4b	ALL	0
3e22a5df-8cc8-41d9-bb91-7a1fd585fb4b	MALE	1
328f9788-b71e-4700-9d0b-963d3f2b49c3	ALL	0
328f9788-b71e-4700-9d0b-963d3f2b49c3	MALE	1
328f9788-b71e-4700-9d0b-963d3f2b49c3	ALL	2
7aa921ab-035f-4cd1-a27a-b574c7f85ebe	ALL	0
8a245acd-458b-40a5-93fd-179b74e7bd6c	ALL	0
27b205e3-5c6a-4e4f-90d6-46ce6d174803	ALL	0
1448c771-cf81-4e9e-928d-9900898a04cd	ALL	0
178b940c-d34a-4bfe-ba46-9a7d9c97794e	ALL	0
4ca2a59f-f278-47f4-b5f3-16c3a82f39ae	ALL	0
14ecfc13-ce3b-4b2a-850f-c4c3b2773ec6	ALL	0
14ecfc13-ce3b-4b2a-850f-c4c3b2773ec6	ALL	1
441222bb-3684-4ac7-bbdc-830579db84d2	ALL	0
441222bb-3684-4ac7-bbdc-830579db84d2	ALL	1
be03a180-59d2-4ef5-89f6-76a8f9aa63d1	MALE	0
be03a180-59d2-4ef5-89f6-76a8f9aa63d1	ALL	1
b4a88185-4e4f-4682-871e-3309390df553	MALE	0
b4a88185-4e4f-4682-871e-3309390df553	MALE	1
2c9c978f-63ff-4b97-96a3-cb8c46e6a723	ALL	0
2c9c978f-63ff-4b97-96a3-cb8c46e6a723	ALL	1
d3609065-8b75-46de-9c0d-2d82d8e01900	MALE	0
d3609065-8b75-46de-9c0d-2d82d8e01900	ALL	1
\.


--
-- Data for Name: challenges; Type: TABLE DATA; Schema: public; Owner: drinkster
--

COPY public.challenges (id, created_at, difficulty, players, sips, text, type, penalty_id) FROM stdin;
92712d4b-643f-4b49-9ac4-dd0f6428d67b	2025-05-09 21:40:03.850742	EASY	1	3	{Player} tell a joke. If no one laughs, drink {sips} sips.	2	\N
b65dcbec-5a43-4228-93da-34240118ec8b	2025-05-09 21:40:03.861917	EASY	1	4	{Player} share an embarrassing moment or drink {sips} sips.	2	\N
21aaf504-20b9-4baa-a6bb-f20e49716fb1	2025-05-09 21:40:03.862962	EXTREME	2	11	{Player} and {Player2} hold each other's penises. Whoever gets hard first drinks {sips} sips. If anyone refuses both drink {sips} sips.	2	\N
2126ddcd-3ed6-4b83-9f70-0071ad234548	2025-05-09 21:40:03.863613	MEDIUM	1	6	{Player} send a flirty DM to the last person you texted or drink {sips} sips.	2	\N
e47774df-7f71-442c-b0c8-6eabf94503ce	2025-05-09 21:40:03.86465	EASY	1	4	{Player} text your mom "I love you" without any context or drink {sips} sips.	2	\N
f6256777-4862-4dab-8662-6db52aa930d4	2025-05-09 21:40:03.865689	MEDIUM	2	6	{Player} swap pants with {Player2} or drink {sips} sips.	2	\N
ddac84cb-6d5f-4db3-9792-4b048cc2783a	2025-05-09 21:40:03.866206	HARD	1	7	{Player} text an ex “I miss you” and immediately delete their response or drink {sips} sips.	2	\N
6e3f93c4-3b57-4eb0-9647-53479d98c546	2025-05-09 21:40:03.867231	MEDIUM	2	5	{Player} let {Player2} write a status update on your social media or drink {sips} sips.	2	\N
bdfeb222-1062-4265-bcd0-17ba5e8bd20f	2025-05-09 21:40:03.86775	HARD	2	7	{Player} let {Player2} draw anything on your face with a marker or drink {sips} sips.	2	\N
4bcb0471-33b4-4801-940d-11b8eb893713	2025-05-09 21:40:03.868266	HARD	1	6	{Player} call an opposite sex friend and tell them you're in love with them or drink {sips} sips.	2	\N
a1a5e959-7436-4965-9348-c1aa2408b5c2	2025-05-09 21:40:03.868783	EXTREME	1	11	{Player} do one of these yoga poses nude for the group (20 seconds): downward facing dog, happy baby, bridge pose or warrior 1 or drink {sips} sips.	2	\N
d4e77aa3-adef-4aa2-b9f0-f86f8ec068ac	2025-05-09 21:40:03.86981	HARD	1	8	{Player} strip to your underwear and run around the outside of the house or drink {sips} sips.	2	\N
4c0a565d-dcba-4474-b75b-dd37218b3c9b	2025-05-09 21:40:03.870327	HARD	2	7	{Player} and {Player2} switch all clothes for 3 rounds. If anyone refuses, both drink {sips} sips.	2	\N
9186514d-f637-415d-8429-57932830efc0	2025-05-09 21:40:03.871351	EXTREME	2	15	{Player} do a blowjob on {Player2} slowly. Whoever chickens out first drinks 9 sips. If anyone refuses both drink {sips} sips.	2	\N
8afe199c-a6cc-4771-a9e6-34689f2a64c7	2025-05-09 21:40:03.871869	HARD	1	6	{Player} simulate an orgasm out loud or drink {sips} sips.	2	\N
35676610-aa2f-47f9-b452-5b27eec08445	2025-05-09 21:40:03.872385	MEDIUM	1	5	{Player} send “I'm thinking of you ;)” to a random contact in your phone or drink {sips} sips.	2	\N
ab8fa258-5b86-4bab-9293-b53b9abe1281	2025-05-09 21:40:03.873414	MEDIUM	3	5	{Player} get blindfolded and try to guess the body part of {Player2} by touch. you have 3 tries.If you get it right, {Player2} drinks {sips}, wrong you drink {sips}. If anyone refuses, both drink {sips} sips.	2	\N
5140ec0d-a150-4319-bce4-75e6c35834a2	2025-05-09 21:40:03.873932	HARD	2	6	{Player} get spanked 3 times by {Player2}. If anyone refuses, both drink {sips} sips.	2	\N
b3d1a381-23f1-4352-9043-fedf6c73f679	2025-05-09 21:40:03.874452	HARD	2	8	{Player} lick seductivly {Player2}'s nipple. If anyone refuses, both drink {sips} sips.	2	\N
04586b94-43ff-49bd-83bf-2981fc7c0806	2025-05-09 21:40:03.875501	MEDIUM	2	4	{Player} and {Player2} arm wrestle. Loser drinks {sips}. If anyone refuses, both drink {sips} sips.	2	\N
ec1ca252-3f70-4ede-8f7c-4843cb6c5aa6	2025-05-09 21:40:03.876017	HARD	2	5	{Player} lick {Player2}'s armpit. If anyone refuses, both drink {sips} sips.	2	\N
23eefb86-1b95-4a0d-8bd0-a0de776f63f7	2025-05-09 21:40:03.876537	EXTREME	2	7	{Player} feel around (move your hand) inside {Player2}'s underwear for 10 seconds. If anyone refuses, both drink {sips} sips.	2	\N
264e93f7-d81e-4be1-ac82-ca7e8ab00ad3	2025-05-09 21:40:03.877656	EXTREME	1	9	{Player} send a nude of your genitalia to another player. If you refuse, drink {sips} sips.	2	\N
8f456c18-a4ce-4f00-8b55-5d8181e2efd2	2025-05-09 21:40:03.878752	EXTREME	2	16	{Player} and {Player2}, take off your clothes and slowly initiate sex in cowboy position.  Whoever Chickens out first drinks 10 sips. If anyone refuses, both drink {sips} sips.	2	\N
5c69a46b-2bd8-4f1f-96a5-d1e126c6f2dc	2025-05-09 21:40:03.880376	EASY	2	4	{Player} switch an item of clothing with {Player2} or drink {sips} sips.	2	\N
fea863d3-8dd2-4b4b-acf2-0c807ba5a5c9	2025-05-09 21:40:03.881925	EXTREME	1	11	{Player} send a nude of yourself with an emoji hiding your genitalia to anyone of the groups choosing. If you refuse, drink {sips} sips.	2	\N
e994ee62-1299-48bd-8bf8-af1e07c08e68	2025-05-09 21:40:03.882984	EASY	1	4	{Player} do 10 push-ups or drink {sips} sips.	2	\N
897e8383-ce7e-4714-9c2d-3de170c1f70a	2025-05-09 21:40:03.883502	EXTREME	2	8	{Player} undress fully and let {Player2} do whatever he wants to you for 30 seconds.  If you refuse, drink {sips} sips.	2	\N
7c798caf-b788-42a7-93b7-0e54d2a4ff38	2025-05-09 21:40:03.884732	EXTREME	2	17	{Player} and {Player2}, take off your clothes and slowly initiate sex in doggy style position.  Whoever Chickens out first drinks 10 sips. If anyone refuses, both drink {sips} sips.	2	\N
1e58c980-a688-44cc-815e-9ed3a6269660	2025-05-09 21:40:03.885768	MEDIUM	2	6	{Player} and {Player2} have to kiss (peck on the lips). If anyone refuses, both drink {sips} sips.	2	\N
98bef805-6727-46df-98b4-ec4dac200e95	2025-05-09 21:40:03.886293	EXTREME	2	9	{Player} play the next 4 rounds on top of {Player2}'s lap, both nude. If anyone refuses, both drink {sips} sips.	2	\N
7aae471c-ce21-405c-84cc-1f51f85ec4ce	2025-05-09 21:40:03.887331	EXTREME	2	8	{Player} act out the Cake dilemma on {Player2}, both nude. If anyone refuses, both drink {sips} sips.	2	\N
a7624c52-6935-43d6-bc2b-425cd64cf656	2025-05-09 21:40:03.889441	EASY	2	8	{Player} play a rock paper scissors with {Player2}. Loser drinks 6 If anyone refuses, both drink {sips} sips.	2	\N
3eae55ee-964d-4f8e-bd6f-ee4c516d75af	2025-05-09 21:40:03.890475	EASY	3	4	{Player} ask a question about yourself and {Player2} answers. If {Player2} gets it wrong he drinks {sips}, else you drink {sips}.	2	\N
06b5e016-a95f-4e01-aba8-12ca50be3e82	2025-05-09 21:40:03.891555	MEDIUM	2	4	{Player} let {Player2} choose a word for you to spell. If you get it wrong, drink {sips} sips.	2	\N
9d438117-03b9-4efe-948b-f49bc1eb4974	2025-05-09 21:40:03.892071	MEDIUM	0	5	Whoever has the fullest glass, drinks {sips} sips.	0	\N
19d70580-39dd-498f-a43e-ea17b0cc47cd	2025-05-09 21:40:03.894674	EXTREME	2	17	{Player} (Big Spoon) and {Player2} (small spoon) spoon nude under the sheets for 40 seconds. If anyone refuses, both drink {sips} sips.	3	\N
bcaf5047-53bc-4ce0-9c5b-1dc7841adbb1	2025-05-09 21:40:03.895874	MEDIUM	2	4	{Player} stand outside and yell what {Player2} wants. If you refuse, drink {sips} sips.	2	\N
87631f94-3416-4a6e-a3c4-00c239cb07eb	2025-05-09 21:40:03.896924	HARD	1	5	{Player} post a story on Instagram saying “I'm horny” or drink {sips} sips.	2	\N
6c77b189-d5f9-4e3f-a0cc-0ead83b1ffbd	2025-05-09 21:40:03.898405	EXTREME	2	14	{Player} rest your head on {Player2}'s nude genitals for the next 4 rounds. If anyone refuses, both drink {sips} sips.	3	f57d56d2-68e3-4367-b458-e1174397dc59
8a3f8197-4796-4553-be2a-2e8097d68414	2025-05-09 21:40:03.899742	MEDIUM	0	4	The fist player to go pee must drink {sips} sips.	2	\N
3ee1cfc3-c02a-4115-b314-41df8ead1fa8	2025-05-09 21:40:03.901769	HARD	0	7	Everyone plays the next 3 rounds nude. If anyone refuses, all drink {sips} sips.	0	43b07000-cd59-4a2e-afe3-7b70ddc7834c
06bf4140-2643-475f-9290-e68ab65ced72	2025-05-09 21:40:03.902704	MEDIUM	1	5	{Player} comment a heart emoji on the first instagram post you see or drink {sips} sips.	2	\N
1f489588-c944-4efb-987b-cb860447b60a	2025-05-09 21:40:03.903562	MEDIUM	1	4	{Player} name all 10 Commandments. if you fail, drink {sips} sips.	2	\N
235915c8-6c4a-41a7-aa0d-a3bb9facad75	2025-05-09 21:40:03.904365	MEDIUM	1	5	{Player} describe the last time you had sex. If you refuse, drink {sips} sips.	2	\N
885d5a16-3d65-42b4-ac8a-a5d438fbed7c	2025-05-09 21:40:03.904868	EXTREME	2	15	{Player} and {Player2}, take off your clothes and slowly initiate a 69.  Whoever Chickens out first drinks 8 sips. If anyone refuses, both drink {sips} sips.	3	\N
83a244a4-bad2-4180-b836-9d67feed8366	2025-05-09 21:40:03.905423	HARD	2	5	{Player} suck {Player2}'s toes. If anyone refuses, both drink {sips} sips.	3	\N
bfc880c5-0ede-4380-b670-b032b5d277f4	2025-05-09 21:40:03.906364	HARD	2	9	{Player} and {Player2} play 1 minutes in heaven in a small space (closet, for example). If anyone refuses, both drink {sips} sips.	3	\N
e90a43b0-a88d-410c-9d98-f314c62cf3e0	2025-05-09 21:40:03.906867	HARD	2	6	{Player} softly bite {Player2}'s ear and moan. If anyone refuses, both drink {sips} sips.	3	\N
644a5d8b-34ce-4346-a7f4-bfba2081f00b	2025-05-09 21:40:03.907669	HARD	2	6	{Player} pull down {Player2}'s pants and squeeze their ass. If anyone refuses, both drink {sips} sips.	3	\N
64e5d80f-12d4-40a6-96c1-60048fe5d9ec	2025-05-09 21:40:03.908356	EASY	0	5	Who would die first in a zombie apocalypse? Whoever is chosen drinks {sips} sips.	1	\N
52f4c8bf-75d5-45eb-aa6e-0b20e546665b	2025-05-09 21:40:03.911197	HARD	2	4	{Player} give a hicky to {Player2}. If any of you refuse, both drink {sips} sips.	3	\N
d25e6010-04db-4461-9134-02e8fd3fb29b	2025-05-09 21:40:03.912269	HARD	2	6	{Player} kiss {Player2}'s inner thigh. If anyone refuses, both drink {sips} sips.	3	\N
bd369fe9-f676-41e7-b9b3-690c79a4c64c	2025-05-09 21:40:03.912773	EASY	1	3	{Player} wear your socks in your hands for 2 rounds. If you refuse, drink {sips} sips.	2	\N
12ad290e-021a-46cd-aa92-7ddd94498d41	2025-05-09 21:40:03.91351	HARD	2	6	{Player} lick the area right above {Player2}'s genitals. If anyone refuses, both drink {sips} sips.	3	\N
ecb7418c-be70-437c-b1bb-a75c33a31e28	2025-05-09 21:40:03.914189	HARD	2	6	{Player} lick {Player2}'s belly button. If anyone refuses, both drink {sips} sips.	3	\N
97c0164c-ed8e-426b-a7bd-b0472ba189ff	2025-05-09 21:40:03.91478	HARD	2	5	{Player} look into {Player2}'s eyes while sucking on their finger. If anyone refuses, both drink {sips} sips.	3	\N
b08edc3a-f541-4400-8cdf-ebd5a14b1fd7	2025-05-09 21:40:03.915822	HARD	1	4	{Player} name 4 porn stars. If you fail, drink {sips} sips.	2	\N
5facd364-2f77-4535-b5c4-59ec164fe29f	2025-05-09 21:40:03.916343	MEDIUM	1	5	{Player} send a selfie to yor parents with the caption "I'm a unicorn" or drink {sips} sips.	2	\N
7f00ec29-ca0e-4206-90f1-d9ae73a4faa2	2025-05-09 21:40:03.916864	EASY	0	4	Singles drink {sips} sips.	0	\N
2f78c68f-1a1a-460e-adc2-e31c9e4d7ff1	2025-05-09 21:40:03.91737	MEDIUM	2	4	{Player} call someone and convince them that you are doing something illegal and you need their help. {Player2} determines the crime. If you refuse, drink {sips} sips.	2	\N
1a2e58ff-2afa-46be-bcd0-ebd552885e45	2025-05-09 21:40:03.917893	MEDIUM	1	4	{Player} call your mom and tell her you have an STD. If you refuse, drink {sips} sips.	2	\N
8e2bcae9-21e6-41bc-8c2c-2bf50ad1618c	2025-05-09 21:40:03.918418	MEDIUM	1	3	{Player} do a handstand. If you refuse drink {sips} sips. 	2	\N
75caa9f3-d16f-4035-8075-aed63ba81185	2025-05-09 21:40:03.920747	MEDIUM	0	4	If it is your second day in a row drinking, drink {sips} sips.	0	\N
b1447e51-0ca8-4fbf-8d5e-2ed0807f4afd	2025-05-09 21:40:03.921251	EASY	0	2	If you ever owned crocks, drink {sips} sips.	2	\N
f50f51a0-ea78-4dba-9ec3-bfc01b509f9d	2025-05-09 21:40:03.9223	EASY	0	3	If your drinking anything other than beer, drink {sips} sips.	0	\N
01cc0a96-3153-4dcd-b4ed-0600dca1f141	2025-05-09 21:40:03.922822	MEDIUM	1	5	{Player} sing the chorus of a song you've had sex to or drink {sips} sips.	2	\N
ec3442bd-3c3a-4cd9-b915-238089c5bd54	2025-05-09 21:40:03.923363	EXTREME	1	6	{Player} do a handstand for 10s, nude. If you refuse drink {sips} sips.	2	\N
e27aa9c0-467a-4d70-8815-cb2e7a2c1f1a	2025-05-09 21:40:03.923886	HARD	2	6	{Player} massage {Player2}'s nipples. If anyone refuses, both drink {sips} sips.	3	\N
399a4b7e-ea4c-47b3-90d0-ed56c4777f49	2025-05-09 21:40:03.923886	HARD	1	5	{Player} put an ice cube in your underwear. If you refuses, drink {sips} sips.	2	\N
9d511925-9728-479c-a17f-456a89bba1fb	2025-05-09 21:40:03.92541	HARD	1	5	{Player} post a video twerking on social media or drink {sips} sips.	2	\N
acffd36a-12d3-431f-8844-0a2202df7faa	2025-05-09 21:40:03.925932	MEDIUM	0	5	Whoever has sent a nude to the wrong person, drinks {sips} sips.	0	\N
6af2d750-c684-4130-a2a7-7a3691fd81ab	2025-05-09 21:40:03.926472	HARD	2	5	{Player} grab {Player2}'s ass. If anyone refuses, both drink {sips} sips.	3	\N
94d1a187-c73e-4f70-a0be-57266fc0bc47	2025-05-09 21:40:03.926993	MEDIUM	1	3	Everyone guesses {Player}'s battery percentage. The one who is farthest, drinks {sips} sips.	0	\N
27f86760-5a62-4549-b4a0-0c30a8f609bb	2025-05-09 21:40:03.928028	EXTREME	2	9	{Player} take of {Player2}'s underwear with your teeth. If anyone refuses, both drink {sips} sips.	2	\N
7c07e8e8-931a-44eb-a173-c77ece9e9548	2025-05-09 21:40:03.928547	EASY	0	3	Who attended a zoom meeting during quarantine, drink {sips} sips.	0	\N
4b3750aa-0a43-41e2-b095-be6bc4d7aea4	2025-05-09 21:40:03.929065	EASY	0	3	If you enjoy the smell of gasoline, drink {sips} sips.	0	\N
33db28ac-3757-45ac-93d3-63860da77803	2025-05-09 21:40:03.929575	MEDIUM	0	6	If you enjoy the taste of beer, chug a beer or drink {sips} sips.	0	\N
500a3e68-7c3c-4091-919c-28b324523638	2025-05-09 21:40:03.93064	HARD	1	5	{Player} send a selfie to an ex with the caption "I made a mistake" or drink {sips} sips.	2	\N
4b4c4a93-cd10-4db8-8576-151be56319f2	2025-05-09 21:40:03.931186	MEDIUM	0	5	If you bite your nails, drink {sips} sips.	2	\N
4f2f6f55-b568-4b48-9d16-1e1d71a16fce	2025-05-09 21:40:03.931792	MEDIUM	0	3	If the red heart is in you recent emojis, drink {sips} sips.	2	\N
5ea6cc33-6cc9-4907-8f2b-2ac5fe00340d	2025-05-09 21:40:03.932725	HARD	0	1	Who has allergies, drink {sips} sips for every allergy you have.	0	\N
79c25c29-9d07-4da7-9b91-d5b57862b7ae	2025-05-09 21:40:03.933228	MEDIUM	0	3	Drink {sips} sips if you have multiple social media profiles.	0	\N
558932f1-2fa5-4b9c-8bee-85942d60c5c7	2025-05-09 21:40:03.934354	MEDIUM	0	1	Everyone who had braces, drink {sips} sip for every year you had them.	0	\N
ca2e2345-3b58-4d53-b390-be2e3fe29762	2025-05-09 21:40:03.935163	MEDIUM	0	4	Drink {sips} sips if you've made a sex playlist.	2	\N
74195249-28a6-4b27-8f58-945265434ffa	2025-05-09 21:40:03.935666	EASY	0	3	Drink {sips} sips if you've ever been to a sports event.	0	\N
00c83cdc-d677-49de-97d8-0e0da36de848	2025-05-09 21:40:03.936315	EASY	0	3	Drink {sips} sips if you've ever been to a concert.	0	\N
f6ba482d-e3c8-4c25-9a31-cfdfb4bc9a7a	2025-05-09 21:40:03.936995	EASY	0	3	Drink {sips} sips if you've ever been to a music festival.	0	\N
2505cf7c-73c0-436a-8777-8618cdd93af1	2025-05-09 21:40:03.937624	EXTREME	2	13	{Player} and {Player2} hug, naked. {Player2} chooses if he hugs from the front or the back. If anyone refuses, both drink {sips}.	3	\N
fab067aa-552a-473f-8cd1-85c5a902b041	2025-05-09 21:40:03.938664	HARD	1	5	{Player} tell us the kinkiest thing you ever did. If you refuse drink {sips} sips	2	\N
3f5ee8d7-a408-48ad-955d-8ca591e93b25	2025-05-09 21:40:03.940261	EASY	0	3	Drink {sips} sips if you've ever been to a wedding.	0	\N
939a09a2-a9a8-4ff8-89b4-681b98aac5ac	2025-05-09 21:40:03.942372	HARD	1	6	{Player} play the next 3 rounds naked. If you refuse, drink {sips} sips.	2	b99b1a67-2fa5-443b-915a-964e8378006f
52cde166-bd89-454b-a03f-c4f504817581	2025-05-09 21:40:03.943477	EXTREME	2	7	{Player} act out the kinkiest thing you ever did with {Player2}, naked. If anyone refuses, both drink {sips} sips.	3	\N
236b0f9a-1081-440f-bb2e-4b2bfb9bc84f	2025-05-09 21:40:03.944024	EXTREME	2	14	{Player} and {Player2} masturbate each other for 20 seconds. If anyone refuse drink {sips}.	2	\N
8b25fe63-d561-4a57-89f7-343fae7c4915	2025-05-09 21:40:03.94461	HARD	2	10	{Player} give {Player2} a lap dance for 15 seconds or drink {sips} sips.	2	\N
56a16589-3fbf-4aa4-87ce-121639d1690c	2025-05-09 21:40:03.945134	MEDIUM	2	5	{Player} give {Player2} piggyback ride. If you refuse, drink {sips}.	2	\N
f94794ee-27c1-4754-ba8a-3ab9e36df15d	2025-05-09 21:40:03.945658	HARD	1	7	{Player} Take off your underwear for 5 rounds or drink {sips} sips.	2	\N
9236dc3b-efaa-4494-99a7-44b46f60d590	2025-05-09 21:40:03.946699	EXTREME	2	8	{Player} and {Player2} hold each other's penises for the next 3 rounds. If anyone refuses or stops holding before the rounds end, drink {sips} sips.	2	3031fbc7-4d9f-4bc3-a90f-b946104d87a7
4d91f40e-1e64-4c47-9abb-36c9e17cf000	2025-05-09 21:40:03.947221	MEDIUM	0	5	If you've ever had sex in public, drink {sips} sips.	2	\N
33c7728d-0f1a-47e6-91b7-a42a345b8cb8	2025-05-09 21:40:03.948258	EASY	0	3	If you didn't get you drivers license at 18, drink {sips} sips.	2	\N
6f6f1ec5-1ccb-498a-93e6-36db39ec889d	2025-05-09 21:40:03.94879	HARD	1	8	{Player} admit the worst type of porn you've watched. If you refuse, drink {sips}.	2	\N
2a59b2d9-81c8-43f1-98ad-fc89b1ec6ee1	2025-05-09 21:40:03.9493	MEDIUM	0	3	Drink {sips} sips if you have muliple alarms set in the morning.	0	\N
a635609d-955e-4fb1-b6db-0c9176bbe85a	2025-05-09 21:40:03.94982	MEDIUM	1	4	{Player} take off a piece of clothing or drink {sips} sips. No accessories allowed (belts, watches, etc.) and no shoes or socks.	2	\N
6fedef12-e5c6-42bf-aa88-b684358eb812	2025-05-09 21:40:03.95035	EASY	0	2	Drink {sips} sips with your non dominant hand.	0	\N
d39605a9-aec0-4dee-9742-4834226646ac	2025-05-09 21:40:03.951371	MEDIUM	1	7	{Player} drink {sips} sips, the player to their left drinks 6, and so on until you reach 0.	0	\N
e36c355d-569b-4945-8aec-72a3371c322e	2025-05-09 21:40:03.952481	EASY	0	4	If you are holding your drink, drink {sips} sips.	0	\N
0d2ee349-04e3-472f-9b12-ec2229db8f72	2025-05-09 21:40:03.953596	HARD	0	5	If you've had sex in public, drink {sips} times.	0	\N
e20de45f-6bce-4339-baea-5aa80dbd9fc9	2025-05-09 21:40:03.95422	MEDIUM	0	3	If you wear glasses, drink {sips} times	0	\N
bd47970e-c87d-40bf-8f6b-b3ce66b17bce	2025-05-09 21:40:03.954742	HARD	0	4	Drink {sips} times for each player you've seen naked.	0	\N
838cf8ad-51e8-4f4a-b13e-3ac8042d92c8	2025-05-09 21:40:03.95546	MEDIUM	0	4	If you've masturbated today, drink {sips} sips.	0	\N
b0cdbb9e-ee85-47df-90dc-3abd6fc0ce27	2025-05-09 21:40:03.955985	MEDIUM	0	5	Everyone votes for the person the needs an STD test. that person drinks {sips} sips.	1	\N
1995df09-9139-4b3a-afe2-5a5d1f9c0c71	2025-05-09 21:40:03.957029	MEDIUM	0	4	If you have skinny dipped, drink {sips} sips.	0	\N
d270a32b-4001-4633-aa51-5de9023aba3a	2025-05-09 21:40:03.957563	MEDIUM	0	5	The player who has vomited in the worst place drinks {sips} sips.	1	\N
9b2465eb-81ed-4d9d-a39d-26ded5888266	2025-05-09 21:40:03.958622	MEDIUM	1	9	{Player} play the telephone game. If the wrong message reaches you, everyone but you drinks {sips} sips. if it is correct, you drink {sips}.	0	\N
db1af807-272f-407b-9858-9ec14131473b	2025-05-09 21:40:03.959145	HARD	0	4	If you had sex more than 3 times in 1 night, drink {sips} sips.	0	\N
5d223d1d-1c45-460f-8529-9d83137e35ae	2025-05-09 21:40:03.959655	EASY	0	5	Boys drink {sips} sips.	0	\N
3d1e2de1-fe63-452e-bed0-9b79e1bdc585	2025-05-09 21:40:03.960795	MEDIUM	2	6	{Player} give {Player2} free access to your phone for 1 minutes or drink {sips} sips. If he asks for a password and you refuse, drink 11 sips.	2	\N
2c18537b-3d07-4cc2-a278-f1fa880843e0	2025-05-09 21:40:03.961354	MEDIUM	0	2	Drink {sips} times for each button on your shirt	0	\N
2e48cfc1-a5aa-47d4-9a5c-89845b2d89d2	2025-05-09 21:40:03.961877	MEDIUM	0	3	If you have ever vomited on public transports, drink {sips} sips.	0	\N
1c624459-5db0-4990-8f89-257ec8ddffd7	2025-05-09 21:40:03.96302	MEDIUM	1	5	{Player} wear your clothes inside out for 5 rounds, or drink {sips} sips.	2	\N
335f7805-d969-4144-b0ca-647d018bb91f	2025-05-09 21:40:03.963577	HARD	1	5	{Player} from now on, you must loudly read all messages you receive on your phone. If you refuse, drink {sips} sips for each message.	2	\N
3a02bd86-e618-4148-a830-16369f27e6db	2025-05-09 21:40:03.964162	MEDIUM	0	5	If you've ever had memory loss due to alcohol, drink {sips} sips.	0	\N
3ffbfec6-adc9-46e0-bb59-0798b291abb0	2025-05-09 21:40:03.964685	EASY	1	4	{Player} try to lick your nose, if you fail, drink {sips} sips.	2	\N
d448d150-f166-42a8-a20c-72e521fe056e	2025-05-09 21:40:03.965205	EXTREME	1	18	{Player} masturbate for 35 seconds in front of the group, nude. The group can choose various speeds. Or drink {sips} sips.	2	\N
2521636b-8503-40c6-b101-e45ecddba01c	2025-05-09 21:40:03.967329	EXTREME	2	12	{Player} and {Player2} jerk each other simultaneously for the next 4 rounds. If anyone refuses, drink {sips} sips.	2	1aa94721-5ce2-4f6d-9b2e-7c8d5a3e70f4
ff9ab1f2-8d3d-4283-9148-ce5b4961a20f	2025-05-09 21:40:03.967851	EASY	2	4	{Player} unzip {Player2}'s zipper. Or drink {sips} sips.	2	\N
422e98df-05c7-4bb7-84db-32d2bbee4a7b	2025-05-09 21:40:03.968371	HARD	1	5	{Player} strip to your underwear and dance for 30 seconds. Refusal equals {sips} sips.	2	\N
67414741-d9bc-4b61-b97c-8011844a2e84	2025-05-09 21:40:03.968971	MEDIUM	0	3	Drink {sips} sips if you've ever had sex on a beach.	0	\N
52bc6a81-eca7-4894-9971-8ba343107218	2025-05-09 21:40:03.969481	MEDIUM	0	5	If you have ever dropped a phone in the toilet, drink {sips} sips.	0	\N
6f4de50e-40f4-41de-a181-e8c00f8ac004	2025-05-09 21:40:03.971453	EXTREME	2	13	{Player} taste {Player2}'s pre-cum. If anyone refuses, drink {sips} sips.	2	\N
089dc5f4-3106-46a2-bd0d-10266885e984	2025-05-09 21:40:03.971974	MEDIUM	0	4	If you have your nipples out, drink {sips} sips.	2	\N
be5dd658-22d6-4c88-9981-526be74e1ed3	2025-05-09 21:40:03.972494	EASY	0	3	Whoever has the largest hands, drink {sips} sips.	2	\N
e4f3c881-cd29-442e-81e6-a8577430bcdb	2025-05-09 21:40:03.973023	EASY	0	5	The person with the messiest hair drinks {sips} sips.	2	\N
f767857f-8aae-49a4-a183-e16aa7938aef	2025-05-09 21:40:03.973542	MEDIUM	0	5	If you've ever stood someone up, drink {sips}.	2	\N
1343e5b5-a969-448b-be2b-19bb118a473e	2025-05-09 21:40:03.974117	EASY	0	5	The person with the shortest hair drinks {sips} sips.	2	\N
f38e7ef9-61fa-45f9-89af-31429861a536	2025-05-09 21:40:03.974636	EASY	0	5	Whoever last used the bathroom must drink {sips} sips.	0	\N
c7009d1a-9640-44bf-a58d-def033f62e04	2025-05-09 21:40:03.975156	HARD	1	6	{Player} twerk for 15 seconds or drink {sips} sips.	2	\N
8870cb71-2da0-4ea0-8d5d-e3c138ff1985	2025-05-09 21:40:03.975677	MEDIUM	1	5	{Player} blindfold yourself and guess the object someone places in your hand. Failure equals {sips} sips.	2	\N
18f36d43-f5e7-4fd7-beb0-27a09ff94328	2025-05-09 21:40:03.976197	MEDIUM	1	4	{Player} do a cartwheel or drink {sips} sips.	2	\N
a4b9fac8-51fa-4542-ac45-2d81ac934632	2025-05-09 21:40:03.976717	EASY	0	5	Whoever has the most apps open on their phone drinks {sips} sips.	0	\N
ac6409d4-d47b-4ec8-bd10-e95c4c0b3df7	2025-05-09 21:40:03.977236	EXTREME	1	13	{Player} do 10 jumping jacks nude or drink {sips} sips.	2	\N
22f13772-95a9-4ef3-9e4b-4e56d031a961	2025-05-09 21:40:03.977755	EASY	2	3	{Player} imitate {Player2}'s laugh or drink {sips} sips.	2	\N
fde79ba5-7434-44ee-b519-200b8f5f9f71	2025-05-09 21:40:03.978276	EASY	0	5	Whoever has the oldest phone must drink {sips} sips.	2	\N
0897f319-f5f4-4857-89de-9209e439677b	2025-05-09 21:40:03.978796	HARD	1	6	{Player} show the group your last Google search or drink {sips} sips.	2	\N
32f84692-3774-405f-884a-789540a1001f	2025-05-09 21:40:03.979828	MEDIUM	2	4	{Player} and {Player2} swap shoes for the next 2 rounds or both drink {sips} sips.	3	e2c42549-5114-439d-9616-1bb2a162871c
c8801451-9277-4af2-a4f9-efa17a44705a	2025-05-09 21:40:03.980347	HARD	1	5	{Player} let the group write a text to your mom or drink {sips} sips.	2	\N
d16ec79a-bcd1-49d6-b967-85af8845d2de	2025-05-09 21:40:03.980651	HARD	1	6	{Player} call an ex and ask how they're doing, or drink {sips} sips.	2	\N
25f8ab3b-213d-4130-9ed9-2e5a6cfe8d85	2025-05-09 21:40:03.981153	EASY	0	5	Whoever has the most unread texts drinks {sips} sips.	1	\N
70375035-10e3-4fb8-9fed-2dbe7037557d	2025-05-09 21:40:03.981676	MEDIUM	1	4	{Player} impersonate another player until someone guesses who it is, or drink {sips} sips.	2	\N
aac9dafe-aa31-4789-b72a-ffa3f52a3878	2025-05-09 21:40:03.982199	EASY	0	5	Whoever has the most photos on their phone drinks {sips} sips.	1	\N
c16774c2-c28e-4531-8c5f-82754e5ce8ec	2025-05-09 21:40:03.982717	MEDIUM	1	4	{Player} let the group look at your last DM or drink {sips} sips.	2	\N
318291a5-3a8f-4dd3-b389-e337d8e0c702	2025-05-09 21:40:03.983761	MEDIUM	1	5	{Player} name five porn stars or drink {sips} sips.	2	\N
cab3e144-af83-4383-bf0c-c568901830bb	2025-05-09 21:40:03.984274	EASY	0	5	Girls drink {sips} sips.	0	\N
c915ccb9-d966-40ad-998e-52aad24c35d6	2025-05-09 21:40:03.9848	EASY	0	5	Whoever has the least battery on their phone drinks {sips} sips.	0	\N
fa0924ee-9953-4c0b-b1c8-44c2712c5e72	2025-05-09 21:40:03.986689	EASY	0	3	If you have ever been pulled over, drink {sips} sips.	0	\N
9d95a33c-e46a-42bd-8558-6e26c32e9313	2025-05-09 21:40:03.987211	EASY	0	5	Whoever has the longest hair drinks {sips} sips.	2	\N
b517032b-e37f-48d3-bf96-b45012923ffb	2025-05-09 21:40:03.98774	HARD	1	5	{Player} do a split or drink {sips} sips.	2	\N
dab5039d-38e8-4b26-aa75-a41a66cc8f56	2025-05-09 21:40:03.989294	HARD	2	8	{Player} wear {Player2}'s underwear on your head for 3 rounds or drink {sips} sips.	2	227a3d02-5376-4841-9e9b-2eedb3baba09
28e5d2bb-ba96-4565-af6e-2e7bd223617b	2025-05-09 21:40:03.989844	HARD	1	6	{Player} post “I'm in love” on social media or drink {sips} sips.	2	\N
e8ec4c52-8513-473f-891d-4b6178b334d5	2025-05-09 21:40:03.990671	HARD	2	6	{Player} and {Player2} recreate a romantic movie scene or both drink {sips} sips.	3	\N
07b5ca33-2307-4cf9-ba3c-bbcf4cc55ec0	2025-05-09 21:40:03.991179	EASY	0	5	Whoever has the dirtiest shoes drinks {sips} sips.	1	\N
50fc05cc-5bbd-46c1-a448-7ea2c2d6e604	2025-05-09 21:40:03.991715	EASY	0	5	The first person to laugh drinks {sips} sips.	2	\N
a5bf7ded-83b4-469c-9c47-8b3ea68744a7	2025-05-09 21:40:03.992238	EASY	0	5	Whoever has been single the longest drinks {sips} sips.	1	\N
8bdde1e6-1bda-4690-9da1-4125f321402f	2025-05-09 21:40:03.993278	MEDIUM	2	4	{Player} kiss {Player2}'s hand or both drink {sips} sips.	2	\N
6342a9e2-d746-4835-b01e-7ee7e4e2f619	2025-05-09 21:40:03.993851	MEDIUM	1	6	{Player} take off your shirt and wear it on your head for 3 rounds or drink {sips} sips.	2	\N
5388502a-9a86-46f8-b79a-5db82aa78d54	2025-05-09 21:40:03.994432	EXTREME	2	7	{Player} take a body shot off {Player2}'s genitals or both drink {sips} sips.	2	\N
cc1619b6-7e97-42de-b8cb-c212637e717b	2025-05-09 21:40:03.994953	EASY	0	5	Whoever has the most unread emails drinks {sips} sips.	0	\N
696c315a-a958-47be-a0a3-12fc5ab60101	2025-05-09 21:40:03.995474	EASY	0	5	Whoever has been the drunkest in the last month drinks {sips} sips.	1	\N
24f6c69a-224c-4a62-b8ec-d5f91933f63c	2025-05-09 21:40:03.995995	HARD	1	8	{Player} flash the group for 3 seconds or drink {sips} sips.	2	\N
4c3c96a7-a9dd-44b9-a369-d1020e2b972b	2025-05-09 21:40:03.996516	EASY	0	5	Whoever has the least amount of contacts on their phone drinks {sips} sips.	2	\N
b7423782-8ce1-47a2-9b3a-c729fe5ec7ec	2025-05-09 21:40:03.997568	EASY	0	5	Whoever has the messiest room drinks {sips} sips.	0	\N
9651bcb2-43ad-4170-8274-599ba6354600	2025-05-09 21:40:03.998087	MEDIUM	2	5	{Player} and {Player2} have a staring contest. Loser drinks {sips} sips.	2	\N
3c554775-e896-42cc-9256-07092f706a06	2025-05-09 21:40:03.998606	EASY	0	5	Whoever has the most recent selfie on their phone drinks {sips} sips.	0	\N
d3853dfd-f3bd-4f7c-94c9-25eb1d54e665	2025-05-09 21:40:03.999637	MEDIUM	1	5	{Player} attempt to juggle three objects. Failure equals {sips} sips.	2	\N
146748ce-5b9c-419e-949c-172024699695	2025-05-09 21:40:04.000168	MEDIUM	1	4	{Player} balance an object on your head for 30 seconds or drink {sips} sips.	2	\N
041c7601-ab86-4a9a-8fdf-54d494b578cf	2025-05-09 21:40:04.001587	EASY	0	5	Whoever is the first to blink drinks {sips} sips.	0	\N
94f2b7dd-f7c0-4dea-96f8-adbf651969f9	2025-05-09 21:40:04.002111	HARD	2	12	{Player} let the group choose a body part for {Player2} to lick or both drink {sips} sips.	2	\N
e7ea78a7-e89a-4fda-903f-78cdecf44166	2025-05-09 21:40:04.003144	HARD	1	8	{Player} put on your underwear over your pants for 5 rounds or drink {sips} sips.	2	11740aa4-c3bc-4713-b665-b2bb6d90c33b
4aa12ffd-0330-431d-8bf0-b9a2914f347d	2025-05-09 21:40:04.003654	MEDIUM	1	6	{Player} pretend you're in a TV commercial selling a random object nearby or drink {sips} sips.	2	\N
25b30555-5edc-48e0-a165-d0a5f66aa532	2025-05-09 21:40:04.004687	HARD	2	9	{Player} and {Player2} strip down to your underwear for the next 3 rounds or both drink {sips} sips.	3	13b04e02-7acc-42a4-8681-784dde73f29c
562359b2-0b9c-4fd9-a89b-d665d7f57726	2025-05-09 21:40:04.005716	EXTREME	1	10	{Player} do 10 naked push-ups or drink {sips} sips.	2	\N
79d4a6c2-f0cb-4b5b-98aa-14e39f2169ae	2025-05-09 21:40:04.006228	MEDIUM	1	10	{Player} take a sip of every player's drink or drink {sips} sips.	2	\N
8409ac08-8435-4bcf-ad3c-df67471c51a5	2025-05-09 21:40:04.006739	MEDIUM	2	5	{Player} and {Player2} have a trivia competition. Whoever answers incorrectly drinks {sips} sips.	2	\N
a3cdb5de-2ce9-4c2c-b2ac-847798e0f6a4	2025-05-09 21:40:04.007256	EASY	2	3	{Player} try to guess {Player2}'s favorite food. If you guess wrong, drink {sips} sips.	2	\N
d7a13c0e-909b-445d-9a0f-fc2ad905423f	2025-05-09 21:40:04.007771	EASY	2	3	{Player} try to guess the capital of a country chosen by {Player2}. If you get it wrong, drink {sips} sips.	2	\N
52027502-423a-41cc-a7ca-3deafa089758	2025-05-09 21:40:04.00829	MEDIUM	2	5	{Player} and {Player2} have a dance-off. If anyone refuses, drink {sips} sips.	2	\N
dd659c5a-a73c-46ea-bbd6-eedf712bfaaf	2025-05-09 21:40:04.009313	MEDIUM	2	4	{Player} and {Player2} have a round of truth or dare. The one who dares the other must also perform the dare if requested, or drink {sips} sips.	2	\N
69d041ee-aab0-481f-8060-d51a3184ce4e	2025-05-09 21:40:04.009835	EASY	1	3	{Player}, name a food you can't stand. Drink {sips} sips if someone else likes it.	2	\N
9ca3be5a-f3fd-4594-8a50-f6eae8d3b15d	2025-05-09 21:40:04.010349	MEDIUM	2	4	{Player} do a trust fall into the arms of {Player2}. If you refuse, drink {sips} sips.	2	\N
4f008225-86e7-4e06-b68b-1837e960f4d2	2025-05-09 21:40:04.011406	EXTREME	2	14	{Player} do a photoshoot to a nude {Player2}'s dick. Take at least 3 photos, from different angles. You can only erase them at the end of the game. If you refuse, drink {sips} sips.	2	\N
f57f2b91-1827-4995-afb5-b0376c6cd277	2025-05-09 21:40:04.011918	EXTREME	2	17	{Player} act like a doctor and inspect a nude {Player2}'s genitals. Touch them at least twice for 3 seconds. If anyone refuses, both drink {sips} sips.	2	\N
3820531e-300a-441b-8d63-a2d6cad8a3e4	2025-05-09 21:40:04.012436	EXTREME	2	9	{Player} do a prostate massage on a nude {Player2}. If anyone refuses, both drink {sips} sips.	3	\N
e28667da-3967-40d8-9932-ac61d0afad87	2025-05-09 21:40:04.012949	HARD	1	8	{Player} call your mom and tell her you're pregnant (or got someone pregnant) or drink {sips} sips.	2	\N
36699bce-6842-4c02-ae3d-ce6c5223f685	2025-05-09 21:40:04.013465	EXTREME	2	18	{Player} pretend a nude {Player2}'s dick is a microphone and sing a tune (grab it like a microphone). If anyone refuses, both drink {sips} sips.	3	\N
717fd9d0-0df5-4bd3-b70b-7bdaa22b7d5d	2025-05-09 21:40:04.013976	EXTREME	2	13	{Player} act like your in a car and a nude {Player2}' dick is gear shifter and go for a drive. If anyone refuses, both drink {sips} sips.	3	\N
01e9818d-706d-4b8c-835c-c08022c2fc15	2025-05-09 21:40:04.015009	EXTREME	2	14	{Player} do a footjob on {Player2}, both nude.  Whoever Chickens out first drinks {sips} sips. If anyone refuses, both drink {sips} sips.	3	\N
128754ef-3427-4eff-8cf3-426646b7d2da	2025-05-09 21:40:04.015527	EXTREME	3	19	{Player2} dip the tip of your penis in {Player}'s drink. {Player} lick it off. If anyone refuses, both drink {sips} sips.	3	\N
8fe74b2e-256b-41a0-acb1-1878e1c24ac7	2025-05-09 21:40:04.01604	EXTREME	2	8	{Player} pretend a nude {Player2}'s dick is a lollipop and lick it. If anyone refuses, both drink {sips} sips.	3	\N
c960af60-2cbb-474e-93ad-a5b5adf8e730	2025-05-09 21:40:04.01604	MEDIUM	0	5	Never have i ever used a random object to masturbate. Who has drinks {sips} sips.	0	\N
af930493-88d8-43af-8ebd-76e2dba740b6	2025-05-09 21:40:04.017266	EASY	0	5	Vote on who has the most innocent face. That person drinks {sips} sips.	1	\N
fc3b000a-f3bb-427b-ad24-b1e70217a2fc	2025-05-09 21:40:04.018293	HARD	0	7	Strip to your underwear for 5 rounds. Or drink {sips} sips	0	327a66f2-9d86-4cd3-a9d2-794e64910632
2afc3707-ea8b-4c33-9713-a7239d9ce492	2025-05-09 21:40:04.01933	MEDIUM	0	4	Drink {sips} sips for each big lie you told. Drink {sips} more if you don't want to share it.	0	\N
01c91b80-e26b-4f6a-a5bd-497b36713817	2025-05-09 21:40:04.021012	MEDIUM	0	7	Send 1€ to the person to your right, or drink {sips} sips.	0	\N
048a21a0-ef64-40a4-ac32-8904d1f34a3a	2025-05-09 21:40:04.022163	HARD	1	8	{Player} show a nude saved on your phone, or drink {sips} sips.	2	\N
b47a1a64-c152-4459-aa0c-d52d8ca52cf2	2025-05-09 21:40:04.022679	MEDIUM	0	6	Send 5€ to the person to your left, or drink {sips} sips.	0	\N
ce633a69-48ab-41d1-9d5d-ec296c541e2b	2025-05-09 21:40:04.023191	MEDIUM	1	7	{Player}, what was your proudest moment during sex? Share with us, and everyone takes 2 sips. Or drink {sips} and keep it to yourself.	2	\N
6ca9fb5c-fb0b-4bb9-bb68-82d0d5baf46d	2025-05-09 21:40:04.024788	EASY	0	3	For the next 30 rounds, no one is allowed to say 'no'. If you do, drink {sips} sips for each time.	2	f4032991-164e-4bb1-9696-2e4874785bec
6eeab334-4c98-472d-9ff3-65be1a64b73d	2025-05-09 21:40:04.02531	EASY	0	5	Vote on who has the most naughty face. That person drinks {sips} sips.	1	\N
80685129-30b9-4b1d-9be4-8be06f93786b	2025-05-09 21:40:04.026847	HARD	1	15	{Player} take off 3 piece of clothing or drink {sips} sips. No accessories allowed (belts, watches, etc.) and no shoes. Stay that way for the next 8 rounds. No covering up, otherwise drink 5 sips for each time caught.	2	533a1ca7-f3cb-4bbe-b2e6-810ef2171490
91dee1d8-686e-4f14-be2d-05b5f264cf19	2025-05-09 21:40:04.027363	MEDIUM	0	5	Vote on who is wearing the worst outfit. He or She drinks {sips}	1	\N
cbcfc013-0fb6-454f-a02a-af2ad88f3919	2025-05-09 21:40:04.028903	MEDIUM	1	6	{Player} for the next 10 rounds, whoever insults you has to drink {sips} sips for each insult.	2	7704d76f-cfbb-45d6-b5ac-5474745eae14
3a6d2d65-da84-4b92-9cd2-b0ba2ab28ebf	2025-05-09 21:40:04.029415	EXTREME	2	14	{Player} play 2 minutes in heaven with {Player2}, in a tight space. Undress fully before entering. Do this or both drink {sips} sips.	3	\N
7a803a8c-976d-449b-9b99-8c3547cb154d	2025-05-09 21:40:04.029934	HARD	2	9	{Player}, pick a sex scene and imitate it with {Player2}. If any refuse, both drink {sips} sips.	3	\N
33bf7364-9b74-42bd-acf4-89a6324e634a	2025-05-09 21:40:04.030448	EXTREME	1	14	{Player} get naked and show the group how to fuck an object of you choosing for 35 seconds. Or drink {sips} sips.	2	\N
fa3a15c1-bd9f-441f-9cb8-9670c0ced0ff	2025-05-09 21:40:04.030967	HARD	2	11	{Player} play 2 minutes in heaven with {Player2}, in a tight space. Do this or both drink {sips} sips.	3	\N
d779db7b-97f2-4b74-9f22-ea07f0487105	2025-05-09 21:40:04.03148	MEDIUM	1	6	{Player} pick 2 players that you would invite to a threesome, or drink {sips} sips.	2	\N
cc980fdb-bfd8-4251-8810-c07ff762d94c	2025-05-09 21:40:04.032756	MEDIUM	1	5	{Player} Never have i ever... Who has drinks {sips} sips.	0	\N
9b3f6440-cd46-4905-ba36-5dd324905bd6	2025-05-09 21:40:04.033279	HARD	2	9	{Player} swap underwear with {Player2} for 7 rounds or both drink {sips} sips.	3	\N
3e22a5df-8cc8-41d9-bb91-7a1fd585fb4b	2025-05-09 21:40:04.0338	EXTREME	2	19	{Player} suck a nude {Player2}'s balls for 10 seconds. If anyone refuses, drink {sips} sips.	2	\N
328f9788-b71e-4700-9d0b-963d3f2b49c3	2025-05-09 21:40:04.034833	EXTREME	3	13	{Player} feel {Player2}'s dick inside his underwear for 10 seconds. Try to guess the size. If you get it right, {Player2} drinks 16. If anyone refuses, both drink {sips} sips.	2	\N
35d511b3-dcd5-4c3d-86cc-2c3fc62209e9	2025-05-09 21:40:04.035433	EASY	0	4	Drink {sips} sips if you have a gym membership that you dont use.	0	\N
7aa921ab-035f-4cd1-a27a-b574c7f85ebe	2025-05-09 21:40:04.035953	HARD	1	8	{Player} choose another player to kiss you, the player chooses where. Or drink {sips} sips. 	2	\N
8a245acd-458b-40a5-93fd-179b74e7bd6c	2025-05-09 21:40:04.036983	MEDIUM	1	9	{Player} take off you pants. Or drink {sips} sips.	2	\N
27b205e3-5c6a-4e4f-90d6-46ce6d174803	2025-05-09 21:40:04.037497	HARD	1	6	{Player} ask another player a question about yourself. If he/she answers it right, remove a piece of clothing. If not, the player takes off a piece of clothing and drinks {sips}. 	2	\N
1448c771-cf81-4e9e-928d-9900898a04cd	2025-05-09 21:40:04.038014	MEDIUM	1	7	{Player} describe to us your best orgasm. Who was it with? Or drink {sips} sips. 	2	\N
178b940c-d34a-4bfe-ba46-9a7d9c97794e	2025-05-09 21:40:04.039553	MEDIUM	1	6	{Player} wear your pants on your head for 4 rounds. Or drink {sips} sips.	2	7b7da42c-b658-4c93-b4d7-2ebb84dcdfbf
4ca2a59f-f278-47f4-b5f3-16c3a82f39ae	2025-05-09 21:40:04.040072	EXTREME	1	17	{Player} masturbate in front of the group for 15 seconds, nude. If you refuse drink {sips} sips or a shot.	2	\N
14ecfc13-ce3b-4b2a-850f-c4c3b2773ec6	2025-05-09 21:40:04.040588	EASY	2	5	{Player} and {Player2} race to finish your drink. The loser drinks another {sips} sips.	2	\N
441222bb-3684-4ac7-bbdc-830579db84d2	2025-05-09 21:40:04.042687	EXTREME	2	16	{Player} go under the table and masturbate/oral on {Player2} for the next 5 rounds. If you refuse, both drink {sips} sips.	3	fdffb5ce-d8c0-4b94-90fd-9a4331064557
be03a180-59d2-4ef5-89f6-76a8f9aa63d1	2025-05-09 21:40:04.043205	EXTREME	2	15	{Player} next time you go to the bathroom, {Player2} holds your genitals. If anyone refuses, both drink {sips} sips.	2	\N
b4a88185-4e4f-4682-871e-3309390df553	2025-05-09 21:40:04.043721	EXTREME	2	13	{Player} and {Player2} who can do more nude pushups? whoever does less drinks {sips} sips.	2	\N
2c9c978f-63ff-4b97-96a3-cb8c46e6a723	2025-05-09 21:40:04.045271	EXTREME	2	13	{Player} and {Player2} player rock paper scissors until one of you is fully nude (the loser removes one piece of clothing per round). Stay like that for the next 5 rounds. If anyone refuses, both drink {sips} sips.	3	f790d967-7115-4bb7-9fe4-6a74ed6f8e25
d3609065-8b75-46de-9c0d-2d82d8e01900	2025-05-09 21:40:04.045784	EXTREME	0	14	{Player} do as many naked pushups as you can (min 5). {Player2} lie face up and with you mouth open under {Player}'s dick. If you refuse, both drink {sips} sips.	3	\N
\.


--
-- Data for Name: penalties; Type: TABLE DATA; Schema: public; Owner: drinkster
--

COPY public.penalties (id, created_at, rounds, text) FROM stdin;
f57d56d2-68e3-4367-b458-e1174397dc59	2025-05-09 21:40:03.897902	4	Rest your head on nude {Player2}'s genitalia.
43b07000-cd59-4a2e-afe3-7b70ddc7834c	2025-05-09 21:40:03.900792	3	Get nude
b99b1a67-2fa5-443b-915a-964e8378006f	2025-05-09 21:40:03.94132	3	Get nude
3031fbc7-4d9f-4bc3-a90f-b946104d87a7	2025-05-09 21:40:03.946179	3	{Player} and {PLayer2}, hold each other's penises.
1aa94721-5ce2-4f6d-9b2e-7c8d5a3e70f4	2025-05-09 21:40:03.966266	4	{Player} and {Player2} jerk each other.
e2c42549-5114-439d-9616-1bb2a162871c	2025-05-09 21:40:03.978796	2	{Player} and {Player2} swap shoes.
227a3d02-5376-4841-9e9b-2eedb3baba09	2025-05-09 21:40:03.988785	3	{Player} wear {Player2}'s underwear on your head.
11740aa4-c3bc-4713-b665-b2bb6d90c33b	2025-05-09 21:40:04.002626	5	Your underwear over pants.
13b04e02-7acc-42a4-8681-784dde73f29c	2025-05-09 21:40:04.004175	3	{Player} and {Player2} strip down to your underwear.
327a66f2-9d86-4cd3-a9d2-794e64910632	2025-05-09 21:40:04.017779	5	Strip to your underwear.
f4032991-164e-4bb1-9696-2e4874785bec	2025-05-09 21:40:04.024271	30	 No one is allowed to say 'no'.
533a1ca7-f3cb-4bbe-b2e6-810ef2171490	2025-05-09 21:40:04.026336	8	{Player} -3 pieces of clothing. No covering up
7704d76f-cfbb-45d6-b5ac-5474745eae14	2025-05-09 21:40:04.028392	0	Whoever insults you has to drink.
7b7da42c-b658-4c93-b4d7-2ebb84dcdfbf	2025-05-09 21:40:04.039041	4	Wear your pants on your head.
fdffb5ce-d8c0-4b94-90fd-9a4331064557	2025-05-09 21:40:04.041653	5	Under the table sexual act on {Player2}
f790d967-7115-4bb7-9fe4-6a74ed6f8e25	2025-05-09 21:40:04.044758	5	Stay as you are clothing-wise.
\.


--
-- Name: challenge_sexes challenge_sexes_pkey; Type: CONSTRAINT; Schema: public; Owner: drinkster
--

ALTER TABLE ONLY public.challenge_sexes
    ADD CONSTRAINT challenge_sexes_pkey PRIMARY KEY (challenge_id, player_index);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: drinkster
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: penalties penalties_pkey; Type: CONSTRAINT; Schema: public; Owner: drinkster
--

ALTER TABLE ONLY public.penalties
    ADD CONSTRAINT penalties_pkey PRIMARY KEY (id);


--
-- Name: challenges uktinh0v1w5vb0tuwucw91wp6mq; Type: CONSTRAINT; Schema: public; Owner: drinkster
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT uktinh0v1w5vb0tuwucw91wp6mq UNIQUE (penalty_id);


--
-- Name: challenge_sexes fk5ws3umq54dycs8dh3ysk6jjd7; Type: FK CONSTRAINT; Schema: public; Owner: drinkster
--

ALTER TABLE ONLY public.challenge_sexes
    ADD CONSTRAINT fk5ws3umq54dycs8dh3ysk6jjd7 FOREIGN KEY (challenge_id) REFERENCES public.challenges(id);


--
-- Name: challenges fkn2ominypdbyyp4w9a056kbuf4; Type: FK CONSTRAINT; Schema: public; Owner: drinkster
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT fkn2ominypdbyyp4w9a056kbuf4 FOREIGN KEY (penalty_id) REFERENCES public.penalties(id);


--
-- PostgreSQL database dump complete
--

