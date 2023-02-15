import { ProdutoDoPedido } from './pedido'
import { Pedido } from './pedido'
import dayjs from 'dayjs'

describe('ProdutoDoPedido', () => {
    describe('constructor', () => {
        it('deve construir com sucesso caso todos os parametros sejam validos', () => {
            const produtosDoPedido = new ProdutoDoPedido(123, 2, 10)
            expect(produtosDoPedido).toEqual({
                idProduto: 123,
                qtd: 2,
                valorUnitario: 10,
            })
        })

        it('deve disparar um erro, caso o idProduto seja invalido', () => {
            expect.assertions(1)
            try {
                new ProdutoDoPedido(undefined, 2, 10)
            } catch (error) {
                expect(error).toEqual(new Error('Produto do pedido precisa de idProduto'))
            }
        })

        it('deve disparar um erro, caso o idProduto não seja um numero', () => {
            expect.assertions(1)
            try {
                new ProdutoDoPedido('abc' as any, 2, 10)
            } catch (error) {
                expect(error).toEqual(new Error('O idProduto precisa ser uma number'))
            }
        })

        it('deve disparar um erro, caso o pedido não tenha quantidade', () => {
            expect.assertions(1)
            try {
                new ProdutoDoPedido(1234, undefined, 10)
            } catch (error) {
                expect(error).toEqual(new Error('Produto do pedido precisa de quantidade do produto'))
            }
        })

        it('deve disparar um erro, caso a qtd do produto não seja um numero', () => {
            expect.assertions(1)
            try {
                new ProdutoDoPedido(122, 'abc' as any, 10)
            } catch (error) {
                expect(error).toEqual(new Error('A qtd precisa ser um number'))
            }
        })

        it('deve disparar um erro, caso a quantidade do produto seja menor ou igual a que zero', () => {
            expect.assertions(1)
            try {
                new ProdutoDoPedido(1234, 0, 10)
            } catch (error) {
                expect(error).toEqual(new Error('Produto do pedido precisa que a quantidade do produto seja maior que zero'))
            }
        })

        it('deve disparar um erro, caso o valor unitario não seja um numero', () => {
            expect.assertions(1)
            try {
                new ProdutoDoPedido(122, 2, 'abc' as any)
            } catch (error) {
                expect(error).toEqual(new Error('O valor unitatio precisa ser um number'))
            }
        })
    })
})

describe('Pedido', () => {
    describe('constructor', () => {
        it('deve construir com sucesso caso todos os parametros sejam validos', () => {
            const pedido = new Pedido(123, dayjs('2023-01-05').toDate(), 2, 'pendente')
            expect(pedido).toEqual({
                id: 123,
                data: dayjs('2023-01-05').toDate(),
                idUsuario: 2,
                status: 'pendente',
            })
        })

        it('deve disparar um erro, caso o idUsuario seja invalido', () => {
            expect.assertions(1)
            try {
                new Pedido(123, dayjs('2023-01-05').toDate(), undefined, 'pendente')
            } catch (error) {
                expect(error).toEqual(new Error('Pedido precisa de um usuário'))
            }
        })

        it('deve disparar um erro, caso o status não seja string', () => {
            expect.assertions(1)
            try {
                new Pedido(123, dayjs('2023-01-05').toDate(), 4, 123 as any)
            } catch (error) {
                expect(error).toEqual(new Error('O status precisa ser uma string'))
            }
        })
    })
})