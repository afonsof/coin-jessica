import { IDatabase } from "pg-promise";
import { CarteiraMoedasDoadas } from "../dominio/carteira-moedas-doadas";

interface GetCarteiraMoedasDoadas {
    nome: string
    saldo: number
    idUsuario: number
}

export class ServicoCarteiraMoedasDoadas{
    
    client: IDatabase<any>
    

    constructor(client: IDatabase<any>){
        this.client = client
    }
    async get(idUsuario:number): Promise<GetCarteiraMoedasDoadas>{
        const linhas = await this.client.query(`select cu.nome , cmd.saldo as saldo_doado
        from coin_usuario cu 
        join coin_carteira_moedas_doadas cmd on cmd.id_funcionario = cu.id
        where id_funcionario = $1::int`,[idUsuario])

        if(linhas.length ===0){
            throw new Error('usuario sem carteira')
        }

        const linha = linhas[0]
        const carteiraMoedasDoadas = {
            nome:linha.nome, 
            saldo:linha.saldo_doado,
            idUsuario:idUsuario
        }

        return carteiraMoedasDoadas
    }

    async debitar(valorParaDebitar: number, idUsuario: number): Promise<void> {

        const localizaIDDeUsuario: any[] = await this.client.query(`select saldo from coin_carteira_moedas_doadas
         where id_funcionario = $1::int`, [idUsuario])

        if(localizaIDDeUsuario.length === 0){
            throw new Error('id de usuario não encontrado')
        }

        const saldoAtual = localizaIDDeUsuario[0].saldo

        if((saldoAtual-valorParaDebitar) < 0) {
            throw new Error('Usuário sem saldo suficiente')
        }

        await this.client.query(`update coin_carteira_moedas_doadas set 
        saldo = $1::int
        where id_funcionario = $2::int`,[saldoAtual - valorParaDebitar, idUsuario])
    }

    async creditar(valorParaCreditar: number, idUsuario: number): Promise<void> {
        const localizaIDDeUsuario: any[] = await this.client.query(`select saldo from coin_carteira_moedas_doadas
         where id_funcionario = $1::int`, [idUsuario])

        if(localizaIDDeUsuario.length === 0){
            throw new Error('id de usuario, não encontrado')
        }

        const saldoAtual = localizaIDDeUsuario[0].saldo

        await this.client.query(`update coin_carteira_moedas_doadas set 
        saldo = $1::int
        where id_funcionario = $2::int`,[saldoAtual + valorParaCreditar, idUsuario])
    }
}