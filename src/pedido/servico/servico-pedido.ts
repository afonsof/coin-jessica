
import { IDatabase } from "pg-promise"
import { CarteiraMoedasRecebidas } from "../../carteira-recebimento/dominio/carteiraMoedasRecebidas"
import { ServicoCarteiraMoedasRecebidas } from "../../carteira-recebimento/servico/servico-carteiraMoedasRecebidas"
import { Produto } from "../../produto/dominio/produto"
import { ServicoProduto } from "../../produto/servico/servico-produto"
import { Pedido } from "../dominio/pedido"



interface ListarPedido {
    idPedido: number
    data: Date
    nomeFuncionario: string

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

interface GetProdutoAprovar {

    idProduto: number,
    nome: string,
    estoque: number,
    qtd: number,
    valorUnitario: number,
}


interface GetPedidoAprovar {
    idPedido: number,
    idUsuario: number,
    saldoCarteira: number,
    produtos: GetProdutoAprovar[]

}

interface ProdutosDoPedido {
    idProduto: number,
    qtd: number,

}




export class ServicoPedido {
    client: IDatabase<any>
    servicoProduto: ServicoProduto

    servicoCarteiraMoedasRecebidas: ServicoCarteiraMoedasRecebidas


    constructor(client: IDatabase<any>) {
        this.client = client
        this.servicoProduto = new ServicoProduto(client)
        this.servicoCarteiraMoedasRecebidas = new ServicoCarteiraMoedasRecebidas(client)

    }

    async listar(): Promise<ListarPedido[]> {
        const linhas = await this.client.query(`select cp.id, data, cu.nome as funcionario
        from coin_pedido cp
        join coin_usuario cu on cu.id = cp.id_funcionario`)


        const pedidos: ListarPedido[] = []

        linhas.forEach(linha => {
            pedidos.push({
                idPedido: linha.id,
                data: linha.data,
                nomeFuncionario: linha.funcionario
            })
        })

        return pedidos
    }

    async get(id: number): Promise<GetPedido> {
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
        ) q2 on q1.id = q2.id`, [id])

        if (linhas.length === 0) {
            throw new Error('pedido não encontrado')
        }



        const pedido: GetPedido = {
            id: id,
            total: linhas[0].total_pedido,
            produtos: linhas.map(linha => {
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


    async aprovar(id: number): Promise<void> {

        // ver se o id do pedido encontra-se pendente
        // ver se o saldo ẽ maior que o valor do o pedido
        // ver se tem o produto em estoque
        // debitar do saldo o valor do pedido
        // fazer um update do id do pedido alterando o status para 'aprovado'

        const localizaId = await this.client.query(`select * from coin_produto_pedido
        where id_pedido = $1::int and status = 'pendente'`, [id])

        if (localizaId.length === 0) {
            throw new Error('id pedido não encontrado para análise')
        }

        // const produtosPedido: any[] = this.client.query(`select * from coin_produto_pedido`)


        // const usuario = this.servicoUsuario.get(pedido.idUsuario)

        // const carteiraMoedasRecebidas = this.servicoCarteiraMoedasRecebidas.get(pedido.idUsuario)

        // const produtos = this.servicoProduto.get()


        const linhas = await this.client.query(`select pedido.id,
        produto.id,
        recebidas.saldo,
        produto.nome,
        produto.estoque,
        produto_pedido.qtd, 
        produto_pedido.valor_unitario,
        usuario.id as id_funcionario
     from coin_produto_pedido produto_pedido
     join coin_pedido pedido on produto_pedido.id_pedido = pedido.id
     join coin_usuario usuario  on usuario.id = pedido.id_funcionario
     join coin_carteira_moedas_recebidas recebidas on usuario.id = recebidas.id_funcionario 
     join coin_produto produto on produto.id = produto_pedido.id_produto 
     where pedido.id = $1::int`, [id])


        if (linhas.length === 0) {
            throw new Error('id do pedido não encontrado ou já aprovado')
        }

        const pedido: GetPedidoAprovar = {
            idPedido: id,
            idUsuario: linhas[0].id_funcionario,
            saldoCarteira: linhas[0].saldo,
            produtos: linhas.map(linha => {
                return {
                    idProduto: linha.id,
                    nome: linha.nome,
                    estoque: linha.estoque,
                    qtd: linha.qtd,
                    valorUnitario: linha.valor_unitario

                }
            })
        }

        let valorTotalPedido = 0
        pedido.produtos.forEach(produto => {
            valorTotalPedido += produto.valorUnitario * produto.qtd
        })

        console.log(valorTotalPedido)




        if (pedido.saldoCarteira < valorTotalPedido) {
            await this.reprovar(pedido.idPedido)
            throw new Error('Usuário não tem saldo suficiente para aprovar o pedido.')
        }

        pedido.produtos.forEach(produto => {
            if (produto.qtd > produto.estoque) {
                throw new Error(`Foi requisitado ${produto.qtd} unidades do produto ${produto.nome}, mas só tem ${produto.estoque} em estoque`)
            }
        })

        console.log(pedido.produtos)

        await Promise.all(pedido.produtos.map(async produto => {                    //nesse caso é um map da função atualiza estoque para percorrer todos os produtos
            return this.servicoProduto.atualizarEstoque(produto.idProduto, produto.qtd)
        }))


        await this.servicoCarteiraMoedasRecebidas.debitar(valorTotalPedido, pedido.idUsuario)

        await this.client.query(`update coin_produto_pedido set
        status = 'aprovado'
        where id_pedido = $1::int`, [id])

    }

    async reprovar(id: number): Promise<void> {
        const localizaId = await this.client.query(`select * from coin_produto_pedido
        where id_pedido = $1::int and status = 'pendente'`, [id])

        if (localizaId.length === 0) {
            throw new Error('id pedido não encontrado para análise')
        }

        await this.client.query(`update coin_produto_pedido set
        status = 'reprovado'
        where id_pedido = $1::int`, [id])


    }


    // O que precisa para criar um pedido?
    // id usuario, ids dos produtos e quantidade dos produtos
    // Funcao precisa retornar nada
    async create(idUsuario: number, produtos: ProdutosDoPedido[]): Promise<void> {

        // OK saber se o id do produto existe
        // OK saber se a quantidade do produto tem disponivel em estoque
        // criar um pedido com os dados fornecidos

        const produtosNoBanco = await Promise.all(produtos.map(async produto=>{
            return this.servicoProduto.get(produto.idProduto)
        }))

        await Promise.all(produtos.map(async produto => {
            return this.servicoProduto.conferirQtdEstoque(produto.idProduto, produto.qtd)
        }))

        const dataAtual = new Date()
        
        const res = await this.client.query(
            `insert into coin_pedido (data, id_funcionario) values ($1::date, $2::int) RETURNING id`,
            [dataAtual, idUsuario]
        )

        const idPedido = res[0].id

        await Promise.all(produtos.map(async (produto, indice) => {
            const produtoNoBanco = produtosNoBanco[indice]
            await this.client.query(
                `insert into coin_produto_pedido (id_pedido, id_produto, valor_unitario, qtd, status) values
                ($1::int, $2::int, $3::int, $4::int, $5::text)`,
                [idPedido, produto.idProduto, produtoNoBanco.valor, produto.qtd, 'pendente']
            )
        }))
    }


    
}





