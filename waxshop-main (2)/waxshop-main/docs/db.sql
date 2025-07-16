-- DROP SCHEMA dbo;

CREATE SCHEMA dbo;
-- ecommerce.dbo.category definition

-- Drop table

-- DROP TABLE ecommerce.dbo.category;

CREATE TABLE ecommerce.dbo.category (
	id bigint IDENTITY(1,1) NOT NULL,
	name varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK__category__3213E83F87222D2A PRIMARY KEY (id)
);


-- ecommerce.dbo.users definition

-- Drop table

-- DROP TABLE ecommerce.dbo.users;

CREATE TABLE ecommerce.dbo.users (
	id int IDENTITY(1,1) NOT NULL,
	email varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	password varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[role] varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK__users__3213E83FBD736B47 PRIMARY KEY (id),
	CONSTRAINT UK6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email)
);


-- ecommerce.dbo.orders definition

-- Drop table

-- DROP TABLE ecommerce.dbo.orders;

CREATE TABLE ecommerce.dbo.orders (
	id bigint IDENTITY(1,1) NOT NULL,
	[date] datetime2(6) NOT NULL,
	status varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	user_id int NOT NULL,
	CONSTRAINT PK__orders__3213E83FDB33C161 PRIMARY KEY (id),
	CONSTRAINT FK32ql8ubntj5uh44ph9659tiih FOREIGN KEY (user_id) REFERENCES ecommerce.dbo.users(id)
);


-- ecommerce.dbo.product definition

-- Drop table

-- DROP TABLE ecommerce.dbo.product;

CREATE TABLE ecommerce.dbo.product (
	id bigint IDENTITY(1,1) NOT NULL,
	description nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	image_url varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	name varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	price numeric(10,2) NOT NULL,
	stock int NOT NULL,
	category_id bigint NOT NULL,
	CONSTRAINT PK__product__3213E83FF9D909E6 PRIMARY KEY (id),
	CONSTRAINT FK1mtsbur82frn64de7balymq9s FOREIGN KEY (category_id) REFERENCES ecommerce.dbo.category(id)
);


-- ecommerce.dbo.cart_item definition

-- Drop table

-- DROP TABLE ecommerce.dbo.cart_item;

CREATE TABLE ecommerce.dbo.cart_item (
	id bigint IDENTITY(1,1) NOT NULL,
	quantity int NOT NULL,
	user_email varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	product_id bigint NOT NULL,
	CONSTRAINT PK__cart_ite__3213E83F82DEF935 PRIMARY KEY (id),
	CONSTRAINT FKjcyd5wv4igqnw413rgxbfu4nv FOREIGN KEY (product_id) REFERENCES ecommerce.dbo.product(id)
);


-- ecommerce.dbo.order_item definition

-- Drop table

-- DROP TABLE ecommerce.dbo.order_item;

CREATE TABLE ecommerce.dbo.order_item (
	id bigint IDENTITY(1,1) NOT NULL,
	price numeric(10,2) NOT NULL,
	quantity int NOT NULL,
	order_id bigint NOT NULL,
	product_id bigint NOT NULL,
	CONSTRAINT PK__order_it__3213E83F9C1A7D5D PRIMARY KEY (id),
	CONSTRAINT FK551losx9j75ss5d6bfsqvijna FOREIGN KEY (product_id) REFERENCES ecommerce.dbo.product(id),
	CONSTRAINT FKt4dc2r9nbvbujrljv3e23iibt FOREIGN KEY (order_id) REFERENCES ecommerce.dbo.orders(id)
);