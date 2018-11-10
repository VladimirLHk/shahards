import React from 'react';
import ReactDOM from 'react-dom';
import GameTreasurer from './gameTreasurer';
import './index.css';
import Interface from './interface';
import registerServiceWorker from './registerServiceWorker';

/*
let ng = new GameTreasurer({});
let newPos = ng.initPosition;
let width = ng.gameDimen;
let height = ng.deskLength;
let deskPos = [];
let blacks = newPos.get("black");
let whites = newPos.get("white");

for (let clmn=height;clmn>0;clmn--){
    let arr = [];
    for (let row=0;row<width;row++){
        if (whites[row].indexOf(clmn)+1) arr.push('o'); else arr.push('');
        if (blacks[row].indexOf(clmn)+1) arr.push('x'); else arr.push('');
    }
    deskPos.push(arr);
}
*/

ReactDOM.render(<Interface gameDimen={6} deskLength={16}/>, document.getElementById('root'));
registerServiceWorker();
