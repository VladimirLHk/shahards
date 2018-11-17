import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GameTreasurer from './gameTreasurer';
import './index.css';
import ShowGame from './ShowGame';
import Control from './Control'
import PlayerBot from './PlayerBot';
import GameMaster from './gameMaster';

/*
класс Interface
- принимает на вход протокол игры,
- преобразует его в кадры визуализации событий игры - массив film с элементами frame,
- запускает визуализацию хода игры - класс ShowGame,
- запускает управление визуализацией - класс Control.
 */

class Interface extends Component {
    //свойство конструктора = "протокол игры" - массив объектов описания ходов
       constructor (props) {
           super (props);
           const desk = this.props.gameList.summary.desk.split("x");

           this.gameDimen = +desk[0];
           this.deskLength = +desk[1];
           this.players = {
               "white": 'нолики',
               "black": 'крестики'
           };

           this.film = this.makeFilm(); // массив с кадрами (объект frame) иллюстрации игры.
           /*
           Структура объекта frame
           moveNum - номер хода, к которому относится кадр
           color - цвет игрока, к чьему ходу относится кадр
           comment - текстовый комментарий к кадру
           desk - массив расположения шашек
           dice - массив из двух значений выброса костей
           varNum - число ходов при данном выбросе костей
           diceThrowNum - порядковый номер броска костей
           ? frameType - тип кадра:
           ?      'showPos' - демонстрация расположения шашек на поле
           ?      'showDice' - демонстраия броска костей
           ? frameTypeName - название типа кадра (для отображения на экране)
            */

           this.filmPointer = 0; //текущий номер кадра в массиве film

           /*
            в state содержится
            - moveNum - номер хода
            - moverName - название стороны, чей ход
            - deskPos - массив расположения шашек
            - wDiceTable - массив значений табло выброса хода белых
            - diceThrowNum - номер броска
            - bDiceTable - массив значений табло выброса хода черных
             */
           this.state = {
               moveNum: 1,
               moverName: this.players["white"],
               deskPos: this.film[0].desk,
               wDiceTable: undefined,
               bDiceTable: undefined,
               diceThrowNum: undefined,
               varNum: undefined
           };

           this.handleOnClick = this.handleOnClick.bind(this);
       }


       handleOnClick (e) {
           switch (e.target.id) {
               case "Next":
                   this.movePointer(1);
                   break;
               case "Back":
                   this.movePointer(-1);
                   break;
               case "Start":
//                   this.setState ({gameList: this.makeNewGame()});//протокол демонстрируемой игры
//                   break;
           }

       }

       movePointer (shift) {
           let curPointer = this.filmPointer;
           let maxPointer = this.film.length-1;
           let shiftedPointer = curPointer + shift;
           let newPointer;

           if (shift < 0) newPointer = (shiftedPointer < 0) ? maxPointer+1+shiftedPointer : shiftedPointer;
           if (shift > 0) newPointer = (shiftedPointer > maxPointer) ? shiftedPointer-maxPointer-1 : shiftedPointer;
           if (shift == 0) newPointer = curPointer;
           this.filmPointer = newPointer;

           let frame = this.film[newPointer];

           this.setState ({
               moveNum: frame.moveNum,
               moverName: this.players[frame.color],
               deskPos: frame.desk,
               wDiceTable: ((frame.dice)&&(frame.color === 'white')) ? frame.dice : undefined,
               bDiceTable: ((frame.dice)&&(frame.color === 'black')) ? frame.dice : undefined,
               diceThrowNum: (frame.diceThrowNum) ? frame.diceThrowNum : undefined,
               varNum: (frame.varNum) ? frame.varNum : undefined
           });

       }


       //по массиву ходов игры делает массив кадров для визуализации
       makeFilm () {
           let film = [];
           let moves = this.props.gameList.moves;
           let maxMoveNum = moves.length;

           for (let moveNum = 0; moveNum<maxMoveNum;moveNum++){
               let framesCollection = this.makeFramesByMove(moves[moveNum]['white'], moveNum+1, 'white');
               for (let frameNum=0;frameNum<framesCollection.length;frameNum++) {
                   film.push(framesCollection[frameNum]);
               }
               if (!moves[moveNum]['black']) break;
               framesCollection = this.makeFramesByMove(moves[moveNum]['black'], moveNum+1, 'black');
               for (let frameNum=0;frameNum<framesCollection.length;frameNum++) {
                   film.push(framesCollection[frameNum]);
               }
           }

           film.push({
               moveNum: (moves[maxMoveNum-1]['black']) ? maxMoveNum+1 : maxMoveNum,
               color: (moves[maxMoveNum-1]['black']) ? 'white' : 'black',
               desk: this.getDeskPosition(this.props.gameList.summary.finPos)
           });

           return film;

       }

       makeFramesByMove (move, moveNum, color) {
           const commentBegin = 'Ходят '+ this.players[color]+'. ';
           let initDesk = this.getDeskPosition(move.initPos);
           let frames = [{
               desk: initDesk,
               moveNum: moveNum,
               color: color,
               comment: commentBegin+'Позиция перед началом хода.'
           }];
           let throwNum = move.diceThrow.length;
           for (let i=0;i<throwNum;i++){
               frames.push({
                   desk: initDesk,
                   moveNum: moveNum,
                   color: color,
                   dice: move.diceThrow[i].dice,
                   varNum: move.diceThrow[i].varNum,
                   diceThrowNum: i+1

               })
           }
           frames.push({
               desk: this.getDeskPosition(move.movedPos),
               moveNum: moveNum,
               color: color,
               dice: move.diceThrow[throwNum-1].dice,
               varNum: move.diceThrow[throwNum-1].varNum,
               diceThrowNum: throwNum
           });

           return frames;
       }

       //объект, в котором есть Map с массивами расположения крестиков ("white") и ноликов ("black")
       // возвращает массив размерности игрового поля с шашками размещенными на соответствующих местах
       getDeskPosition (gamePos) {

           let width = this.gameDimen;
           let height = this.deskLength;
           let deskPos = [];
           let blacks = gamePos.get("black");
           let whites = gamePos.get("white");

           for (let clmn=height;clmn>0;clmn--){
               let arr = [];
               for (let row=0;row<width;row++){
                   if (whites[row].indexOf(clmn)+1) arr.push('o'); else arr.push(' ');
                   if (blacks[row].indexOf(clmn)+1) arr.push('x'); else arr.push(' ');
               }
               deskPos.push(arr);
           }
           return deskPos;
       }

    render() {
        const lastFrameNum = this.film.length-1;

        return (
            <div className="App">
                <Control nextPicture={this.handleOnClick}/>
                <ShowGame
                    gameDimen={this.gameDimen}
                    deskLength={this.deskLength}
                    moveNum={this.state.moveNum}
                    moverName={this.state.moverName}
                    deskPos={this.state.deskPos}
                    wDiceTable={this.state.wDiceTable}
                    bDiceTable={this.state.bDiceTable}
                    diceThrowNum={this.state.diceThrowNum}
                    varNum={this.state.varNum}
                    maxMoveNum={this.film[lastFrameNum].moveNum}
                />
            </div>
        );
}

}

export default Interface;

/*
функции-методы, которые, возможно. ещё пригодятся

       makeNewGame () {
           const gameDimen = this.gameDimen;
           let blackBot = new PlayerBot ({gameDimension:gameDimen});
           let whiteBot = new PlayerBot ({gameDimension:gameDimen});

           let params = {
                   gameDimension:gameDimen,
                   deskLength:this.deskLength,
                   blackPlayer:blackBot.getMove,
                   whitePlayer:whiteBot.getMove
               };
           let gmn = new GameMaster (params);
           gmn.makeGame();
           return gmn.gameList
       }

       randomPosition () {
           const gameDimen = this.gameDimen;
           const deskLength = this.deskLength;
           let deskPos = [];

           for (let clmn=deskLength;clmn>0;clmn--){
               let arr = [];
               for (let row=0;row<gameDimen*2;row++){
                   switch (Math.ceil(3 * Math.random())) {
                       case 1: arr.push('o'); break;
                       case 2: arr.push('x'); break;
                       default: arr.push(''); break;
                   }
               }
               deskPos.push(arr);
           }
           return deskPos
       }

 */