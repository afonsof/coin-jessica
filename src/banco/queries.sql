create table coin_usuario(
	id serial not null,
	nome text not null,
	email varchar(255) not null,
	senha varchar(50) not null
);

create table coin_empresa(
	id serial not null,
	nome text not null,
	responsavel text not null
);

create table coin_produto(
	id serial not null,
	nome text not null,
	valor int not null,
	estoque numeric not null
);

create table coin_pedido(
	id serial not null,
	data date not null,
	id_usuario int not null,
	status text not null
);

create table coin_produto_pedido (
	id_pedido int not null,
	id_produto int not null,
	qtd int not null,
	valor_unitario int not null
);

create table coin_reconhecimento(
	id serial not null,
	descricao text not null,
	data date not null,
	qtd_moedas_doadas int not null,
	status text,
	id_de_usuario int not null,
	id_para_usuario int not null
);

create table coin_carteira_moedas_recebidas(
	id_usuario int not null,
	saldo int not null
);

create table coin_carteira_moedas_doadas(
	id_usuario int not null,
	saldo int not null
);