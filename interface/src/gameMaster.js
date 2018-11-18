'use strict'

const lL = require('./LocalLib');
const GameTreasurer = require('./gameTreasurer');
const GameSecretary = require ('./gameSecretary');

class GameMaster extends GameTreasurer {
    constructor (params) {
        super(params);
        this.players = new Map ([
            ["white", params.whitePlayer],
            ["black", params.blackPlayer],
            ["wNik", (params.wNik) ? params.wNik : 'WhitePlayer'],
            ["bNik", (params.bNik) ? params.bNik : 'BlackPlayer']
        ]);
        this.state = {//внутренняя информация о текущей ситуации в игре
            position: super.initPosition,
            whoMove: "white"
        };
        this.gs = new GameSecretary (params);
    }

    makeGame () {
        while (this.isNotGameOver()) this.makeStep(); // игроки делают шаги до тех пор, пока игра не будет объявлена оконченной
        this.gs.signGameList(this.state.position);// в протокол заносятся итоговые записи
    }

    makeStep () {

        this.gs.fixMoveInitPos (this.state.position, this.state.whoMove);

        let infoForPlayer = {
            position: this.state.position,
            color: this.state.whoMove
        };

        let rigthDice = false;
        while (!rigthDice){
            this.dice();
            let curDice = this.state.dice.slice(); //чтобы в протоколе сохранились первоначальные (не упорядоченные по возрастангию) значеняи броска кубиков
            infoForPlayer.dice = this.state.dice; // (***)

            let varDescr = super.possibleVariantDescription(infoForPlayer).varDescr;
            rigthDice = varDescr.length > 0;
            let varNum = rigthDice ? varDescr[varDescr.length-1].lastNum : undefined;

            this.gs.fixMoveDiceThrow(curDice, this.state.whoMove, varNum);
        }
 //       infoForPlayer.dice = this.state.dice;//Зачем??? Между строкой (***) и этой состояние this.state.dice разве меняется???
        let move;
        let rightMove = false;
        this.gs.fixMoveStartTime(this.state.whoMove);
        while (!rightMove) {
            move = this.players.get(this.state.whoMove)(infoForPlayer);
            rightMove = super.checkMove (this.state.position, move, this.state.whoMove); //Работает ли???
            if (!rightMove) { //Потом убрать!!!! Или заменить на метод Секретаря
                console.log('!!!!');
                console.log(this.state.position, move, this.state.whoMove);
            }
        }
        this.gs.fixMoveEnd(move, this.state.whoMove); // в протокол заносится иоговые записи хода

        let oldPos = this.state.position;
        this.state.position = this.takeMove (move);
        this.nextPlayer();
    }

    nextPlayer () {
        let curPlayer = this.state.whoMove;
        this.state.whoMove = (curPlayer === "white") ? "black" : "white";
    }

    takeMove (move) {return super.getNewPosition (this.state.position, move, this.state.whoMove)}

    // делает бросок костей и записывает их в состояние
    dice () {this.state.dice = super.diceMove()}

    // запрашивает у Хранителя оценку текущей позиции с точки зрения окончания игры
    isNotGameOver () {return !super.isGameOver(this.state)}

}

module.exports = GameMaster;