import { ServicoPedido } from "./servico-pedido";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import pgPromise from 'pg-promise'
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

})


