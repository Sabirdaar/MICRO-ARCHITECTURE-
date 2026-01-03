--
-- PostgreSQL database dump
--

\restrict ieoyybPNU53V7ogYTI6sFs5piFd1sPc1vzYeIgNoKJvHUGWy4JSbDvTUcH3vKiv

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying,
    description character varying,
    price double precision,
    stock integer,
    image character varying,
    category_id integer
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
1	electronics
2	Clothing
3	Home
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, stock, image, category_id) FROM stdin;
7	Sony WH-1000XM5 Wireless Headphones	Industry-leading noise canceling wireless headphones with premium sound quality, 30-hour battery life, and multipoint connection.	399.99	45	https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500	1
9	Apple iPad Air 11-inch	Powerful tablet with M2 chip, stunning Liquid Retina display, all-day battery life, and support for Apple Pencil Pro.	599	32	https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500	1
10	Logitech MX Master 3S Wireless Mouse	Premium wireless mouse with ultra-fast scrolling, 8K DPI sensor, quiet clicks, and USB-C quick charging.	99.99	78	https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500	1
11	Samsung 970 EVO Plus 1TB NVMe SSD	High-performance internal SSD with read speeds up to 3,500 MB/s, perfect for gaming and content creation.	89.99	120	https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500	1
12	Mechanical Gaming Keyboard RGB	Full-size mechanical keyboard with Cherry MX switches, customizable RGB lighting, and programmable macro keys.	129.99	56	https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500	1
13	Anker PowerCore 20000mAh Power Bank	High-capacity portable charger with dual USB ports, fast charging technology, and compact design.	49.99	95	https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500	1
14	Webcam 1080p Full HD	Professional webcam with auto-focus, built-in dual microphones, and wide-angle lens for video conferencing.	79.99	63	https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=500	1
15	USB-C Hub Multiport Adapter	7-in-1 USB-C hub with HDMI 4K output, USB 3.0 ports, SD card reader, and 100W power delivery pass-through.	45.99	142	https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500	1
16	Wireless Earbuds Pro	Premium true wireless earbuds with active noise cancellation, 24-hour battery life, and IPX4 water resistance.	149.99	88	https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500	1
17	Portable Bluetooth Speaker	Waterproof portable speaker with 360-degree sound, 12-hour playtime, and built-in microphone for calls.	69.99	71	https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500	1
18	Classic Denim Jacket	Timeless blue denim jacket with button closure, chest pockets, and comfortable fit. Perfect for layering in any season.	79.99	54	https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500	2
19	Cotton White T-Shirt	Premium 100% organic cotton crew neck t-shirt. Soft, breathable, and perfect for everyday wear.	24.99	156	https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500	2
20	Hooded Pullover Sweatshirt	Comfortable fleece-lined hoodie with kangaroo pocket, drawstring hood, and ribbed cuffs. Perfect for casual wear.	49.99	92	https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500	2
21	Striped Cotton Polo Shirt	Classic polo shirt with horizontal stripes, ribbed collar, and two-button placket. Breathable and stylish.	39.99	68	https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500	2
22	Distressed Blue Jeans	Modern fit jeans with distressed details, faded wash, and comfortable stretch denim. Five-pocket styling.	89.99	73	https://images.unsplash.com/photo-1542272604-787c3835535d?w=500	2
23	Wool Blend Coat	Elegant double-breasted coat in charcoal grey. Wool blend fabric with satin lining and side pockets.	249.99	18	https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500	2
24	Athletic Track Pants	Sporty joggers with elastic waistband, zippered pockets, and tapered fit. Moisture-wicking fabric.	44.99	105	https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500	2
25	Plaid Flannel Shirt	Soft brushed flannel shirt in red and black plaid pattern. Button-down collar and chest pocket.	54.99	61	https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500	2
26	V-Neck Sweater	Classic v-neck pullover sweater in navy blue. Soft merino wool blend, ribbed hem and cuffs.	69.99	46	https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500	2
27	Graphic Print T-Shirt	Trendy oversized t-shirt with unique graphic print. 100% cotton, crew neck, and relaxed fit.	29.99	134	https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500	2
28	Bomber Jacket	Stylish bomber jacket with ribbed collar and cuffs, zip closure, and lightweight nylon shell.	119.99	35	https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500	2
29	Modern Table Lamp	Elegant brass table lamp with fabric shade, perfect for bedside or desk. Includes energy-efficient LED bulb.	89.99	42	https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500	3
30	Decorative Throw Pillows Set	Set of 2 velvet throw pillows with geometric patterns. Soft filling and hidden zipper. Size: 18x18 inches.	34.99	127	https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500	3
31	Ceramic Vase Set	Set of 3 modern ceramic vases in different sizes. Matte white finish, perfect for fresh or dried flowers.	45.99	68	https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500	3
32	Wooden Wall Clock	Minimalist wall clock with natural wood frame and silent quartz movement. Diameter: 12 inches.	39.99	85	https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500	3
33	Soft Area Rug	Plush shag area rug in light grey. Non-slip backing, machine washable. Size: 5x7 feet.	129.99	34	https://images.unsplash.com/photo-1600166898405-da9535204843?w=500	3
34	Scented Candle Collection	Set of 3 premium soy wax candles in glass jars. Vanilla, lavender, and sandalwood scents. 40-hour burn time.	42.99	156	https://images.unsplash.com/photo-1602874801006-95e39a4c33c5?w=500	3
35	Storage Basket Set	Handwoven seagrass storage baskets, set of 3. Natural finish with handles. Great for organizing.	54.99	91	https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500	3
36	Floor Standing Mirror	Full-length leaning mirror with metal frame in black finish. Size: 65x22 inches. Perfect for bedroom or entryway.	159.99	19	https://images.unsplash.com/photo-1618220179428-22790b461013?w=500	3
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 36, true);

-
--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_categories_name ON public.categories USING btree (name);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_products_name ON public.products USING btree (name);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict ieoyybPNU53V7ogYTI6sFs5piFd1sPc1vzYeIgNoKJvHUGWy4JSbDvTUcH3vKiv

