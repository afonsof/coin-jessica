import { ServicoCarteiraMoedasDoadas } from "./servico-carteira-moedas-doadas"

import pgPromise from 'pg-promise'
const pgp = pgPromise()

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'teste'
})

const servico = new ServicoCarteiraMoedasDoadas(client)

describe('ServicoCarteiraMoedasDoadas', ()=>{
    describe('get', ()=>{
        it('deve retornar uma unica carteira, caso ela esteja no banco', async ()=>{

            const usuario = await client.one(`insert into coin_usuario(nome, email,senha) 
            values ('joao', 'joao@gmail.com', '123111111') RETURNING id`)
            
            await client.query(`insert into coin_carteira_moedas_doadas(id_usuario, saldo) 
            values ($1::int,200)`, [usuario.id])

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
                expect(e).toEqual(new Error('Usuário não encontrado ou usuário sem carteira'))
            }
        })
    })

})