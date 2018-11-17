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
        while (this.isNotGameOver()) {this.makeStep()}
        this.gs.signGameList(this.state.position);
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
            infoForPlayer.dice = this.state.dice; // (***)

            let varNum = super.possibleVariantDescription(infoForPlayer).varDescr.length;
            rigthDice = varNum > 0;

            this.gs.fixMoveDiceThrow(this.state.dice, this.state.whoMove, varNum);
        }
        infoForPlayer.dice = this.state.dice;//Зачем??? Между строкой (***) и этой состояние this.state.dice разве меняется???
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
        this.gs.fixMoveEnd(move, this.state.whoMove);

        let oldPos = this.state.position;
        this.state.position = this.takeMove (move);
        this.nextPlayer();
    }


    nextPlayer () {
        let curPlayer = this.state.whoMove;
        this.state.whoMove = (curPlayer === "white") ? "black" : "white";
    }

    takeMove (move) {
        return super.getNewPosition (this.state.position, move, this.state.whoMove);
    }

    calculateLosses(oldPos, newPos) {
        let gameDimen = this.gameDimen;
        let wLossesByRow = [gameDimen];
        let bLossesByRow = [gameDimen];
        let wTotalLoss = 0;
        let bTotalLoss = 0;

        for (let row=0;row<gameDimen;row++) {
            wTotalLoss += wLossesByRow[row] = oldPos.get('white')[row].length - newPos.get('white')[row].length;
            bTotalLoss += bLossesByRow[row] = oldPos.get('black')[row].length - newPos.get('black')[row].length
        }

        return {
            wLosses: wTotalLoss,
            wLossesByRow: wLossesByRow,
            bLosses: bTotalLoss,
            bLossesByRow: bLossesByRow
        }
    }

    dice () {
    // делает бросок костей и записывает их в состояние
        this.state.dice = super.diceMove();
    }

    isNotGameOver () {return !super.isGameOver(this.state)}

}

module.exports = GameMaster;