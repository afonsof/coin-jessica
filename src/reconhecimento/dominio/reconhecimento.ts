export class Reconhecimento {
    id?: number
    descricao: string
    data: Date
    qtdMoedasDoadas: number
    status: string
    idDeUsuario: number
    idParaUsuario: number

    constructor(idReconhecimento: number|undefined, descricao: string, data: Date, qtdMoedasDoadas: number, status: string, idDeUsuario: number, idParaUsuario: number){
        this.id = idReconhecimento
        this.descricao = descricao
        this.data = data
        this.qtdMoedasDoadas = qtdMoedasDoadas
        this.status = status
        this.idDeUsuario = idDeUsuario
        this.idParaUsuario = idParaUsuario

        if(!descricao){
            throw new Error('Reconhecimento precisa ser preenchido com algum agradecimento')
        }
        if(!qtdMoedasDoadas){
            throw new Error('A quantidade de moedas a serem doadas precisa ser declarada')
        }
        if(!idParaUsuario){
            throw new Error('O usuário à receber o reconhecimento precisa ser declarado')
        }
        if(qtdMoedasDoadas <= 0){
            throw new Error('Moedas doadas devem ser maior que zero')
        }
    }
}