import { Express } from 'express'
import { ServicoUsuario } from '../servico/servico-usuario'

export const createUsuarios = (site: Express, client) =>{
    site.post('/usuario', async (req, res)=>{
        try{
            const servico = new ServicoUsuario(client)
            await servico.create(req.body.nome, req.body.email, req.body.senha)
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}

