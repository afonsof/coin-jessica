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

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha)
            values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('pirulito', 2, 2000) RETURNING id`)

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

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values 
            ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            await client.query(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,200) `, [resUsuario.id])

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('pirulito', 10, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'pendente') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )  

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${resPedido.id },${resProduto.id},2,10)`
            )

            await servico.aprovar(resPedido.id)

            const pedidoNoBD = await client.one(`select * from coin_pedido 
            where id = ${resPedido.id}`)

            const carteiraRecebidasBD = await client.one(`select * from coin_carteira_moedas_recebidas
            where id_usuario = ${resUsuario.id}`)
        
            expect(pedidoNoBD.status).toEqual('aprovado')

            expect(carteiraRecebidasBD.saldo).toEqual(180)
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
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) values
            ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            await client.query(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,0) `, [resUsuario.id])

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) 
            values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'pendente') RETURNING id`, [dayjs('2023-01-05').toDate()]
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

    it('deve disparar um erro caso o produto não tenha estoque suficiente', async()=>{

        await client.query(`delete from coin_produto_pedido`)

        const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) 
        values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

        await client.query(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
        values ($1::int,200) `, [resUsuario.id])

        const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque) 
        values ('pirulito', 2, 0) RETURNING id`)

        const resPedido = await client.one(`insert into coin_pedido 
            (data, id_usuario, status) values
            ($1::date, ${resUsuario.id},'pendente') RETURNING id`, [dayjs('2023-01-05').toDate()]
        )

        await client.query(`insert into coin_produto_pedido 
            (id_pedido, id_produto, qtd, valor_unitario) values
            (${resPedido.id},${resProduto.id},2,10)`
        )

        const produtoDoPedidoNoBD = await client.one(`select * from coin_produto_pedido
        where id_pedido = ${resPedido.id}`)

        expect.assertions(1);
        try {
            await servico.aprovar(resPedido.id)
        } 
        catch (e) {
            expect(e).toEqual(new Error(
                `Foi requisitado 2 unidades do produto pirulito, mas só tem 0 em estoque`
            ))
        }
    })
   


    describe('reprovar', ()=>{
        it('deve reprovar um pedido ciado com status pendente', async()=>{

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha)
            values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            await client.query(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,200) `, [resUsuario.id])

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('pirulito', 2, 2000) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'pendente') RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${resPedido.id},${resProduto.id},2,10)`
            )

            await servico.reprovar(resPedido.id)

            const pedidoNoBD = await client.one(`select * from coin_pedido 
            where id = ${resPedido.id}`)

            const carteiraRecebidasBD = await client.one(`select * from coin_carteira_moedas_recebidas
            where id_usuario = ${resUsuario.id}`)

            expect(pedidoNoBD.status).toEqual('reprovado')

            expect(carteiraRecebidasBD.saldo).toEqual(200)

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
   
    describe('create',()=>{
        it('cria um pedido no banco', async()=>{

            await client.query(`delete from coin_pedido`)
            await client.query(`delete from coin_produto_pedido`)
            await client.query(`delete from coin_produto`)

            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha)
            values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProdutos = await client.query(`insert into coin_produto (nome, valor, estoque) values
                ('pirulito', 2, 2000),
                ('batatinha', 10, 100) RETURNING id`
            )

            const produtosDoPedido = [{idProduto : resProdutos[0].id,
                                        qtd: 2
                                    },{
                                       idProduto: resProdutos[1].id,
                                        qtd:1
                                    }]

            const dataAtual = dayjs()
                .set('hour', 0)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0)
                .toDate()
            await servico.create(resUsuario.id, produtosDoPedido)
            
            const pedidosNoBD = await client.query(`select * from coin_pedido`)
            
            const produtosPedidosNoBD = await client.query(`select * from coin_produto_pedido order by id_produto`)

            expect(pedidosNoBD[0].id_usuario).toEqual(resUsuario.id)
            expect(pedidosNoBD[0].status).toEqual('pendente')
            expect(pedidosNoBD[0].data).toEqual(dataAtual)

            expect(produtosPedidosNoBD[0].id_pedido).toEqual(pedidosNoBD[0].id)

            expect(produtosPedidosNoBD[0].id_produto).toEqual(resProdutos[0].id)
            expect(produtosPedidosNoBD[0].qtd).toEqual(2)
            expect(produtosPedidosNoBD[0].valor_unitario).toEqual(2)

            expect(produtosPedidosNoBD[1].id_produto).toEqual(resProdutos[1].id)
            expect(produtosPedidosNoBD[1].qtd).toEqual(1)
            expect(produtosPedidosNoBD[1].valor_unitario).toEqual(10)
            
        })
    })

})


