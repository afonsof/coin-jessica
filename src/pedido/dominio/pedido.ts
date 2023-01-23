export class Pedido {
    id?: number
    data: Date
    idUsuario: number

    constructor(id:number|undefined, data:Date, idUsuario: number){
        this.id = id
        this.data = data
        this.idUsuario = idUsuario

        if(!idUsuario){
            throw new Error('Pedido precisa de um usuario')
        }
    }
}