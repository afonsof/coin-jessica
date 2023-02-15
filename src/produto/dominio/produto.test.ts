import { Produto } from './produto'

describe('Produto', () => {
    describe('contructor', () => {
        it('deve construir com sucesso caso todos os parametros sejam validos', () => {
            const produto = new Produto(123, 'lapis', 5, 10)
            expect(produto).toEqual({
                id: 123,
                nome: 'lapis',
                valor: 5,
                estoque: 10,
            })
        })

        it('deve disparar um erro, caso não seja passado um nome', () => {
            expect.assertions(1)
            try {
                new Produto(125, undefined, 5, 10)
            } catch (error) {
                expect(error).toEqual(new Error('Produto precisa ter um nome'))
            }
        })

        it('deve disparar um erro, caso produto não tenha valor', () => {
            expect.assertions(1)
            try {
                new Produto(124, 'lapis', undefined, 0)
            } catch (error) {
                expect(error).toEqual(new Error('Produto precisa ter valor'))
            }
        })

        it('deve disparar um erro, caso o nome passado não seja uma string', () => {
            expect.assertions(1)
            try {
                new Produto(122, 123 as any, 5, 10)
            } catch (error) {
                expect(error).toEqual(new Error('O nome precisa ser uma string'))
            }
        })

        it('deve disparar um erro, caso o valor passado não seja um numero', () => {
            expect.assertions(1)
            try {
                new Produto(121, 'lapis', 'abc' as any, 10)
            } catch (error) {
                expect(error).toEqual(new Error('O valor precisa ser um numero'))
            }
        })   
    })
})