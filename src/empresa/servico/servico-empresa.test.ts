import { ServicoEmpresa } from "./servico-empresa";

import pgPromise from 'pg-promise'
const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'teste'
})

const servico = new ServicoEmpresa(client)

describe('ServicoEmpresa', ()=>{
    describe('get', ()=>{
        it('deve retornar uma unica empresa, caso ela esteja no banco', async ()=>{

            const res = await client.one(`insert into coin_empresa(nome, responsavel) values
            ('americanas', 'bia') RETURNING id`)

            const empresa = await servico.get(res.id)

            expect(empresa).toEqual({
                id: res.id,
                nome: 'americanas',
                responsavel: 'bia',
            })
        })

        it('deve disparar um erro caso a empresa não seja encontrada', async ()=>{
           
            expect.assertions(1);  
            try {
                await servico.get(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Empresa não encontrada'))
            }
        })
    })

    describe('delete', ()=>{
        it('deve deletar caso a empresa exista no banco', async ()=>{
            
            const res = await client.one(`insert into coin_empresa(nome, responsavel) values
            ('americanas', 'bia') RETURNING id`)

            await servico.delete(res.id)

            const res2 = await client.oneOrNone(`select * from coin_empresa 
            where id = ${res.id}`)
            expect(res2).toBeNull()
        })
    })

    describe('list', ()=>{
        it('deve listar as empresas do banco', async ()=>{
            await client.query(`delete from coin_empresa`)

            const res = await client.query(`insert into coin_empresa(nome, responsavel) values
            ('americanas', 'bia'),
            ('Ponto Frio', 'Carol') ,
            ('Casas Bahia', 'vinicio') RETURNING id`
            )

            const empresas = await servico.listar()

            expect(empresas).toEqual([{
                id: res[0].id,
                nome: 'americanas',
                responsavel: 'bia',
            },{
                id: res[1].id,
                nome: 'Ponto Frio',
                responsavel: 'Carol',
            },{
                id: res[2].id,
                nome: 'Casas Bahia',
                responsavel: 'vinicio',
            }])

        })
    })
})