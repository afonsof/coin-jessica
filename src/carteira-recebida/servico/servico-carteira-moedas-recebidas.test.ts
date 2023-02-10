import { ServicoCarteiraMoedasRecebidas } from "./servico-carteira-moedas-recebidas"

import pgPromise from 'pg-promise'
import dayjs from "dayjs";

const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'teste'
})

const servico = new ServicoCarteiraMoedasRecebidas(client)

describe('ServicoCarteiraMoedasRecebidas', ()=>{
    describe('get', ()=>{
        it('deve retornar uma unica carteira, caso ela esteja no banco', async ()=>{
            
            const usuario = await client.one(`insert into coin_usuario(nome, email,senha)
            values ('joao', 'joao@gmail.com', '123111111') RETURNING id`)
            
            await client.query(`insert into coin_carteira_moedas_recebidas(id_usuario, saldo)
            values ($1::int,200) `, [usuario.id])

            const carteiraMoedasRecebidas = await servico.get(usuario.id)

            expect(carteiraMoedasRecebidas).toEqual({
                nome: 'joao',
                saldo: 200,
                idUsuario: usuario.id,
            })
        })

        it('deve disparar um erro caso a carteira não seja encontrada', async ()=>{
            const usuario = await client.one(`insert into coin_usuario(nome, email,senha)
            values ('joao', 'joao@gmail.com', '123111111') RETURNING id`)
            

            expect.assertions(1);  
            try {
                await servico.get(usuario.id)
            } 
            catch (e) {
                expect(e).toEqual(new Error('Usuário sem carteira'))
            }
        })
    })
    describe('creditar', () => {
        it('deve creditar um valor na carteira do usuario ao receber um valor no reconhecimento', async () => {

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
            
            await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda',$1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id}) RETURNING id`, [dayjs('2023-01-05').toDate()]
            )
            const valorParaCreditar = 10
           
            await servico.creditar(valorParaCreditar, usuarios[1].id)


            const carteiraDoadasBD = await client.one(`select * from coin_carteira_moedas_recebidas
            where id_usuario = ${usuarios[1].id}`
            )

            expect(carteiraDoadasBD.saldo).toEqual(210)
        })

        it('deve disparar um erro caso não encontre carteira de moedas recebidas', async () => {
            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha)
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )

            
            const reconhecimento = await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda',$1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id}) RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const valorParaCreditar = reconhecimento.qtd_moedas_doadas

            expect.assertions(1);
            try {
                await servico.creditar(valorParaCreditar, usuarios[1].id)
            }
            catch (e) {
                expect(e).toEqual(new Error('Carteira de moedas recebidas não encontrada'))
            }
        })
    })

    describe('debitar', () => {
        it('deve debitar um valor na carteira do usuario ao doar um valor no reconhecimento', async () => {

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
            
            await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda',$1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id}) RETURNING id`, [dayjs('2023-01-05').toDate()]
            )
            const valorParaDebitar = 10
           
            await servico.debitar(valorParaDebitar, usuarios[1].id)

            const carteiraDoadasBD = await client.one(`select * from coin_carteira_moedas_recebidas where id_usuario = ${usuarios[1].id}`) 

            expect(carteiraDoadasBD.saldo).toEqual(190)

        })

        it('deve disparar um erro caso não encontre carteira de moedas recebidas', async () => {
            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha)
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )
        
            
            await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda',$1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id}) RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const valorParaDebitar = 10

            expect.assertions(1);
            try {
                await servico.debitar(valorParaDebitar, usuarios[1].id)
            }
            catch (e) {
                expect(e).toEqual(new Error('Carteira de moedas recebidas não encontrada'))
            }
        })

        it('deve disparar um erro caso saldo carteira de moedas recebidas seja menor q que o valor a debitar', async () => {
            const usuarios = await client.query(`insert into coin_usuario(nome, email,senha)
            values ('joao1', 'joao@gmail.com', '123111111'),
                   ('joao2', 'joao@gmail.com', '123111111') RETURNING id`
            )
            
            await client.query(`insert into coin_carteira_moedas_recebidas
            (id_usuario, saldo) values (${usuarios[0].id},5),
                                       (${usuarios[1].id},5)`
            )
            
            await client.one(`insert into coin_reconhecimento 
                (descricao, data, qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) 
                values ('Obrigada pela ajuda',$1::date, 10, 'pendente',
                ${usuarios[0].id},${usuarios[1].id}) RETURNING id`, [dayjs('2023-01-05').toDate()]
            )

            const valorParaDebitar = 10

            expect.assertions(1);
            try {
                await servico.debitar(valorParaDebitar, usuarios[1].id)
            }
            catch (e) {
                expect(e).toEqual(new Error('Usuário não tem saldo suficiente'))
            }
        })
    })
})