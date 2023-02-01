export class ProdutoDoPedido {
    idProduto:number
    qtd: number
    valorUnitario: number 
    



    constructor(idProduto:number, qtd:number, valorUnitario:number){
        this.idProduto = idProduto
        this.qtd = qtd
        this.valorUnitario = valorUnitario

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
    status: string

    produtos: ProdutoDoPedido[]

    constructor(idPedido:number|undefined, data:Date, idUsuario: number, status: string){
        this.id = idPedido
        this.data = data
        this.idUsuario = idUsuario
        this.status = status

        if(!idUsuario){
            throw new Error('Pedido precisa de um usuário')
        }
    }
}