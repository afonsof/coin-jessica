import {Express} from 'express'
import { ServicoProduto } from '../servico/servico-produto'

export const getProduto = (site:Express, client)=>{
    site.get('/produto/:id', async (req, res)=>{
        try{
            const servico = new ServicoProduto(client)
            const produto = await servico.get(Number(req.params.id))

            res.send(produto)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}
