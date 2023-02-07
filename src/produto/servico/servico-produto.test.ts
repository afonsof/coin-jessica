import { ServicoProduto } from "./servico-produto"

import pgPromise from 'pg-promise'
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
            // inicializacao

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
            // inicializacao: é o serviço que foi declarado à cima, fora do describe

            // exercicio e verificacao:

            // expect.assertions(1) é usado para caso não entrar no erro, 
            // vai avisar q era esperado dar 1 erro
            expect.assertions(1);  
            try {
                await servico.get(999999)
            } 
            catch (e) {
                //o erro 'Id produto não encontrado', tem q ser igual ao erro esperado no get serviço produto
                expect(e).toEqual(new Error('Id produto não encontrado'))
            }
        })
    })

    describe('delete', ()=> {
        it('deve deletar caso o produto exista', async ()=> {
            // inicializacao

            const res = await client.one(`insert into coin_produto (nome, valor, estoque)
                values ('batatinha', 10, 100) RETURNING id`)

            // exercicio
            await servico.delete(res.id)

            // verificacao
            const res2 = await client.oneOrNone(`select * from coin_produto where id=${res.id}`)
            expect(res2).toBeNull()
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
})