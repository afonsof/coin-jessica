import { Express } from "express";
import { ServicoReconhecimento } from "../servico/servico-reconhecimento";

export const createReconhecimento = (site:Express, client)=>{
    site.post('/reconhecimento', async (req,res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            await servico.create(req.body.descricao, req.body.data,
                req.body.qtdMoedasDoadas, req.body.idDeUsuario, req.body.idParaUsuario
            )
            
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}