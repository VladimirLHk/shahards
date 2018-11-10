import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import GameTreasurer from './gameTreasurer';
import './index.css';
import ShowGame from './ShowGame';
import Control from './Control'
import PlayerBot from './PlayerBot';
import GameMaster from './gameMaster';

class Interface extends Component {
       constructor (props) {
            super (props);
            const gameDimen = this.props.gameDimen;

            // задаем пустой массив с визуализацией текущего расположения шашек
            let initPos = [];
            for (let i=0, emptyRow = [];i<gameDimen;i++) initPos.push(emptyRow);
            const gamePos = new Map ([
                   ["white", initPos],
                   ["black", initPos]
            ]);
            this.state = {deskPos: this.getDeskPosition (gamePos)};



            this.handleOnClick = this.handleOnClick.bind(this);
       }

       handleOnClick (e) {
           switch (e.target.id) {
               case "Next":
                   this.setState ({deskPos: this.randomPosition()});
                   break;
               case "Back":
                   break;
               case "Start":
                   this.setState ({gameList: this.makeNewGame()});//протокол демонстрируемой игры
                   break;
           }

       }

       getDeskPosition (gamePos) { //объект, в котором есть Map с массивами расположения крестиков ("white") и ноликов ("black")

           let width = this.props.gameDimen;
           let height = this.props.deskLength;
           let deskPos = [];
           let blacks = gamePos.get("black");
           let whites = gamePos.get("white");

           for (let clmn=height;clmn>0;clmn--){
               let arr = [];
               for (let row=0;row<width;row++){
                   if (whites[row].indexOf(clmn)+1) arr.push('o'); else arr.push('');
                   if (blacks[row].indexOf(clmn)+1) arr.push('x'); else arr.push('');
               }
               deskPos.push(arr);
           }
           return deskPos;
       }

       makeNewGame () {
           const gameDimen = this.props.gameDimen;
           let blackBot = new PlayerBot ({gameDimension:gameDimen});
           let whiteBot = new PlayerBot ({gameDimension:gameDimen});

           let params =
               {gameDimension:gameDimen,
                   deskLength:this.props.deskLength,
                   blackPlayer:blackBot.getMove,
                   whitePlayer:whiteBot.getMove
               };
           let gmn = new GameMaster (params);
           gmn.makeGame();
           return gmn.gameList
       }

       randomPosition () {
           const gameDimen = this.props.gameDimen;
           const deskLength = this.props.deskLength;
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




    render() {
    const gameDimen = this.props.gameDimen;
    const deskLength = this.props.deskLength;
    const deskPos = this.state.deskPos;
    const color = this.state.color;

    return (
        <div className="App">
            <Control
                nextPicture={this.handleOnClick}
                startOn={this.state.gameList}
            />
            <ShowGame
                gameDimen={gameDimen}
                deskLength={deskLength}
                deskPos={deskPos}
                moveNum={this.state.num}
                color={color}/>
        </div>
    );
}
}

export default Interface;