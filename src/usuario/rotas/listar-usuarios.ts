import { Express } from 'express'
import { ServicoUsuario } from '../servico/servico-usuario'

export const listarUsuarios = (site: Express, client) =>{
    site.get('/usuario', async (req, res)=>{
        try{
            const servico = new ServicoUsuario(client)
            const usuarios = await servico.listar()
            res.send(usuarios)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}