import { ServicoReconhecimento } from "./servico-reconhecimento";

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
})