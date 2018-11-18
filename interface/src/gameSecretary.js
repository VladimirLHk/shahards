'use strict'

const lL = require('./LocalLib');
const GameTreasurer = require('./gameTreasurer');

/*
Класс реализует ведение протокола игры - фиксацию общих параметров игры и данных по кахжлму ходу, а также получение информации из протокола
Структура объекта Протокол (gameList):

summary - объект с общими данными для всей игры, включает в себя
    desk: строка с рамерностью поля "ширина х высота"
    players: массив с никами играющих [0] - за крестики [1] за нолики
    tBegin: даат и время начала игры
    tEnd: дата и время окончания игры
    Duration: продолжительность игры в милисекундах
    result: как закончилась игра - победой крестиков ('white'), победой ноликов ('black') или ничьей ('Draw')
    finPos: массив с позицией в момент окончания игры
            позиция на доске описывается ассоциативным массивом из двух элементов ('white' / 'black'), в кажом из которых
            содержится двумерный массив, перечисляющий номера линий, знаятых соответствующим игроком на каждом ряде;
            если шашек на ряде нет, то массив пустой
    finWhiteNum: число белых шашек, оставшися на доске к конецу игры
    finBlackNum: число черных шашек, оставшися на доске к конецу игры

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

    //Избавиться от необходимости передавать цвет ходящего!!! Идея: если в последнем элементе массива moves время окончания ещё не задано

    fixMoveInitPos (pos, color) {

        if (color === "white") this.gameList.moves.push([]);

        this.gameList.moves[this.getLastMoveNum()][color] = {
            initPos: pos,
            diceThrow:[]
        };

    }

    fixMoveStartTime (color) {this.gameList.moves[this.getLastMoveNum()][color].tBegin = Date.now()
    }

    fixMoveDiceThrow (diceArr, color, varNum) {
        let diceThrowObj = {
            dice:diceArr.slice(),
            varNum: varNum
        };
        this.gameList.moves[this.getLastMoveNum()][color].diceThrow.push(diceThrowObj);

    }

    fixMoveEnd (move, color) {
        let curMove = this.getLastMoveNum();
        let initPos = this.gameList.moves[curMove][color].initPos;
        this.gameList.moves[curMove][color].tEnd = Date.now();
        this.gameList.moves[curMove][color].move = move;
        this.gameList.moves[curMove][color].movedPos = super.getMovedPosition(initPos, move, color);
        this.gameList.moves[curMove][color].wInitChekersTotalNum = super.getCheckersTotalNum(initPos, 'white');
        this.gameList.moves[curMove][color].bInitChekersTotalNum = super.getCheckersTotalNum(initPos, 'black');
        this.gameList.moves[curMove][color].lost= []; //!!!!!!надо реализовать
    }

    signGameList (finPos) {

        this.gameList.summary.finPos = finPos;

        let wSurvived = this.getCheckersTotalNum(finPos, 'white');
        let bSurvived = this.getCheckersTotalNum(finPos, 'black');
        if (wSurvived === bSurvived)
            this.gameList.summary.result = 'Draw';
        else if (wSurvived > bSurvived)
            this.gameList.summary.result = 'white';
        else this.gameList.summary.result = 'black';

        this.gameList.summary.finWhiteNum = wSurvived;
        this.gameList.summary.finBlackNum = bSurvived;

        this.gameList.summary.tBegin = this.getGameStartTime();
        this.gameList.summary.tEnd = this.getGameEndTime();
        this.gameList.summary.Duration = this.getGameDuration();


//        console.log(this.gameList);

    }

    //
    getLastMoveNum () {return this.gameList.moves.length-1}

    getGameStartTime () {return this.gameList.moves[0]['white'].tBegin}

    getGameEndTime () {
        let lastMoveNum = this.getLastMoveNum();
        let color = this.gameList.moves[lastMoveNum]['black'] ? 'black' : 'white';
        return this.gameList.moves[lastMoveNum][color].tEnd;
    }

    getGameDuration () {
        return this.getGameEndTime() - this.getGameStartTime();
    }

}

module.exports = GameSecretary;