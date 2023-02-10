import { ServicoPedido } from "./servico-pedido";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import pgPromise from 'pg-promise'
import cli from "nodemon/lib/cli";
const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'teste'
})

const servico = new ServicoPedido(client)

describe('ServicoPedido', ()=>{
    describe('get', ()=>{

        it('deve retornar um unico pedido, caso ele esteja no banco', async ()=>{
            

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ('2023-01-05', ${resUsuario.id},'pendente') RETURNING id`
            )

            const idPedido = resPedido.id    

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${idPedido},${resProduto.id},2,10)`
            )

            const pedido = await servico.get(idPedido)

            expect(pedido).toEqual({
                idPedido: idPedido,
                total: 20,
                idUsuario: resUsuario.id,
                status: 'pendente',
                produtos: [
                    {
                        id: resProduto.id,
                        nome: 'pirulito',
                        valor: 10,
                        qtd: 2,
                        total: 20,
                    }
                ]
            })
        })

        it('deve disparar um erro caso o pedido não seja encontrado', async()=>{
            expect.assertions(1);
            try {
                await servico.get(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('pedido não encontrado'))
            }
        })

    })

    describe('list', ()=>{
        it('deve listar os pedidos existentes', async ()=>{
            await client.query(`delete from coin_pedido`)

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.query(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado'),
                ($2::date, ${resUsuario.id},'aprovado') RETURNING id`,
                [dayjs('2023-01-05').toDate(), dayjs('2023-01-06').toDate()]
            ) 

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${resPedido[0].id},${resProduto.id},2,10),
                (${resPedido[1].id},${resProduto.id},3,10)`
            )

            const pedidos  = await servico.listar()

            expect(pedidos).toEqual([{
                idPedido: resPedido[0].id,
                nomeUsuario: 'zezin',
                data: dayjs('2023-01-05').toDate(),
                status: 'aprovado'
            },{
                idPedido: resPedido[1].id,
                nomeUsuario: 'zezin',
                data: dayjs('2023-01-06').toDate(),
                status: 'aprovado'
            }])

        })
    })

    describe('aprovar', ()=>{
        it('deve aprovar um pedido criado com status pendente', async()=>{

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            await client.one(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,200) `, [resUsuario.id])

            await client.one(`insert into coin_carteira_moedas_doadas(id_usuario, saldo)
            values ($1::int,200) `, [resUsuario.id])

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const idPedido = resPedido.id    

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${idPedido},${resProduto.id},2,10)`
            )

            await servico.aprovar(idPedido)

            const res = servico.get(idPedido)

            expect(res).toEqual({
                idPedido: resPedido.id,
                nomeUsuario: 'zezin',
                data: dayjs('2023-01-05').toDate(),
                status: 'aprovado'
            })

        })

        it('deve disparar um erro caso o pedido não tenha o status = pendente', async()=>{
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const idPedido = resPedido.id    

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${idPedido},${resProduto.id},2,10)`
            )

            expect.assertions(1);
            try {
                await servico.aprovar(idPedido)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Pedido não encontrado ou já analisado'))
            }
        })

        it('deve disparar um erro caso o usuario não tenha saldo suficiente para o pedido', async()=>{
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            await client.one(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,0) `, [resUsuario.id])

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const idPedido = resPedido.id    

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${idPedido},${resProduto.id},2,10)`
            )

            expect.assertions(1);
            try {
                await servico.aprovar(idPedido)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Usuário não tem saldo suficiente para aprovar o pedido.'))
            }
        })
    })

    describe('reprovar', ()=>{
        it('deve reprovar um pedido ciado com status pendente', async()=>{

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            await client.one(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,200) `, [resUsuario.id])

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'pendente') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const idPedido = resPedido.id    

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${idPedido},${resProduto.id},2,10)`
            )

            await servico.reprovar(idPedido)

            const res = servico.get(idPedido)

            expect(res).toEqual({
                idPedido: resPedido.id,
                nomeUsuario: 'zezin',
                data: dayjs('2023-01-05').toDate(),
                status: 'reprovado'
            })

        })

        it('deve disparar um erro caso o pedido não tenha o status = pendente', async()=>{
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'reprovado') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const idPedido = resPedido.id    

            expect.assertions(1);
            try {
                await servico.reprovar(idPedido)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Id pedido não encontrado'))
            }
        })
    })

    //NÃO CONSEGUI

    describe('create',()=>{
        it('cria um pedido no banco', async()=>{

            await client.query(`delete from coin_pedido`)
            await client.query(`delete from coin_produto_pedido`)
            await client.query(`delete from coin_produto`)

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProdutos = await client.query(`insert into coin_produto (nome, valor, estoque) values
                ('pirulito', 2, 2000),
                ('batatinha', 10, 100) RETURNING id`
            )

            const produtosDoPedido = [{idPedido : resProdutos[0].id,
                                        qtd: 2
                                    },{
                                       idProduto: resProdutos[1].id,
                                        qts:1
                                    }]

            await servico.create(resUsuario.id, produtosDoPedido)

            const res = await servico.listar()
            
            expect(res).toEqual({
                idPedido: res[0].idPedido,
                data: dayjs('2023-02-08').toDate(),
                idUsuario: resUsuario.id,
                status: 'pendente',
                produtos: [
                    {
                        id: resProdutos[0].id,
                        nome: 'pirulito',
                        valor: 2,
                        qtd: 1,
                        total: 4,
                    },{
                        id: resProdutos[1].id,
                        nome: 'batatinha',
                        valor: 10,
                        qtd: 1,
                        total: 10,
                    }
                ]
            })
        })
    })

})


