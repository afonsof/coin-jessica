import { Express } from 'express'
import { ServicoEmpresa } from '../servico/servico-empresa'

export const createEmpresa = (site:Express, client)=>{
    site.post('/empresa', async (req, res)=>{
        try{
            const servico = new ServicoEmpresa(client)
            await servico.create(req.body.nome,req.body.responsavel)
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}
