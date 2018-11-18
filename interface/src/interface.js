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
           let initCheckersNum = +desk[0]*desk[0];
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
           diceThrowNum - порядковый номер броска костей - нужно ли это? это же длина массива? или порядковый номер?
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
               varNum: undefined,
               comment: <b>Начало игры.</b>,
               playersNum: [initCheckersNum,initCheckersNum]
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
               varNum: (frame.varNum) ? frame.varNum : undefined,
               comment: frame.comment,
               playersNum: frame.playersNum
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

           //формирование последнего кадра с результатом игры
           const gameResult = this.props.gameList.summary.result;
           const titleComment = <p><b>Игра окончена.</b></p>;
           const resultComment = gameResult === 'Draw' ?
                            'Ничья! Победила дружба!!!' :
                            'Победил игрок "'+this.players[gameResult]+'"!';
           const dataFormater = new Intl.DateTimeFormat('ru', {
               weekday: 'short',
               year: '2-digit',
               month: '2-digit',
               day: '2-digit',
               hour: 'numeric',
               minute: 'numeric',
               second: 'numeric'
           });
           const timeComment = 'Игра началась '+
                                dataFormater.format(this.props.gameList.summary.tBegin)+
                                ' и закончилась '+
                                dataFormater.format(this.props.gameList.summary.tEnd)+
                                '. Игра продолжалась '+
                                this.props.gameList.summary.Duration+
                                ' милисекунд';

           film.push({
               moveNum: (moves[maxMoveNum-1]['black']) ? maxMoveNum+1 : maxMoveNum,
               color: (moves[maxMoveNum-1]['black']) ? 'white' : 'black',
               desk: this.getDeskPosition(this.props.gameList.summary.finPos),
               comment:[titleComment,<br/>,<p>{resultComment}</p>, <br/>,<p>{timeComment}</p>],
               playersNum:[this.props.gameList.summary.finWhiteNum, this.props.gameList.summary.finBlackNum]
           });

           return film;

       }

       //формируются кадры по описанию в протоколе игры хода одного из игроков
       makeFramesByMove (move, moveNum, color) {
           let commentArray = [<p><b>Ходит игрок "{this.players[color]}".</b></p>]; //заголовок комментария к ходы

           //формируется начальный кадр хода игрока
           let initDesk = this.getDeskPosition(move.initPos);
           commentArray.push('Позиция перед началом хода.');
           let frames = [{
               desk: initDesk,
               moveNum: moveNum,
               color: color,
               comment: commentArray.slice(),
               playersNum: [move.wInitChekersTotalNum,move.bInitChekersTotalNum]
           }];
           commentArray.pop();

           //формируются кадры с демонстрацией серии бросков костей, пока не выпадет сочетание, позволяющее сделать ход
           let throwNum = move.diceThrow.length;
           for (let i=0;i<throwNum;i++) {
               if (i === throwNum - 1) {
                   let varNum = move.diceThrow[i].varNum;
                   if (varNum === 1)
                       commentArray.push('В этой позиции при таком броске есть единственный ход.');
                   else {
                       let units = varNum % 10;
                       let tens = (varNum - units) % 100 / 10;
                       let endOfLine;

                       if (tens === 1) endOfLine = " вариантов хода.";
                       else switch (units) {
                           case 1:
                               endOfLine = " вариант хода.";
                               break;
                           case 2:
                           case 3:
                           case 4:
                               endOfLine = " варианта хода.";
                               break;
                           default:
                               endOfLine = " вариантов хода.";
                       }
                       commentArray.push('В этой позиции при таком броске есть ' + varNum + endOfLine);
                   }
               } else commentArray.push(<p>Попытка № {i + 1} из {throwNum}. При таком броске кубиков в этой позиции нет
                   ходов.</p>);

               frames.push({
                   desk: initDesk,
                   moveNum: moveNum,
                   color: color,
                   dice: move.diceThrow[i].dice,
                   varNum: move.diceThrow[i].varNum,
                   diceThrowNum: i + 1,
                   comment: commentArray.slice(),
                   playersNum: [move.wInitChekersTotalNum,move.bInitChekersTotalNum]
               });
               commentArray.pop();
           }

           //формируется кадр с передвинутыми шашками, но до проверки, нужно ли снимать с поля щащки
           commentArray.push(<p>Сделан ход:</p>);
           let gameDimen = this.gameDimen;
           let moverMove = move.move;
           let direction = color === 'white' ? 1 : -1;
           const lineEnd = ['','а','а','а','ов','ов','ов','ов','ов','ов'];
           for (let row=0;row<gameDimen;row++){
               let checkersRowQnt = moverMove[row].length;
               let adjust = color === 'white' ? 1 : checkersRowQnt;
               for(let checkerNum=0;checkerNum<checkersRowQnt;checkerNum++)
                   if (moverMove[row][checkerNum] !== 0) {
                       let checkerName = direction * checkerNum + adjust;
                       commentArray.push(<p>{checkerName}-я шашка в{row===1?'о':''} {row+1}-ом ряду
                           передвинута на {moverMove[row][checkerNum]} ход{lineEnd[moverMove[row][checkerNum]-1]}</p>);
                   }
           }
           commentArray.push(<p>Проверяется, нужно ли убрать с поля чьи-то шашки.</p>);
           frames.push({
               desk: this.getDeskPosition(move.movedPos),
               moveNum: moveNum,
               color: color,
               dice: move.diceThrow[throwNum-1].dice,
               varNum: move.diceThrow[throwNum-1].varNum,
               diceThrowNum: throwNum,
               comment: commentArray.slice(),
               playersNum: [move.wInitChekersTotalNum,move.bInitChekersTotalNum]
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
                    players={this.players}
                    playersNum={this.state.playersNum}
                    diceThrowNum={this.state.diceThrowNum}
                    varNum={this.state.varNum}
                    maxMoveNum={this.film[lastFrameNum].moveNum}
                    comment={this.state.comment}
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