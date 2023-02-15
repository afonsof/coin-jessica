import { CarteiraMoedasRecebidas } from './carteira-moedas-recebidas'

describe('CarteiraMoedasRecebidas', () => {
    describe('constructor', () => {
        it('deve construir com sucesso caso todos os parametros sejam validos', () => {
            const carteira = new CarteiraMoedasRecebidas(123, 100)
            expect(carteira).toEqual({
                idUsuario: 123,
                saldo: 100,
            })
        })

        it('deve disparar um erro, caso o id seja invalido', () => {
            expect.assertions(1)
            try {
                new CarteiraMoedasRecebidas(undefined, 1000)
            } catch (error) {
                expect(error).toEqual(new Error('O usuário precisa ter Id'))
            }
        })

        it('deve disparar um erro, caso o saldo seja invalido', () => {
            expect.assertions(1)
            try {
                new CarteiraMoedasRecebidas(123, undefined)
            } catch (error) {
                expect(error).toEqual(new Error('Carteira do usuário precisa ter saldo'))
            }
        })

        it('deve disparar um erro caso o saldo seja menor que zero', () => {
            expect.assertions(1)
            try {
                new CarteiraMoedasRecebidas(123, -1)
            } catch (error) {
                expect(error).toEqual(new Error('Carteira do usuário precisa ter saldo positivo'))
            }
        })

        it('deve disparar um erro caso o saldo não seja um número', () => {
            expect.assertions(1)
            try {
                new CarteiraMoedasRecebidas(123, 'abc' as any)
            } catch (error) {
                expect(error).toEqual(new Error('O saldo da carteira do usuário precisa ser um número'))
            }
        })
    })
})