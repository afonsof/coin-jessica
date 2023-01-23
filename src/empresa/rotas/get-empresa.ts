import { Express } from "express";
import { ServicoEmpresa } from "../servico/servico-empresa";

export const getEmpresas = (site: Express, client) =>{
    site.get('/empresa/:id', async (req, res)=>{
        try{
            const servico = new ServicoEmpresa(client)
            const empresa = await servico.get(Number(req.params.id))

            res.send(empresa)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}



