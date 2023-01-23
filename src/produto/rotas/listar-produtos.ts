import {Express} from "express"
import { ServicoProduto } from "../servico/servico-produto"

export const listarProduto = (site: Express, client)=>{
    site.get('/produto', async (req, res)=>{
        try{
            const servico = new ServicoProduto(client)
            const produto = await servico.listar()
            res.send(produto)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}
