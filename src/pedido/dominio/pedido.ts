export class ProdutoDoPedido {
    idProduto:number
    qtd: number
    valorUnitario: number 
    status: string



    constructor(idProduto:number, qtd:number, valorUnitario:number, status: string ){
        this.idProduto = idProduto
        this.qtd = qtd
        this.valorUnitario = valorUnitario
        this.status = status

        if(!idProduto){
            throw new Error('Produto do pedido precisa de idProduto')
        }
        if(!qtd){
            throw new Error('Produto do pedido precisa de quantidade do produto')
        }
        if(qtd <= 0){
            throw new Error('Produto do pedido precisa que a quantidade do produto seja maio que zero')
        }
        
    }
}

export class Pedido {
    id?: number
    data: Date
    idUsuario: number

    produtos: ProdutoDoPedido[]

    constructor(idPedido:number|undefined, data:Date, idUsuario: number ){
        this.id = idPedido
        this.data = data
        this.idUsuario = idUsuario

        if(!idUsuario){
            throw new Error('Pedido precisa de um usuário')
        }
    }
}