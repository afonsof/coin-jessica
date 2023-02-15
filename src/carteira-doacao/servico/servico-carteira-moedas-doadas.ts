import { IDatabase } from 'pg-promise'
import { ServicoUsuario } from '../../usuario/servico/servico-usuario'

interface GetCarteiraMoedasDoadas {
    nome: string
    saldo: number
    idUsuario: number
}

export class ServicoCarteiraMoedasDoadas{
    
    client: IDatabase<any>
    servicoUsuario: ServicoUsuario    

    constructor(client: IDatabase<any>){
        this.client = client
        this.servicoUsuario = new ServicoUsuario(client)
    }

    async get(idUsuario:number): Promise<GetCarteiraMoedasDoadas>{

        const usuario = await this.servicoUsuario.get(idUsuario)

        const carteiraDoadaDeUsuario = await this.client.oneOrNone(
            `select * from coin_carteira_moedas_doadas cmd 
             where id_usuario =  $1::int`,
            [idUsuario],
        )

        if(!carteiraDoadaDeUsuario){
            throw new Error('Usuário não encontrado ou usuário sem carteira')
        }

        const carteiraMoedasDoadas = {
            nome:usuario.nome, 
            saldo:carteiraDoadaDeUsuario.saldo,
            idUsuario:idUsuario,
        }
        return carteiraMoedasDoadas
    }

    async debitar(valorParaDebitar: number, idUsuario: number): Promise<void> {

        const saldoCarteiraDoada = await this.client.oneOrNone(
            `select saldo from coin_carteira_moedas_doadas
            where id_usuario = $1::int`, [idUsuario],
        )

        if(!saldoCarteiraDoada){
            throw new Error('Carteira de moedas doadas não encontrada')
        }

        if((saldoCarteiraDoada.saldo - valorParaDebitar) < 0) {
            throw new Error('Usuário não tem saldo suficiente')
        }

        await this.client.query(`update coin_carteira_moedas_doadas set 
        saldo = $1::int
        where id_usuario = $2::int`,[saldoCarteiraDoada.saldo - valorParaDebitar, idUsuario])
    }

    async creditar(valorParaCreditar: number, idUsuario: number): Promise<void> {
        const saldoCarteiraDoada = await this.client.oneOrNone(
            `select saldo from coin_carteira_moedas_doadas
            where id_usuario = $1::int`, [idUsuario],
        )

        if(!saldoCarteiraDoada){
            throw new Error('Carteira de moedas doadas não encontrada')
        }

        await this.client.query(`update coin_carteira_moedas_doadas set 
        saldo = $1::int
        where id_usuario = $2::int`,[saldoCarteiraDoada.saldo + valorParaCreditar, idUsuario])
    }
}