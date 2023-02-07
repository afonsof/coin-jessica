import { ServicoUsuario } from "./servico-usuario"

import pgPromise from 'pg-promise'
const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'teste'
})

const servico = new ServicoUsuario(client)

describe('ServicoUsuario', ()=>{
    describe('get', ()=>{
        it('deve retornar um unico usuario, caso ele esteja no banco', async ()=>{
            const res = await client.one(`insert into coin_usuario(nome, email,senha) values
            ('antonia', 'antonia@gmail.com', '123111111') RETURNING id`)

            const usuario = await servico.get(res.id)

            expect(usuario).toEqual({
                id: res.id,
                nome: 'antonia',
                email: 'antonia@gmail.com',
                senha: '123111111'
            })
        })

        it('deve disparar um erro caso o usuario não seja encontrado', async()=>{
            expect.assertions(1);
            try {
                await servico.get(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Usuário não encontrado'))
            }
        })
    })

    describe('delete', ()=>{
        it('deve deletar caso o usuario exista', async ()=>{
            const res = await client.one(`insert into coin_usuario(nome, email,senha) values
            ('antonia', 'antonia@gmail.com', '123111111') RETURNING id`)

            await servico.delete(res.id)

            const res2 = await client.oneOrNone(`select * from coin_usuario where id=${res.id}`)
            expect(res2).toBeNull()
        })
    })

    describe('list', ()=>{
        it('deve listar os usuarios existentes', async ()=>{
            await client.query(`delete from coin_usuario`)

            const res = await client.query(`insert into coin_usuario(nome, email,senha) values
            ('tadeu1', 'tadeu@gmail.com', '123111111'),
            ('tadeu2', 'tadeu@gmail.com', '123111111'),
            ('tadeu3', 'tadeu@gmail.com', '123111111') RETURNING id`)

            const usuarios = await servico.listar()

            expect(usuarios).toEqual([{
                id: res[0].id,
                nome: 'tadeu1',
                email: 'tadeu@gmail.com',
                senha: '123111111'
            }, {
                id: res[1].id,
                nome: 'tadeu2',
                email: 'tadeu@gmail.com',
                senha: '123111111'
            }, {
                id: res[2].id,
                nome: 'tadeu3',
                email: 'tadeu@gmail.com',
                senha: '123111111'
            }])

        })
    })

})

