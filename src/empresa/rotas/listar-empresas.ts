import {Express} from 'express'
import { ServicoEmpresa } from '../servico/servico-empresa'

export const listarEmpresas = (site:Express, client) =>{
    site.get('/empresa', async (req, res)=>{
        try{
            const servico = new ServicoEmpresa(client)
            const empresas = await servico.listar()
            res.send(empresas)

        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}