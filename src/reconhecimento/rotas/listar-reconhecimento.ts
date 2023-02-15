import { Express } from 'express'
import { ServicoReconhecimento } from '../servico/servico-reconhecimento'

export const listarReconhecimentos = (site:Express, client)=>{
    site.get('/reconhecimento', async (req, res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            const reconhecimentos = await servico.listar()
            res.send(reconhecimentos)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}