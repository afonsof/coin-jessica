import { IDatabase } from "pg-promise"
import { ServicoCarteiraMoedasRecebidas } from "../../carteira-recebimento/servico/servico-carteiraMoedasRecebidas"
import { ServicoProduto } from "../../produto/servico/servico-produto"

interface ListarPedido {
    idPedido: number
    data: Date
    nomeFuncionario: string

}

interface GetPedidoProduto {
    // idPedido: number,
    nome: string,
    valor: number,
    qtd: number,
    total: number
}

interface GetPedido {
    idPedido: number,
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

    async get(idPedido: number): Promise<GetPedido> {
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
        ) q2 on q1.id = q2.id`, [idPedido])

        if (linhas.length === 0) {
            throw new Error('pedido não encontrado')
        }

        const pedido: GetPedido = {
            idPedido: idPedido,
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

        
        return pedido
    }


    async aprovar(idPedido: number): Promise<void> {
        // ok ver se o idPedido do pedido encontra-se pendente
        // ver se o saldo ẽ maior que o valor do o pedido
        // ver se tem o produto em estoque
        // debitar do saldo o valor do pedido
        // fazer um update do id do pedido alterando o status para 'aprovado'

        const produtosPendentesDoPedido = await this.client.query(
            `select * from coin_produto_pedido
             where id_pedido = $1::int and status = 'pendente'`,
             [idPedido]
        )

        if (produtosPendentesDoPedido.length === 0) {
            throw new Error('Nao existem produtos no pedido que estao pendentes')
        }

        const pedidos = await this.client.query(
            `select * from coin_pedido
             where idPedido = $1::int`,
             [idPedido]
        )
        const pedido = pedidos[0]

        const linhas = await this.client.query(
            `select cast(sum(valor_unitario) as int) as total
             from coin_produto_pedido
             where id_pedido = $1::int`,
             [idPedido]
        )
        const totalPedido = linhas[0].total

        const carteiraRecebida = await this.servicoCarteiraMoedasRecebidas.get(pedido.id_funcionario)
        if(carteiraRecebida.saldo < totalPedido){
            await this.reprovar(idPedido)
            throw new Error(('Usuário não tem saldo suficiente para aprovar o pedido.'))
        }

        const produtosDoPedido: any[] = await this.client.query(`select * from coin_produto_pedido produtoPedido
        join coin_produto produto on produto.idPedido = produtopedido.id_produto 
        where id_pedido  =  $1::int`,[idPedido])
            
        produtosDoPedido.forEach(produto =>{
            if(produto.qtd > produto.estoque){
                throw new Error(`Foi requisitado ${produto.qtd} unidades do produto ${produto.nome}, mas só tem ${produto.estoque} em estoque`)
            }
        })

        //nesse caso é um map da função atualiza estoque para percorrer todos os produtos
        await Promise.all(produtosDoPedido.map(async produto => {
            return this.servicoProduto.atualizarEstoque(produto.id_produto, produto.qtd)
        }))

        await this.servicoCarteiraMoedasRecebidas.debitar(totalPedido, pedido.id_funcionario)

        await this.client.query(`update coin_produto_pedido set
        status = 'aprovado'
        where id_pedido = $1::int`, [idPedido])
    }

    async reprovar(idPedido: number): Promise<void> {
        const localizaId = await this.client.query(`select * from coin_produto_pedido
        where id_pedido = $1::int and status = 'pendente'`, [idPedido])

        if (localizaId.length === 0) {
            throw new Error('idPedido pedido não encontrado para análise')
        }

        await this.client.query(`update coin_produto_pedido set
        status = 'reprovado'
        where id_pedido = $1::int`, [idPedido])
    }


    // O que precisa para criar um pedido?
    // idPedido usuario, ids dos produtos e quantidade dos produtos
    // Funcao precisa retornar nada
    async create(idUsuario: number, produtos: ProdutosDoPedido[]): Promise<void> {

        // OK saber se o idPedido do produto existe
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






