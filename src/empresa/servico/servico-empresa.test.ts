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

        it('deve disparar um erro caso o id empresa não seja encontrado', async()=>{
            expect.assertions(1);
            try {
                await servico.delete(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Empresa não encontrada'))
            }
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

    describe('update', ()=>{
        it('deve alterar uma empresa existente no banco', async ()=>{

            const empresa = await client.one(`insert into coin_empresa(nome, responsavel) values
            ('americana', 'luis') RETURNING id`)
            
            await servico.update(empresa.id, 'americanas','bianca')

            const empresaNoBD = await client.one(`select * from coin_empresa where id = ${empresa.id}`)
            
            expect(empresaNoBD.nome).toEqual('americanas')
            expect(empresaNoBD.responsavel).toEqual('bianca')

        })

        it('deve disparar um erro caso a empresa não seja encontrada', async()=>{
            
            expect.assertions(1);
            try {
                await servico.update(9999999, 'americanas','bianca')
            } 
            catch (e) {
                expect(e).toEqual(new Error('Empresa não encontrada'))
            }
        })
    })

    describe('create', ()=>{
        it('deve criar uma nova empresa no banco', async ()=>{

            await client.query(`delete from coin_empresa`)

            await servico.create('americanas','bianca')

            const empresaNoBD = await client.query(`select * from coin_empresa`)

            expect(empresaNoBD).toEqual([{
                id: empresaNoBD[0].id,
                nome: 'americanas',
                responsavel: 'bianca',
            }])
        })
    })
})