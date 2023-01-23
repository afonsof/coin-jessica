import { Express } from 'express'
import { ServicoEmpresa } from '../servico/servico-empresa'

export const updateEmpresa = (site: Express, client)=>{
    site.put('/empresa/:id', async (req, res)=>{
        try{
            const servico = new ServicoEmpresa(client)
            await servico.update(Number(req.params.id),req.body.nome, req.body.responsavel)
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}
