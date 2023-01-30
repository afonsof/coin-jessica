export class CarteiraMoedasRecebidas {
    idUsuario: number
    saldo: number

    constructor(idUsuario:number, saldo:number){
        this.idUsuario = idUsuario
        this.saldo = saldo

        if(!idUsuario) {
            throw new Error('Usuário precisa ter Id')
        }
       
    }
}