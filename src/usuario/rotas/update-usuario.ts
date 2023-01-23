import { Express } from 'express'
import { ServicoUsuario } from '../servico/servico-usuario'

export const updateUsuario = (site: Express, client) =>{
    site.put('/usuario/:id', async (req, res)=>{
        try{
            const servico = new ServicoUsuario(client)
            await servico.update(Number(req.params.id), req.body.nome, req.body.email, req.body.senha)
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}

