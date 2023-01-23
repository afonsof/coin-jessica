export class ProdutoDoPedido {

    qtd: number
    valorUnitario: number 
    status: string



    constructor(qtd:number, valorUnitario:number, status: string ){
        this.qtd = qtd
        this.valorUnitario = valorUnitario
        this.status = status
    }



}



export class Pedido {
    id?: number
    data: Date
    idUsuario: number

    produtos: ProdutoDoPedido[]
   



    constructor(id:number|undefined, data:Date, idUsuario: number ){
        this.id = id
        this.data = data
        this.idUsuario = idUsuario

        if(!idUsuario){
            throw new Error('Pedido precisa de um usuario')
        }
    }
}