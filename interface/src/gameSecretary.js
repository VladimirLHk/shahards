'use strict'

const lL = require('./LocalLib');
const GameTreasurer = require('./gameTreasurer');

/*
Класс реализует ведение протокола игры - фиксацию общих параметров игры и данных по кахжлму ходу, а также получение информации из протокола
Структура объекта Протокол (gameList):

summary - объект с общими данными для всей игры, включает в себя
    desk: строка с рамерностью поля "ширина х высота"
    players: массив с никами играющих [0] - за крестики [1] за нолики
    tBegin: дата и время начала игры
    tEnd: дата и время окончания игры
    result: как закончилась игра - победой крестиков ('white'), победой ноликов ('black') или ничьей ('Draw')
    finPos: массив с позицией в момент окончания игры
            позиция на доске описывается ассоциативным массивом из двух элементов ('white' / 'black'), в кажом из которых
            содержится двумерный массив, перечисляющий номера линий, знаятых соответствующим игроком на каждом ряде

moves: массив описаний каждого хода; каждый элемент массива содержит
       ассоциативный массив, в котором два объекта, описывающих ход каждого игрока:
       ключ 'white' для крестиков/белых и ключ 'black' для ноликов/черных (если ход ими был сделан).
       объект с описанием хода одного игрока состоит из:
            initPos: позиция на доске перед началом хода
            diceThrow: история выбросов костей; массив объектов {dice: выброс "х:у", varNum:число вариантов хода при этом выбросе}
            move: массив с выбранным ходом - по каждому ряду какие шашки и на сколько двигать
            movedPos: позиция после перемещения шашек, но до снятия шашек с доски
            lost: перечень шашек, убранных с доски в результате хода:
                    ассоциативный массив с двумя элементами (по одному на каждого игрока) с перечислением по каждому ряду
                    номеров линий, с которых были убраны шашки;
                    для ходящего игорка - номера линий после перемещения шашек;
                    если никого не снимали, то такого поля в объекте нет
            tBegin: дата и время начала хода
            tEnd: дата и время окончания хода - перехода хода к следующему игроку или окончания игры

реализовать через метод общее число ходов в игре!!!!
общее количество потерь за ход у креcтиков и ноликов (соответственно), - реализовать через метод!!!!
число крестиков / ноликов по окончанию игры - реализовать через метод!!!
продолжительность игры (в секундах) - реализовать через метод!!!!

 */

class GameSecretary extends GameTreasurer {

    constructor (params) {
        // в параметрах передаем размерность игры и ники игроков
        super (params);
        // создаем объект-протокол
        this.gameList = {
            summary: {
                desk: ''+this.gameDimen+'x'+this.deskLength,
                players: {
                    "white": (params.wNik) ? params.wNik : 'WhitePlayer',
                    "black": (params.bNik) ? params.bNik : 'BlackPlayer'
                }
            },
            moves: []
        }
    }

    setGameStart () {
        this.gamelist.summary {tBegin: startTime}
    }


}