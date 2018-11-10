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
        let gs = new GameSecretary (params);
        this.gameList = {//протокол игры
            desk:''+this.gameDimen+'x'+this.deskLength,
            moveCounter: 0,
            players: [this.players.get("wNik"), this.players.get("bNik")],
            moves: []
        };


        /*
        описание полей gameList
            desk: строка с рамерностью поля "ширина х высота"
            tBegin: дата и время начала игры
            tEnd: дата и время окончания игры
            Duration: продолжительность игры (в секундах)
            wSurvived: число крестиков по окончанию игры
            bSurvived: число ноликов по окончанию игры
            result: как закончилась игра - победой крестиков ('white'), победой ноликов ('black') или ничьей ('Draw')
            moveCounter: счетчик ходов; по окончании игры - номер последнего хода
            players: массив с никами играющих [0] - за крестики [1] за нолики
            moves: масив описаний каждого хода; каждый элемент массива содержит
                   массив, в котором два объекта, описывающих ход крестиков/белых и ход ноликов/черных (если он был сделан).
                   описание хода одного игрока состоит из:
                moveNum: номер хода
                move: массив с выбранным ходом - по каждому ряду какие шашки и на сколько двигать
                mover: цвет хоядщего
                diceThrow: история выбросов костей; массив объектов {dice: выброс "х:у", varNum:число вариантов хода при этом выбросе}
                tBegin: дата и время начала хода
                tEnd: дата и время окончания хода - перехода хода к следующему игроку или окончания игры
                losses: количество потерь, объект
                        wLosses и bLosses: общее количество потерь за ход у креcтиков и ноликов (соответственно),
                        wLossesByRow и bLossesByRow: массивы размерности игры с количеством потерь по рядам

        */
    }

    makeGame () {
        let t1 = new Date;
        this.gs.setGameStart(t1);
//        this.gameList.tBegin = t1;
        console.log(t1);
        while (this.isNotGameOver()) {
            this.makeStep();
        }
        let t2 = new Date;
        this.gameList.tEnd = t2;
        console.log(t2);
        this.signGameList(); //фиксируется, как закончилась игра:
        // победой крестиков ('white'),
        // победой ноликов ('black')
        // или ничьей ('Draw')
    }

    signGameList () {
        this.gameList.Duration = (this.gameList.tEnd - this.gameList.tBegin)/1000;
        this.gameList.wSurvived = this.getCheckersTotalNum(this.state.position, 'white');
        this.gameList.bSurvived = this.getCheckersTotalNum(this.state.position, 'black');
        if (this.gameList.wSurvived == this.gameList.bSurvived)
            this.gameList.result = 'Draw';
        else if (this.gameList.wSurvived > this.gameList.bSurvived)
            this.gameList.result = 'white';
        else this.gameList.result = 'black';

    }

    makeStep () {

        let moveToList = this.initNewMoveDescription();

        let infoForPlayer = {
            position: this.state.position,
            color: this.state.whoMove
        };

        let rigthDice = false;
        let counter = 0;
        while (!rigthDice){
            this.dice;
            infoForPlayer.dice = this.state.dice;
//            console.log('?', infoForPlayer.dice, ' ', counter);
            moveToList.diceThrow.push({
                dice:this.state.dice.join(':'),
                varNum:super.possibleVariantDescription(infoForPlayer).varDescr.length
            });
            rigthDice = moveToList.diceThrow[moveToList.diceThrow.length-1].varNum > 0;
/*            counter++;
            if (!rigthDice && (counter == 10)) {
                let notEmptyRow = 0;
                let rowIndex = 0;
                let moverCurPosition = this.state.position.get(this.state.whoMove);
                for (let i=0;i<this.gameDimen;i++)
                    if (moverCurPosition[i].length) {
                        notEmptyRow++;
                        rowIndex = i;
                    }
                console.log(notEmptyRow);
                if (notEmptyRow > this.gameDimen/2) a++ //надо сделать исключение - 10 раз не выпадает кубик на половину непустых рядов
                this.state.dice[1] = rowIndex;
            }*/
        }
//        console.log('ok');
        infoForPlayer.dice = this.state.dice;
        let move;
        let rightMove = false;
        moveToList.tBegin = new Date;
        while (!rightMove) {
            move = this.players.get(this.state.whoMove)(infoForPlayer);
            rightMove = super.checkMove (this.state.position, move, this.state.whoMove);
            if (!rightMove) {
                console.log('!!!!');
                console.log(this.state.position, move, this.state.whoMove);
            }
        }
        moveToList.tEnd = new Date;
        moveToList.move = move;

        let oldPos = this.state.position;
        this.state.position = this.takeMove (move);
        moveToList.losses = this.calculateLosses(oldPos, this.state.position);
//        console.log(this.state.whoMove);
//        console.log(this.state.dice);
//        console.log(move);
//        console.log(this.state.position);
        this.showPosition();
        this.saveMoveDescription (moveToList);
        this.nextPlayer();
    }

    initNewMoveDescription () { //делает начальные установки для записи хода в потокол
        if (this.state.whoMove === "white") {
            this.gameList.moveCounter++;
            this.gameList.moves.push([]);
        }

        return {//объект для протокола
            moveNum: this.gameList.moveCounter,// номер хода
            mover: this.state.whoMove,//цвет хоядщего
            diceThrow:[]//история выбросов костей; объект {выброс "х:у", число вариантов}
            }
    }

    saveMoveDescription (moveDescript) {//делает заполнение протокола по итогам хода и сохраняет его в протокол
        this.gameList.moves[this.gameList.moveCounter-1].push(moveDescript);
    }

    nextPlayer () {
        let curPlayer = this.state.whoMove;
        this.state.whoMove = (curPlayer == "white") ? "black" : "white";
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

    get dice () {
    // делает бросок костей и записывает их в состояние
        this.state.dice = super.diceMove;
        return this.state.dice;
    }

    isNotGameOver () {
        return !super.isGameOver(this.state);
    }

    showPosition () {
        let blacks = this.state.position.get("black");
        let whites = this.state.position.get("white");
        let width = this.gameDimen;
        let higth = this.deskLength;

        for (let clmn=higth;clmn>0;clmn--){
            let arr = [];
            for (let row=0;row<width;row++){
                if (whites[row].indexOf(clmn)+1) arr.push('o'); else arr.push('_');
                if (blacks[row].indexOf(clmn)+1) arr.push('x'); else arr.push('_');
            }
//            console.log(arr.join(''));
        }
    }

}

module.exports = GameMaster;