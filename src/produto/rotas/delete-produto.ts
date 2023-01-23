import { Express } from 'express'
import { ServicoProduto } from '../servico/servico-produto'

export const deleteProduto = (site: Express, client) =>{
    site.delete('/produto/:id', async (req, res)=>{
        try{
            const servico = new ServicoProduto(client)
            await servico.delete(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}

