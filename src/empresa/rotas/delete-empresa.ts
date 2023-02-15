import { Express } from 'express'
import { ServicoEmpresa } from '../servico/servico-empresa'

export const deleteEmpresa = (site:Express, client)=>{
    site.delete('/empresa/:id', async (req, res)=>{
        try{
            const servico = new ServicoEmpresa(client)
            await servico.delete(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}
