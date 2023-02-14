import { Reconhecimento } from "./reconhecimento";
import dayjs from "dayjs";

describe('Reconhecimento', ()=>{
    describe('constructor', ()=>{
        it('deve construir com sucesso caso todos os parametros sejam validos', ()=> {
            const reconhecimento = new Reconhecimento(123, 'agradecimento', dayjs('2023-01-05').toDate(), 10, 'pendente', 4,7)
            expect(reconhecimento).toEqual({
                id: 123,
                descricao: 'agradecimento',
                data: dayjs('2023-01-05').toDate(),
                qtdMoedasDoadas: 10,
                status: 'pendente',
                idDeUsuario: 4,
                idParaUsuario:7
            })
        })
        
        it('deve disparar um erro,caso nao tenha descrição ', ()=> {
            expect.assertions(1)
            try {
                const reconhecimento = new Reconhecimento(123, undefined, dayjs('2023-01-05').toDate(), 10, 'pendente', 4,7)
            } catch(error) {    
                expect(error).toEqual(new Error('Reconhecimento precisa ser preenchido com algum agradecimento'))
            }
        })
    
        it('deve disparar um erro,caso a descrição não seja string', ()=> {
            expect.assertions(1)
            try {
                const reconhecimento = new Reconhecimento(123, 123 as any, dayjs('2023-01-05').toDate(), 10, 'pendente', 4,7)
            } catch(error) {    
                expect(error).toEqual(new Error('A descrição precisa ser uma string'))
            }
        })
    
        it('deve disparar um erro,a quantidade de moedas doadas não seja declarada', ()=> {
            expect.assertions(1)
            try {
                const reconhecimento = new Reconhecimento(123, 'agradecimento', dayjs('2023-01-05').toDate(), undefined, 'pendente', 4,7)
            } catch(error) {    
                expect(error).toEqual(new Error('A quantidade de moedas a serem doadas precisa ser declarada'))
            }
        })
    
        it('deve disparar um erro,a quantidade de moedas doadas não seja um numero', ()=> {
            expect.assertions(1)
            try {
                const reconhecimento = new Reconhecimento(123, 'agradecimento', dayjs('2023-01-05').toDate(), 'abc' as any, 'pendente', 4,7)
            } catch(error) {    
                expect(error).toEqual(new Error('A qtdMoedasDoadas precisa ser um número'))
            }
        })
    
        it('deve disparar um erro,caso a quantidade de moedas doadas seja menor ou igual a zero', ()=> {
            expect.assertions(1)
            try {
                const reconhecimento = new Reconhecimento(123, 'agradecimento', dayjs('2023-01-05').toDate(), 0, 'pendente', 4,7)
            } catch(error) {    
                expect(error).toEqual(new Error('Moedas doadas devem ser maior que zero'))
            }
        })
    
        it('deve disparar um erro,caso o idParaUsuario não seja declarado', ()=> {
            expect.assertions(1)
            try {
                const reconhecimento = new Reconhecimento(123, 'agradecimento', dayjs('2023-01-05').toDate(), 10, 'pendente', 4,undefined)
            } catch(error) {    
                expect(error).toEqual(new Error('O usuário à receber o reconhecimento precisa ser declarado'))
            }
        })
    
    })
    
})