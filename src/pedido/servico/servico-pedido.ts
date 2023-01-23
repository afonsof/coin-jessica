import { IDatabase} from "pg-promise"
import { Pedido } from "../dominio/pedido"



interface ListarPedido {
    idPedido: number
    data: Date
    nomeFuncionario:string
    
}


interface GetPedidoProduto {
    // id: number,
    nome: string,
    valor: number,
    qtd: number,
    total: number
}

interface GetPedido {
    id: number,
    total: number,
    // data: Date,
    // nomeFuncionario: string

    produtos: GetPedidoProduto[]
}



export class ServicoPedido {
    client: IDatabase<any>

    constructor(client: IDatabase<any>){
        this.client = client
    }

    async listar(): Promise<ListarPedido[]>{
        const linhas = await this.client.query(`select cp.id, data, cu.nome as funcionario
        from coin_pedido cp
        join coin_usuario cu on cu.id = cp.id_funcionario`)

  
        const pedidos: ListarPedido[] = []

        linhas.forEach(linha =>{
            pedidos.push({
                idPedido: linha.id,
                data: linha.data,
                nomeFuncionario: linha.funcionario
            })
        })

        return pedidos
    }

    async get(id:number): Promise<GetPedido>{
        const linhas = await this.client.query(`select * from (
            select cp.id, cp2.nome, cpp.valor_unitario, cpp.qtd, cpp.qtd * cpp.valor_unitario as valor_total_produto from  coin_pedido cp
           join coin_produto_pedido cpp on cpp.id_pedido = cp.id
           join coin_produto cp2 on cp2.id = cpp.id_produto
        )q1 
        join (
           select cp.id, cast(sum(cpp.qtd * cpp.valor_unitario) as int) as total_pedido from coin_pedido cp
           inner join coin_produto_pedido cpp on cpp.id_pedido = cp.id 
           group by cp.id
           having cp.id = $1::int    
        ) q2 on q1.id = q2.id`,[id])

        if(linhas.length === 0){
            throw new Error('pedido não encontrado')
        }

        console.log(linhas[0])

        const pedido: GetPedido = {
            id: id,
            total: linhas[0].total_pedido, 
            produtos: linhas.map(linha=>{
                return {
                    nome: linha.nome,
                    valor: linha.valor_unitario,
                    qtd: linha.qtd,
                    total: linha.valor_total_produto,
                }
            })
        }

        // const pedido: GetPedido = {
        //     id: id,
        //     total: linhas[0].total_pedido, 
        //     produtos: []
        // }

        // for(let i = 0; i < linhas.length; i++) {
        //     const linha = linhas[i];
        //     pedido.produtos.push({
        //         nome: linha.nome,
        //         valor: linha.valor_unitario,
        //         qtd: linha.qtd,
        //         total: linha.valor_total_produto,
        //     })
        // }
        return pedido
    }





}