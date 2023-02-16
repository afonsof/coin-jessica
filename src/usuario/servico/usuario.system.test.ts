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


describe('Usuario', ()=>{
    describe('get', ()=>{
        it('deve retornar um unico usuario. caso ele esteja no banco', async ()=>{
            const {site, server} = createServer()

            const usuario = await client.one(`insert into coin_usuario(nome, email,senha) values
            ('tadeu', 'tadeu@gmail.com', '123111111') RETURNING id`)

            const resposta = await supertest(site).get(`/usuario/${usuario.id}`)

            expect(resposta.body).toEqual({
                id: usuario.id,
                nome: 'tadeu',
                email: 'tadeu@gmail.com',
                senha: '123111111',
            })
           
            server.close()
        })
    })

    describe('create', ()=>{
        it('deve criar um usuario no banco', async ()=>{
            const {site, server} = createServer()

            await client.query(`delete from coin_usuario`)

            await client.query(`delete from coin_usuario`)


            await supertest(site).post('/usuario').send({
                nome: 'tadeu',
                email: 'tadeu@gmail.com',

                senha: '123111111',
            })

            const usuarioNoBD = await client.one(`select * from coin_usuario`)



            expect(usuarioNoBD.nome).toEqual('tadeu')

            expect(usuarioNoBD.email).toEqual('tadeu@gmail.com')

            expect(usuarioNoBD.senha).toEqual('123111111')
            
            server.close()
        })
    })

    describe('update', ()=>{
        it('deve alterar um usuario no banco', async ()=>{
            const {site, server} = createServer()

            const usuario = await client.one(`insert into coin_usuario(nome, email,senha) values
            ('tadeu', 'tadeu@gmail.com', '123111111') RETURNING id`)

            await supertest(site).put(`/usuario/${usuario.id}`).send({
                nome: 'tadeu1',
                email: 'tadeu@gmail.com',
                senha: '123111111',

            })

            const usuarioNoBD = await client.one(`select * from coin_usuario where id = ${usuario.id}`)

            expect(usuarioNoBD.nome).toEqual('tadeu1')

            server.close()
        })
    })

    describe('delete', ()=>{
        it('deve deletar um usuario no banco', async ()=>{
            const {site, server} = createServer()

            const usuario = await client.one(`insert into coin_usuario(nome, email,senha) values
            ('tadeu', 'tadeu@gmail.com', '123111111') RETURNING id`)

            await supertest(site).delete(`/usuario/${usuario.id}`)

            const usuarioNoBD = await client.oneOrNone(`select * from coin_usuario where id = ${usuario.id}`)
           
            expect(usuarioNoBD).toBeNull()

            server.close()
        })
    })

    describe('list', ()=>{
        it('deve retornar todos os usuario cadastrados no banco', async ()=>{
            const {site, server} = createServer()


            await client.query(`delete from coin_usuario`)

            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha) values
            ('tadeu1', 'tadeu@gmail.com', '123111111'),
            ('tadeu2', 'tadeu@gmail.com', '123111111'),
            ('tadeu3', 'tadeu@gmail.com', '123111111') RETURNING id`)

            const resposta = await supertest(site).get('/usuario')

            expect(resposta.body).toEqual([{
                id: usuarios[0].id,
                nome: 'tadeu1',
                email: 'tadeu@gmail.com',
                senha: '123111111',

            },{
                id: usuarios[1].id,
                nome: 'tadeu2',
                email: 'tadeu@gmail.com',
                senha: '123111111',

            },{
                id: usuarios[2].id,
                nome: 'tadeu3',
                email: 'tadeu@gmail.com',
                senha: '123111111', 

            }])

            server.close()
        })
    })
})