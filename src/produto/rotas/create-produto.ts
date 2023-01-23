import {Express} from "express"
import { ServicoProduto } from "../servico/servico-produto"

export const createProduto = (site:Express, client)=>{
    site.post('/produto', async (req, res)=>{
        try{
            const servico = new ServicoProduto(client)
            await servico.create(req.body.nome, req.body.valor, req.body.estoque)
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
            
    })
}

