'use strict'
const PlayerBot = require('./PlayerBot');
const GameMaster = require('./gameMaster');
const lL = require('./LocalLib');


const gameDimen = 4;
let blackBot = new PlayerBot ({gameDimension:gameDimen});
let whiteBot = new PlayerBot ({gameDimension:gameDimen});

let params =
    {gameDimension:gameDimen,
     deskLength:8,
     blackPlayer:blackBot.getMove,
     whitePlayer:whiteBot.getMove
    }
let gmn = new GameMaster (params);
/* let hisArmy = [ //текущая позиция
    [10,6,8],
    [10,9,8],
    [10,9,8],
];
console.log(hisArmy.join(','));


let hisArmy = [ //текущая позиция
    [10,9,8],
    [10,9,8],
    [10,9,8]
];
let myArmy = [ //текущая позиция
    [],
    [],
    []
];
let a = new Map ([
    ["white", myArmy],
    ["black", hisArmy]
]);

let pos = {position: a};
console.log(gmn.isGameOver(pos));

console.log(lL.removeNumFromArr(hisArmy, 9));


let hisArmy = [ //текущая позиция
    [10,9,8],
    [10,9,8],
    [10,9,8],
    [10,9,8]
];
let myArmy = [ //текущая позиция
    [],
    [],
    [],
    [7,2,1]
];
let info = {
    color: 'white',
    dice: [2,4],
    position: new Map ([
        ["white", myArmy],
        ["black", hisArmy]
    ])};

console.log(JSON.stringify(gmn.possibleVariantDescription (info),"",2));


let moves = [ //ход
    [0,6,7],
    [0,0,0],
    [0,0,0],
];*/

//console.log(gmn.getNewPosition(position, moves, 'black'));

/*let size = 2;
let num = [];
for (let i=0;i<size;i++) num.push(i);
let results = new Array(size);
let testSteps = 20000;

for (let i=1;i<=testSteps;i++){
    let numCopy=num.slice();
    let randomizedNum =[];
    for (let j=0;j<size;j++){
        let curArrLen = numCopy.length;
        let curNum = (curArrLen===1) ? 0 : Math.ceil(curArrLen * Math.random())-1;
        randomizedNum.push(numCopy.splice(curNum,1));
    }
//    console.log(randomizedNum);
    let a = Math.ceil(size * Math.random())-1;
    results[a] = results[a] !== undefined ? results[a]+1 : 1;
}
console.log(results);
*/


/*    let blackRow = [];
    let whiteRow = [];
    for (let i=0;i<3;i++){
        whiteRow.push(3-i);
    }
    let blackInit = [];
    let whiteInit = [];
    for (let i=0;i<3;i++){
        blackInit.push(blackRow);
        whiteInit.push(whiteRow);
    }
    gmn.state.position = new Map ([
        ["white", whiteInit],
        ["black", blackInit]
    ]);*/


let maxStep = 1000;
let setToChoice;
let dice;
let f = (a,b)=>{return b-a};

for (let gameCount=1;gameCount<10;gameCount++) {
    gmn.makeGame();
    console.log(JSON.stringify(gmn.gameList,"",2));
    console.log('Game #',gameCount,' is finished');

}



//console.log (gmn.movesByRowsVariants);
//console.log (gmn.checkersTotalMovesInRowVariants);

/*
let state = {dice:'32'};
let hisArmy = [ //текущая позиция
    [10,9,8],
    [10,9,8],
    [10,9,8],
];
let myArmy = [ //текущая позиция
    [3,2,1],
    [3,2,1],
    [3,2,1],
];
let position = new Map ([
    ["white", myArmy],
    ["black", hisArmy]
]);

state.position = position;
*/

// console.log (gmn.possibleVariantDescription(state,"black"));
/*
let testFDice = new Map ();
let testSDice = new Map ();
let testDice = new Map ();
let curDice;
let maxNum = 1000000

for (let i=0; i<=maxNum; i++) {
    curDice = gmn.dice;
    let a = testFDice.get (curDice[0]) ? testFDice.get (curDice[0]) + 1 : 1;
    testFDice.set (curDice[0], a);
    let b = testSDice.get (curDice[1]) ? testSDice.get (curDice[1]) + 1 : 1;
    testSDice.set (curDice[1], b);
    let c = testDice.get (curDice.join(':')) ? testDice.get (curDice.join(':')) + 1 : 1;
    testDice.set (curDice.join(':'), c);
}
console.log ('First');
for (let i=1; i<=params.gameDimension; i++) console.log (i, '->', testFDice.get(i)/maxNum);
console.log ('Second');
for (let i=1; i<=params.gameDimension; i++) console.log (i, '->', testSDice.get(i)/maxNum);
console.log ('Dice');
for (let key of testDice.keys()) console.log (key, '->', testDice.get(key)/maxNum);
*/