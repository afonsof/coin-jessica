import { Express } from "express";
import { ServicoReconhecimento } from "../servico/servico-reconhecimento";

export const deleteReconhecimento = (site:Express, client)=>{
    site.delete('/reconhecimento/:id', async (req, res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            await servico.delete(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}