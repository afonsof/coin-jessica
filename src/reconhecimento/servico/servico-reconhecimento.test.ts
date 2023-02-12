import { ServicoReconhecimento } from "./servico-reconhecimento";

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

const servico = new ServicoReconhecimento(client)

describe('ServicoReconhecimento', ()=>{
    describe('get', ()=>{
        it('deve retornar um unico reconhecimento, caso ele esteja no banco',async ()=>{

            const usuario = await client.query(`insert into coin_usuario(nome, email,senha) 
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            const res = await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda',$1::date, 10, 'aprovado',
                ${usuario[0].id},${usuario[1].id}) RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const reconhecimento = await servico.get(res.id)

            expect(reconhecimento).toEqual({
                id: res.id,
                descricao: 'Obrigada pela ajuda',
                data: dayjs('2023-01-05').toDate(),
                qtdMoedasDoadas: 10 ,
                status: 'aprovado',
                idDeUsuario: usuario[0].id,
                idParaUsuario: usuario[1].id,
            })
        })

        it('deve disparar um erro caso o reconhecimento não seja encontrado', async()=>{
            expect.assertions(1)
            try {
                await servico.get(999999)
            } catch(e) {
                expect(e).toEqual(new Error('id de Reconhecimento não encontrado ou pendente aprovação'))
            }
        })
    })

    describe('delete', ()=>{
        it('deve deletar caso o reconhecimento exista', async()=>{

            const usuario = await client.query(`insert into coin_usuario(nome, email,senha) 
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            const res = await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda','2023-01-05', 10, 'pendente',
                ${usuario[0].id},${usuario[1].id}) RETURNING id`
            )

            await servico.delete(res.id)

            const res2 = await client.oneOrNone(`select * from coin_reconhecimento where id=${res.id}`)
            expect(res2).toBeNull()
        })

        it('deve disparar um erro caso o reconhecimento não seja encontrado', async()=>{
            expect.assertions(1);
            try {
                await servico.delete(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('id de Reconhecimento não encontrado ou já analisado'))
            }
        })
    })

    describe('list', ()=>{
        it('deve listar os reconhecimentos existentes', async ()=>{
            await client.query(`delete from coin_reconhecimento`)

            const usuario = await client.query(`insert into coin_usuario(nome, email,senha) 
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            const res = await client.query(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values
                  ('Obrigada pela ajuda',$1::date, 10, 'aprovado', ${usuario[0].id},${usuario[1].id}), 
                  ('Obrigada pela ajuda',$1::date, 15, 'aprovado', ${usuario[1].id},${usuario[0].id}) RETURNING id`,
                [dayjs('2023-01-05').toDate()]
            )

            const reconhecimentos = await servico.listar() 

            expect(reconhecimentos).toEqual([{
                id: res[0].id,
                descricao: 'Obrigada pela ajuda',
                data: dayjs('2023-01-05').toDate(),
                qtdMoedasDoadas: 10 ,
                status: 'aprovado',
                idDeUsuario: usuario[0].id,
                idParaUsuario: usuario[1].id,
            },{
                id: res[1].id,
                descricao: 'Obrigada pela ajuda',
                data: dayjs('2023-01-05').toDate(),
                qtdMoedasDoadas: 15 ,
                status: 'aprovado',
                idDeUsuario: usuario[1].id,
                idParaUsuario: usuario[0].id,
            }])
        })
    })

    describe('create', ()=>{
        it('deve criar um reconhecimento', async()=>{

            await client.query(`delete from coin_reconhecimento`)
            
            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha) 
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            await client.query(`insert into coin_carteira_moedas_doadas
            (id_usuario, saldo) values (${usuarios[0].id},200),
                                       (${usuarios[1].id},200)`
            )

            await client.query(`insert into coin_carteira_moedas_recebidas
            (id_usuario, saldo) values (${usuarios[0].id},200),
                                       (${usuarios[1].id},200)`
            )
            
            await servico.create('Obrigada pela ajuda', dayjs('2023-01-05').toDate(), 10, 
            usuarios[0].id,usuarios[1].id)

            const reconhecimentoBD = await client.one(`select * from coin_reconhecimento 
            where id_de_usuario = ${usuarios[0].id}`)

            const carteiraMoedasDoadasBD = await client.one(`select * from coin_carteira_moedas_doadas 
            where id_usuario = ${usuarios[0].id}`)

            const carteiraMoedasRecebidasBD = await client.one(`select * from 
            coin_carteira_moedas_recebidas where id_usuario = ${usuarios[1].id}`)

            expect(reconhecimentoBD.descricao).toEqual('Obrigada pela ajuda')

            expect(reconhecimentoBD.data).toEqual(dayjs('2023-01-05').toDate())

            expect(reconhecimentoBD.qtd_moedas_doadas).toEqual(10)

            expect(reconhecimentoBD.status).toEqual('pendente')

            expect(reconhecimentoBD.id_de_usuario).toEqual(usuarios[0].id)

            expect(reconhecimentoBD.id_para_usuario).toEqual(usuarios[1].id)

            expect(carteiraMoedasDoadasBD.saldo).toEqual(190)

            expect(carteiraMoedasRecebidasBD.saldo).toEqual(210)

        })
    })

    describe('aprovar',()=>{
        it('deve aprovar um reconhecimento criado', async()=>{
            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha) 
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            await client.query(`insert into coin_carteira_moedas_doadas
            (id_usuario, saldo) values (${usuarios[0].id},200)`
            )

            await client.query(`insert into coin_carteira_moedas_recebidas
            (id_usuario, saldo) values (${usuarios[1].id},200)`
            )
            const reconhecimento = await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda', $1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id})  RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            await servico.aprovar(reconhecimento.id)
           
            const reconhecimentoDb = await client.one(`select * from coin_reconhecimento where id = ${reconhecimento.id}`)
            const carteiraMoedasDoadasDb = await client.one(`select * from coin_carteira_moedas_doadas where id_usuario = ${usuarios[0].id}`)
            const carteiraMoedasRecebidasDb = await client.one(`select * from coin_carteira_moedas_recebidas where id_usuario = ${usuarios[1].id}`)

            expect(reconhecimentoDb.status).toEqual('aprovado')
            expect(carteiraMoedasDoadasDb.saldo).toEqual(200)
            expect(carteiraMoedasRecebidasDb.saldo).toEqual(200)
        })

        it('deve disparar um erro caso o reconhecimento não seja encontrado ou já aprovado', async()=>{
            expect.assertions(1);
            try {
                await servico.aprovar(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('id de Reconhecimento não encontrado ou já aprovado'))
            }
        })


    })

    describe('reprovar',()=>{
        it('deve reprovar um reconhecimento criado que seja pendente', async()=>{
            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha) 
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            await client.query(`insert into coin_carteira_moedas_doadas
            (id_usuario, saldo) values (${usuarios[0].id},200)`
            )

            await client.query(`insert into coin_carteira_moedas_recebidas
            (id_usuario, saldo) values (${usuarios[1].id},200)`
            )

            const reconhecimento = await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda', $1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id})  RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            await servico.reprovar(reconhecimento.id)   
            
            const reconhecimentoDb = await client.one(`select * from coin_reconhecimento where id = ${reconhecimento.id}`)
            const saldoCarteiraDoadaDB = await client.one(`select * from coin_carteira_moedas_doadas where id_usuario = ${usuarios[0].id}`)
            const saldoCarteiraRecebidaDB = await client.one(`select * from coin_carteira_moedas_recebidas where id_usuario = ${usuarios[1].id}`)
            
            expect(reconhecimentoDb.status).toEqual('reprovado')
            expect(saldoCarteiraDoadaDB.saldo).toEqual(210)
            expect(saldoCarteiraRecebidaDB.saldo).toEqual(190)
        })

        it('deve disparar um erro caso o reconhecimento não seja encontrado ou já reprovado', async()=>{
            expect.assertions(1);
            try {
                await servico.reprovar(999999)
            } 
            catch (e) {
                expect(e).toEqual(new Error('id de Reconhecimento não encontrado ou já reprovado'))
            }
        })
    })
})