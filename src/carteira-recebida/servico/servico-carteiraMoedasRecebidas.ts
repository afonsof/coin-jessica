import { IDatabase } from "pg-promise";
import { ServicoUsuario } from "../../usuario/servico/servico-usuario";

interface GetCarteiraMoedasRecebidas {
    nome: string
    saldo: number
    idUsuario: number
}

export class ServicoCarteiraMoedasRecebidas {
    
    client: IDatabase<any>
    servicoUsuario: ServicoUsuario  

    constructor(client: IDatabase<any>){
        this.client = client
        this.servicoUsuario = new ServicoUsuario(client)
    }
    async get(idUsuario:number): Promise<GetCarteiraMoedasRecebidas>{

        const usuario = await this.servicoUsuario.get(idUsuario)

        const carteiraRecebidaUsuarioNoBD = await this.client.query(
         `select * from coin_carteira_moedas_recebidas 
         where id_usuario = $1::int`,[idUsuario]
        )

        if(carteiraRecebidaUsuarioNoBD.length ===0){
            throw new Error('Usuário não encontrado ou usuário sem carteira')
        }

        const carteiraMoedaRecebida = carteiraRecebidaUsuarioNoBD[0]

        const carteiraMoedasRecebidas = {
            nome:usuario.nome, 
            saldo:carteiraMoedaRecebida.saldo,
            idUsuario:idUsuario
        }        
        return carteiraMoedasRecebidas
    }

    async creditar(valorParaCreditar: number, idUsuario: number): Promise<void>{
        const saldosCarteirasRecebidas: any[] = await this.client.query(`select saldo from coin_carteira_moedas_recebidas
        where id_usuario = $1::int`, [idUsuario])

        if(saldosCarteirasRecebidas.length === 0){
            throw new Error('Carteira de moedas recebidas não encontrada')
        }

        const saldoAtual = saldosCarteirasRecebidas[0].saldo

        await this.client.query(`update coin_carteira_moedas_recebidas set 
        saldo = $1::int
        where id_usuario = $2::int`,[saldoAtual + valorParaCreditar, idUsuario])
    }

    async debitar(valorParaDebitar: number, idUsuario: number): Promise<void> {
        const saldosCarteirasRecebidas: any[] = await this.client.query(`select saldo from coin_carteira_moedas_recebidas
         where id_usuario = $1::int`, [idUsuario])

        if(saldosCarteirasRecebidas.length === 0){
            throw new Error('Carteira de moedas recebidas não encontrada')
        }
        const saldoAtual = saldosCarteirasRecebidas[0].saldo

        if((saldoAtual-valorParaDebitar) < 0) {
            throw new Error('Usuário não tem saldo suficiente')
        }

        await this.client.query(`update coin_carteira_moedas_recebidas set 
        saldo = $1::int
        where id_usuario = $2::int`,[saldoAtual - valorParaDebitar, idUsuario])
    }
}