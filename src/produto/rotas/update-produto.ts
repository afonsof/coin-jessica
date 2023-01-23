import { Express } from "express";
import { ServicoProduto } from "../servico/servico-produto";

export const updateProduto = (site:Express, client)=>{
    site.put('/produto/:id', async (req, res)=>{
        try{
            const servico = new ServicoProduto(client)
            await servico.update(Number(req.params.id), req.body.nome, req.body.valor, req.body.estoque)
            res.send()

        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}

