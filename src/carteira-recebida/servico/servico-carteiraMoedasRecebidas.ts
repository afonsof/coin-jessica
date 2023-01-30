import { IDatabase } from "pg-promise";

interface GetCarteiraMoedasRecebidas {
    nome: string
    saldo: number
    idUsuario: number
}

export class ServicoCarteiraMoedasRecebidas {
    
    client: IDatabase<any>

    constructor(client: IDatabase<any>){
        this.client = client
    }
    async get(idUsuario:number): Promise<GetCarteiraMoedasRecebidas>{
        const carteiraRecebidaUsuarioNoBD = await this.client.query(`select cu.nome , cmr.saldo as saldo_recebido
        from coin_usuario cu 
        join coin_carteira_moedas_recebidas cmr on cmr.id_usuario = cu.id
        where id_usuario = $1::int`,[idUsuario])

        if(carteiraRecebidaUsuarioNoBD.length ===0){
            throw new Error('Usuário não encontrado ou usuário sem carteira')
        }

        const carteiraMoedaRecebida = carteiraRecebidaUsuarioNoBD[0]

        const carteiraMoedasRecebidas = {
            nome:carteiraMoedaRecebida.nome, 
            saldo:carteiraMoedaRecebida.saldo_recebido,
            idUsuario:idUsuario
        }        
        return carteiraMoedasRecebidas
    }

    async creditar(valorParaCreditar: number, idUsuario: number): Promise<void>{
        const localizaIDParaUsuario: any[] = await this.client.query(`select saldo from coin_carteira_moedas_recebidas
        where id_usuario = $1::int`, [idUsuario])

        if(localizaIDParaUsuario.length === 0){
            throw new Error('Carteira de moedas recebidas não encontrada')
        }

        const saldoAtual = localizaIDParaUsuario[0].saldo

        await this.client.query(`update coin_carteira_moedas_recebidas set 
        saldo = $1::int
        where id_usuario = $2::int`,[saldoAtual + valorParaCreditar, idUsuario])
    }

    async debitar(valorParaDebitar: number, idUsuario: number): Promise<void> {
        const localizaIDDeUsuario: any[] = await this.client.query(`select saldo from coin_carteira_moedas_recebidas
         where id_usuario = $1::int`, [idUsuario])

        if(localizaIDDeUsuario.length === 0){
            throw new Error('Carteira de moedas recebidas não encontrada')
        }
        const saldoAtual = localizaIDDeUsuario[0].saldo

        if((saldoAtual-valorParaDebitar) < 0) {
            throw new Error('Usuário não tem saldo suficiente')
        }

        await this.client.query(`update coin_carteira_moedas_recebidas set 
        saldo = $1::int
        where id_usuario = $2::int`,[saldoAtual - valorParaDebitar, idUsuario])
    }
}