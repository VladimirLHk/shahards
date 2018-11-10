'use strict'

const lL = require('./LocalLib');
const GameTreasurer = require('./gameTreasurer');

class PlayerBot extends GameTreasurer {
    constructor (params) {
        super(params);
//        this.mBRV = super.movesByRowsVariants;
//        this.cTMIRV = super.checkersTotalMovesInRowVariants;
        this.getMove = this.getMove.bind(this);
        this.getMoveByNum = this.getMoveByNum.bind(this);
    }

    getMove (info) {
//        info.mBRV = this.mBRV;
//        info.cTMIRV = this.cTMIRV;
        let fullVarDef = super.possibleVariantDescription (info);
        let varArr = fullVarDef.varDescr;
        let maxVarNum = varArr[varArr.length-1].lastNum;
        fullVarDef.varNum = Math.ceil(maxVarNum * Math.random());
        fullVarDef.dice = info.dice;

        return this.getMoveByNum(fullVarDef);
    }

    getMoveByNum (e) {
//определяем номер в массиве распределения ходов по рядам для данного выброса кости
        let gameDimen = this.gameDimen;
        let varNum = e.varNum;
        let curVariantDescription = e.varDescr;
        let checkersPossibleMoves = e.psblMoves;
        let len = curVariantDescription.length;
        let distrIndex; //объект с параметрами вариантов, в котором находится выбранный вариант;
        for (let i=0;i<len;i++){
            if ((curVariantDescription[i].lastNum >= varNum)&&(curVariantDescription[i].firstNum <= varNum)){
                distrIndex = curVariantDescription[i];
                break
            }
        }

        let numsMovesByCheckersDistrVariants = lL.decodeVariantSet(varNum-distrIndex.firstNum+1,distrIndex.rowMaxVariants);
        let moves = []; //масив с выбранным ходом: по каждому ряду какие шашки и на сколько двигать
        let dice = e.dice.sort((a,b)=>{return b-a}).join('');
        let variantFromMBR = this.mBRV.get(dice)[distrIndex.distrNum];
        let emptyRowMove = [];//нулевая строка для ряда, в котором нет ходов
        for (let i=0;i<gameDimen;i++) emptyRowMove.push(0);

        for (let i=0;i<gameDimen;i++) {
            if (numsMovesByCheckersDistrVariants[i] == 0) moves.push(emptyRowMove)
            else {
                let movesInRow = variantFromMBR[i]; // число ходов в ряду i
                let indexInCTM = checkersPossibleMoves[i][movesInRow-1][numsMovesByCheckersDistrVariants[i]-1];//какой индекс в массиве ходов
                let goalCheckersSet = this.cTMIRV.get(movesInRow)[indexInCTM]; //из какого набора выбирать ход для этого ряда;
                moves.push(goalCheckersSet);
            }
//            console.log(moves[moves.length-1]);
        }
        return moves;
    }

}
module.exports = PlayerBot;