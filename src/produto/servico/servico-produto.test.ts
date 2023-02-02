import { ServicoProduto } from "./servico-produto"

import * as pgPromise from 'pg-promise'
const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'postgres'
})


describe('ServicoProduto', ()=> {
    describe('get', ()=> {
        it('deve returnar um unico produto, caso ele esteja no banco', async ()=> {
            // inicializacao
            const servico = new ServicoProduto(client)
            const res = await client.one(`insert into coin_produto (nome, valor, estoque)
             values ('batatinha', 10, 100) RETURNING id`)

            // exercicio
            const produto = await servico.get(res.id)

            // verificacao
            expect(produto).toEqual({
                id: res.id,
                nome: 'batatinha',
                valor: 10,
                estoque: 100,
            })
        })

        it('deve disparar um erro caso o produto nao seja encontrado', async ()=> {
            // inicializacao
            const servico = new ServicoProduto(client)

            // exercicio e verificacao
            expect(async ()=> 
                await servico.get(999999)
            ).rejects.toBe(new Error('Id produto não encontrado'))
        })
    })

    describe('delete', ()=> {
        it('deve deletar caso o produto exista', async ()=> {
            // inicializacao
            const servico = new ServicoProduto(client)
            const res = await client.one(`insert into coin_produto (nome, valor, estoque)
                values ('batatinha', 10, 100) RETURNING id`)

            // exercicio
            await servico.delete(res.id)

            // verificacao
            const res2 = await client.oneOrNone(`select * from coin_produto where id=${res.id}`)
            expect(res2).toBeNull()
        })
    })
})