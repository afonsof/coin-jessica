import { Express } from "express";
import { ServicoCarteiraMoedasDoadas } from "../servico/servico-carteira-moedas-doadas";

export const getCarteiraMoedasDoadas = (site:Express, client)=>{
    site.get('/carteira-moedas-doadas/:id', async (req,res)=>{
        try{
            const servico = new ServicoCarteiraMoedasDoadas(client)
            const carteiraMoedasDoadas = await servico.get(Number(req.params.id))

            res.send(carteiraMoedasDoadas)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}