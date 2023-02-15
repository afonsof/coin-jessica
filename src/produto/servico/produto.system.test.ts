import { ServicoProduto } from './servico-produto'
import supertest from 'supertest'
import pgPromise from 'pg-promise'
import { createServer } from '../../server'

const pgp = pgPromise()


const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'postgres',
})

new ServicoProduto(client)

describe('Produto', ()=> {
    describe('get', ()=> {
        it('deve returnar um unico produto, caso ele esteja no banco', async ()=> {
            const { site, server } = createServer()

            const res = await client.one(`insert into coin_produto (nome, valor, estoque)
            values ('batatinha', 10, 100) RETURNING id`)

            const resposta = await supertest(site).get(`/produto/${res.id}`)
            expect(resposta.body).toEqual({
                id: res.id,
                nome: 'batatinha',
                valor: 10,
                estoque: 100,
            })
            server.close()
        })
    })

    describe('create', ()=> {
        it('deve criar um produto no banco', async ()=> {
            const { site, server } = createServer()

            await client.query('delete from coin_produto')

            await supertest(site).post('/produto').send({
                nome: 'batatinha',
                valor: 10,
                estoque: 100,
            })

            const produtoNoBD = await client.one('select * from coin_produto')
            expect(produtoNoBD.nome).toEqual('batatinha')

            expect(produtoNoBD.valor).toEqual(10)

            expect(produtoNoBD.estoque).toEqual(100)

            server.close()
        })
    })

})