import { IDatabase} from "pg-promise"
import { Pedido } from "../dominio/pedido"


export class ServicoPedido {
    client: IDatabase<any>
    constructor(client: IDatabase<any>){
        this.client = client
    }
    async listar(): Promise<Pedido[]>{
        const linhas = await this.client.query(`select cp.id, data, cu.nome as funcionario
        from coin_pedido cp
        join coin_usuario cu on cu.id = cp.id_funcionario`)

        const pedidos: Pedido[] = []

        linhas.forEach(linha =>{
            pedidos.push(new Pedido(linha.id, linha.data, linha.funcionario))
        })

        return pedidos
    }
}