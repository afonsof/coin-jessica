export class CarteiraMoedasDoadas {
    idUsuario: number
    saldo: number

    constructor(idUsuario:number, saldo:number){
        this.idUsuario = idUsuario
        this.saldo = saldo

        if(!idUsuario) {
            throw new Error('O usuário precisa ter Id')
        }
        if(!saldo) {
            throw new Error('Carteira do usuário precisa ter saldo')
        }
        if(saldo < 0) {
            throw new Error('Carteira do usuário precisa ter saldo positivo')
        }
        if(typeof saldo !== 'number') {
            throw new Error('O saldo da carteira do usuário precisa ser um número')
        }
    }
}