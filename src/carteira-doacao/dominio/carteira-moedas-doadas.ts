export class CarteiraMoedasDoadas {
    idUsuario: number
    saldo: number

    constructor(idUsuario:number, saldo:number){
        this.idUsuario = idUsuario
        this.saldo = saldo

        if(!idUsuario) {
            throw new Error('O usuário precisa ter Id')
        }
       
    }
}