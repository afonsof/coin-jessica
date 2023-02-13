import { ServicoProduto } from "./servico-produto"

import pgPromise from 'pg-promise'
import dayjs from "dayjs";
import cli from "nodemon/lib/cli";
const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'teste'
})

const servico = new ServicoProduto(client)

describe('ServicoProduto', ()=> {
    describe('get', ()=> {
        it('deve returnar um unico produto, caso ele esteja no banco', async ()=> {

            const res = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 100) RETURNING id`)


            const produto = await servico.get(res.id)

            expect(produto).toEqual({
                id: res.id,
                nome: 'batatinha',
                valor: 10,
                estoque: 100,
            })
        })

        it('deve disparar um erro caso o produto nao seja encontrado', async ()=> {
     
            expect.assertions(1);  
            try {
                await servico.get(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Id produto não encontrado'))
            }
        })
    })

    describe('delete', ()=> {
        it('deve deletar caso o produto exista', async ()=> {

            const res = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 100) RETURNING id`)

            await servico.delete(res.id)

            const res2 = await client.oneOrNone(`select * from coin_produto where id=${res.id}`)
            expect(res2).toBeNull()
        })

        it('deve disparar um erro caso o id produto não seja encontrado', async()=>{
            expect.assertions(1);
            try {
                await servico.delete(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Produto não encontrado'))
            }
        })
    })

    describe('list', ()=>{
        it('deve listar os produtos existentes', async ()=>{
            await client.query(`delete from coin_produto`)

            const res = await client.query(`insert into coin_produto (nome, valor, estoque)
                values ('batatinha1', 10, 100),
                       ('batatinha2', 20, 100),
                       ('batatinha3', 30, 100) RETURNING id`
            )

            const produtos = await servico.listar()

            expect(produtos).toEqual([{
                id: res[0].id,
                nome: 'batatinha1',
                valor: 10,
                estoque: 100,
            },{
                id: res[1].id,
                nome: 'batatinha2',
                valor: 20,
                estoque: 100,
            },{
                id: res[2].id,
                nome: 'batatinha3',
                valor: 30,
                estoque: 100,
            }])

        })
    })

    describe('create', ()=>{
        it('deve criar um novo produto no banco', async ()=>{

            await client.query(`delete from coin_produto`)

            await servico.create('batatinha', 10, 100)

            const produto = await servico.listar()

            expect(produto).toEqual([{
                id: produto[0].id,
                nome: 'batatinha',
                valor: 10,
                estoque: 100,
            }])
        })
    })

    describe('update', ()=>{
        it('deve alterar um produto existente no banco', async ()=>{

            const produto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 100) RETURNING id`)
            
            await servico.update(produto.id, 'batatinha1', 10, 1000)

            const produtoNoBD = await client.one(`select * from coin_produto where id = ${produto.id}`)
            
            expect(produtoNoBD.nome).toEqual('batatinha1')

            expect(produtoNoBD.valor).toEqual(10)

            expect(produtoNoBD.estoque).toEqual(1000)
        
        })

        it('deve disparar um erro caso o produto não seja encontrado', async()=>{
            
            expect.assertions(1);
            try {
                await servico.update(9999999, 'batatinha1', 10, 1000)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Id produto não encontrado'))
            }
        })
    })

    describe('atualizar Estoque', ()=>{
        it('deve atualizar um estoque de um produto', async()=>{
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) 
            values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 100) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado') RETURNING id`,[dayjs('2023-01-05').toDate()]
            )

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${resPedido.id  },${resProduto.id},2,10)`
            )
            const qtdParaDebitar = 2

            await servico.atualizarEstoque(resProduto.id, qtdParaDebitar)

            const produtoNoBD = await client.one(`select * from coin_produto where id = ${resProduto.id}`)

            expect(produtoNoBD.nome).toEqual('batatinha')
            expect(produtoNoBD.valor).toEqual(10)
            expect(produtoNoBD.estoque).toEqual(98)

        })

        it('deve disparar um erro caso o produto não seja encontrado', async()=>{
            
            expect.assertions(1);
            try {
                await servico.atualizarEstoque(9999999, 10)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Id de produto não encontrado'))
            }
        })
    })

    describe('conferirQtdEstoque',()=>{
        it(`deve conferir se tem quantidade do produto pedido no estoque`, async()=>{
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) 
            values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 100) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado') RETURNING id`,[dayjs('2023-01-05').toDate()]
            )

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${resPedido.id},${resProduto.id},2,10)`
            )

            const qtdProdutoPedido = 2

            const res = await servico.conferirQtdEstoque(resProduto.id,qtdProdutoPedido)

            expect(res).toBeUndefined()
        })

        it('deve disparar um erro caso o produto não seja encontrado', async()=>{
            
            expect.assertions(1);
            try {
                await servico.conferirQtdEstoque(9999999, 10)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Id de produto não encontrado'))
            }
        })

        it('deve disparar um erro caso o produto não seja encontrado', async()=>{
            
            const resUsuario = await client.one(`insert into coin_usuario (nome, email, senha) 
            values ('zezin', 'joze@sdf.com', '123123123') RETURNING id`)

            const resProduto = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 1) RETURNING id`)

            const resPedido = await client.one(`insert into coin_pedido 
                (data, id_usuario, status) values
                ($1::date, ${resUsuario.id},'aprovado') RETURNING id`,[dayjs('2023-01-05').toDate()]
            )

            const qtd = 2

            await client.query(`insert into coin_produto_pedido 
                (id_pedido, id_produto, qtd, valor_unitario) values
                (${resPedido.id},${resProduto.id},${qtd},10)`
            )

            expect.assertions(1);
            try {
                await servico.conferirQtdEstoque(resProduto.id, qtd)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Quantidade pedida maior que estoque disponível'))
            }
        })
    })

})