insert into coin_usuario(nome, email,senha) values
	('joao', 'joao@gmail.com', '123111111'),
	('ana','ana@gmail.com', '2222111111111'),
	('bruno', 'bruno@hotmail.com', 'bb411111111114');


insert into coin_produto (nome, valor, estoque) values
	('Caneta',5,15 ),
	('Lapis', 4, 20),
	('caderno', 20, 30);

insert into coin_pedido (data, id_usuario, status) values
	('2023-01-05', 1,'pendente'),
	('2023-01-05', 2,'pendente'),
	('2023-01-06', 3,'pendente');

insert into coin_produto_pedido (id_pedido, id_produto, qtd, valor_unitario) values
	(1,2,2,8),
	(1,1,1,5),
	(2,2,1,4),
	(2,1,2,10);

insert into coin_reconhecimento (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) values
	('Obrigada pela ajuda','2022-12-05', 10, 'aprovado',1,2),
	('Obrigada pela ajuda','2023-01-05', 8, 'aprovado',1,3),
	('Obrigada pela ajuda','2022-12-05', 15,null,2,1);

insert into coin_carteira_moedas_recebidas(id_usuario, saldo) values
	(1,200),
	(2,200),
	(3,200);

insert into coin_carteira_moedas_doadas(id_usuario, saldo) values
	(1,200),
	(2,0),
	(3,100);