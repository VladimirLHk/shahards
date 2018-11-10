'use strict'

const lL = require('./LocalLib');

class GameTreasurer {
    constructor (params) {
        this.gameDimen = params.gameDimension ? params.gameDimension : 6;
        this.deskLength = params.deskLength ? params.deskLength : (this.gameDimen * 2 + 4);
        this.mBRV = this.movesByRowsVariants;
        this.cTMIRV = this.checkersTotalMovesInRowVariants;

    }

    get initPosition () {
        let gameDimen = this.gameDimen;
        let blackRow = [];
        let whiteRow = [];
        for (let i=0;i<gameDimen;i++){
            blackRow.push(this.deskLength-i);
            whiteRow.push(gameDimen-i);
        }
        let blackInit = [];
        let whiteInit = [];
        for (let i=0;i<gameDimen;i++){
            blackInit.push(blackRow);
            whiteInit.push(whiteRow);
        }
        return new Map ([
            ["white", whiteInit],
            ["black", blackInit]
        ]);
    }

    get diceMove () {
        // делает бросок костей
        return [Math.ceil(this.gameDimen * Math.random()),
                Math.ceil(this.gameDimen * Math.random())
                ];
    }

    getNewPosition (oldPos, move, mover) {// считается, что ход проверен на реализуемость
        let moverNewPos = [];
        let direct = (mover === "white") ? 1 : -1;
        let competitor = (mover === "white") ? "black" : "white";
        let gameDimen = this.gameDimen;
        for (let row = 0; row<gameDimen; row++) {
            let rowNewPos = [];
            let checkersInRow = oldPos.get(mover)[row].length;
            for (let checkerNum = 0;checkerNum<checkersInRow;checkerNum++){
                rowNewPos.push(oldPos.get(mover)[row][checkerNum] + direct * move[row][checkerNum] );
            }
            moverNewPos.push(rowNewPos.sort((a,b)=>{return b-a}));//сортировка нужна, чтобы после перепрыгивания первым считался тот, кто впереди
         }
        let newPos = new Map ([
            [mover, moverNewPos],
            [competitor, oldPos.get(competitor)]
        ]);
        // поиск шашек на удаление и "приведение в исполнение"

        let blacks = newPos.get("black");
        let whites = newPos.get("white");

        for (let clmn = 1; clmn <=this.deskLength; clmn++) {
            let blackCounter = 0;
            let whiteCounter = 0;

            for (let row=0; row<gameDimen;row++){
                if (whites[row].indexOf(clmn)+1) whiteCounter++;
                if (blacks[row].indexOf(clmn)+1) blackCounter++;
            }

            if (!(blackCounter * whiteCounter)) continue; //на этой линии нет как минимум одного игрока

            let changeBlack = false;
            let changeWhite = false;
            let resolve = false;

            if (blackCounter === whiteCounter) {//на линии есть шашки обоих игроков и их число равно
                while (!resolve) {
                    let fath = this.diceMove;
//                    console.log('!!!',fath);
                    if (fath[0] === fath[1]) continue; //на костях выпал дубль - бросать ещё раз.
                    resolve = true;
                    changeBlack = fath[0] < fath[1];
                    changeWhite = fath[0] > fath[1];
                }
            }

            if (!resolve) {
                changeBlack = blackCounter < whiteCounter;
                changeWhite = blackCounter > whiteCounter;
            }

            if (changeWhite) newPos.set("white", lL.removeNumFromArr(newPos.get("white"),clmn));
            if (changeBlack) newPos.set("black", lL.removeNumFromArr(newPos.get("black"),clmn));
        }

        return newPos;
    }

    possibleVariantDescription (info) {
//построение возможных вариантов ходов для выброса костей и конкретной позиции
        let gameDimen = this.gameDimen;
        let deskLength = this.deskLength;
        let dice = info.dice.sort((a,b)=>{return b-a}).join('');
        let curMBRDistr = this.mBRV.get(dice); //массив возможных распределений ходов по рядам для этого выброса костей
        let curMBRDLen = curMBRDistr.length;
        let checkersTotalMoves = this.cTMIRV; //info.cTMIRV;
        let myColor = info.color;
        let myArmy = info.position.get(myColor);

        let testMove = {boundary:(myColor == "white") ? deskLength+1 : 0,
            direct: (myColor == "white") ? 1 : -1
        }

        let checkersPossibleMoves = []; //трехмерный массив [i][j][k],
// k - номер расклада, который в текущей позиции можно реализовать для j+1 ходов в i-ом ряду
// расклад из секции j набора checkersTotalMoves
// (разложение числа j на все возможные неотрицательные слагаемые по gameDimen шашкам),
        for (let i=0;i<gameDimen;i++) checkersPossibleMoves[i]=[]; // создание каркаса по рядам

        let curVariantDescription = []; // массив объектов,
// содержимое которых задает полный набор вариантов ходов
// для текущих выброса костей и расположения шашек
        for (let i=0;i<curMBRDLen;i++){
            let curRowDistr = curMBRDistr[i];
            let isEnoughCheckers = true;
            for (let row=0;row<gameDimen;row++){ // есть ли в распределении #i ходы по рядам, в которых уже нет шашек
                if ((curRowDistr[row]!==0)&&(myArmy[row].length==0)) {
                    isEnoughCheckers = false;
                    break;
                }
            }
            if (!isEnoughCheckers) continue;
            let descrObj = {distrNum:i,
                rowMaxVariants:[gameDimen],
                firstNum:0,
                lastNum:0};//объект, в котором будут собираться параметры,
            // описывающие варианты ходов для вараинта распределения #i
            let variantsTotalNum = 0; //счетчик общего количества вариантов для распределения #i
            for (let j=0;j<gameDimen;j++){
                descrObj.rowMaxVariants[j] = 0;
                let rowMoves = curRowDistr[j];//число ходов в ряду j, которое надо сдлеать в распределении #i
                if (rowMoves === 0) continue; //в распределении #i в ряду j ходов нет
                if (checkersPossibleMoves[j][rowMoves-1] === undefined) {//в ряду j для значения rowMoves не строилось множество возможных ходов шашек
                    checkersPossibleMoves[j][rowMoves-1] = [];
                    let numVariants = checkersTotalMoves.get(rowMoves); // вызывается полный набор вариантов реализации в ряду числа ходов rowMoves
                    testMove.curPosInRow = myArmy[j];
                    let positionsAfterMove = []; //набор позиций после всех возможных ходов - для проверки получения разными ходами одинаковых позиций
                    for (let k=0;k<numVariants.length;k++){
                        testMove.checkingMoves = numVariants[k];
                        let testResult = this.isRightMoveInRow(testMove);
                        if (!testResult.length) continue;
                        if (lL.isVectorInMatrix (positionsAfterMove,testResult)) continue;
                        checkersPossibleMoves[j][rowMoves-1].push(k);
//                        console.log('in', curRowDistr,' for ',testMove.curPosInRow,' variant OK:', testMove.checkingMoves);
                        positionsAfterMove.push(testResult);
                    }
                }
                if (checkersPossibleMoves[j][rowMoves-1] !== undefined) {
                    descrObj.rowMaxVariants[j]=checkersPossibleMoves[j][rowMoves-1].length;
                    if (variantsTotalNum == 0)
                        variantsTotalNum =descrObj.rowMaxVariants[j];
                    else variantsTotalNum *= descrObj.rowMaxVariants[j];
                }
//        console.log(checkersPossibleMoves[j]);
            }
            if (variantsTotalNum !== 0){
                let arrLen = curVariantDescription.length;
                descrObj.firstNum = (arrLen==0) ? 1 : curVariantDescription[arrLen-1].lastNum+1;
                descrObj.lastNum = descrObj.firstNum + variantsTotalNum -1;
                curVariantDescription.push(descrObj);
//        console.log(descrObj);
//        for (let i=0; i<checkersPossibleMoves.length; i++) console.log(i, "--", checkersPossibleMoves[i]);
            }
        }
        return {varDescr: curVariantDescription, psblMoves: checkersPossibleMoves};
    }

    isRightMoveInRow (par) {
        // для заданной позиции проверяет допустимость хода в ряду;
        // если допустимо - возвращает неупорядоченную позицию после хода,
        // если нет, то пустой массив
        let curPosInRow = par.curPosInRow; //позиция перед проверяемым ходом
        let len1 = curPosInRow.length;
        let checkingMoves = par.checkingMoves; //проверяемый ход
        let len2 = checkingMoves.length;
        let boundary = par.boundary; // ограничение на номер позиции шашки
        let direct = par.direct; //направление движения: белые увеличивают, черные уменьшают
        let result = []; //позиция после хода

        if(len1<len2){//предполагаются ли в распределении ходa использовать шашки, которых уже нет на поле
            for (let i=len1;i<len2;i++) if (checkingMoves[i] !== 0) return [];
        }

        for (let i=0;i<len1;i++){//не выйдет ли шашка за пределы поля
            result[i] = curPosInRow[i] + direct * checkingMoves [i];
            if (direct * result[i] >= boundary) return [];
        }
        let numSet = new Set (); //есть ли шашки, занимающие одну и ту же клетку
        for (let i=0;i<len1;i++) numSet.add(result[i]);
        if (numSet.size !== len1) return [];

        return result;
    }

/*    isPossibleMove (info) {//есть ли ходы для этой позиции и этого выброса костей
        let fullVarDef = this.possibleVariantDescription (info);
//        console.log(fullVarDef.varDescr);
        return fullVarDef.varDescr.length > 0;
    }
*/
    checkMove (curPos, move, mover) {
        //проверяет корректность ходя, предлагаемого игроком
        //!!ПОКА НЕТ ПРОВЕРКИ КОРРЕТКНОСТИ РАСПРЕДЕЛЕНИЯ ХОДА ПО РЯДАМ - В ПАРАМЕТРАХ НУЖЕН DICE
        let playerPos = curPos.get(mover);
        let infoForIsRightMoveInRow = {
            boundary:(mover == "white") ? this.deskLength+1 : 0,
            direct: (mover == "white") ? 1 : -1
        };

        for (let row=0;row<this.gameDimen;row++) {
            if (!playerPos[row].length && !move[row].reduce((a,b)=>{return a+b})) continue
            infoForIsRightMoveInRow.curPosInRow = playerPos[row];
            infoForIsRightMoveInRow.checkingMoves = move[row];
            if (!this.isRightMoveInRow(infoForIsRightMoveInRow).length) return false
        }

        return true;
    }

    get movesByRowsVariants () {
// для каждого возможного выброса костей формирует
// множество распределений по рядам ходов,
// которые позволяет сделать соответствущий выброс костей
        let gameDimen = this.gameDimen;
        let movesByRowDistrib = new Map (); //искомое множество
        let element = [[1]];

        for (let i=1; i<gameDimen; i++) element[0].push(0);
        movesByRowDistrib.set("11",element);

        let prevElement;
        let dice;

        for (let i=2; i<=gameDimen; i++){
            for (let j=1;j<=i;j++){
                if (j==1){
                    element = new Array([]);
                    for (let k=0; k<gameDimen; k++) element[0].push(0);
                    element[0][i-1] = 1;
                    dice = `${i-1}${j}`;
                    prevElement = movesByRowDistrib.get(dice);
                    let sourceLength =prevElement.length;
                    for (let k=0; k<sourceLength; k++) {
                        element[k+1]=prevElement[k].concat();
                        element[k+1][j-1] += 1;
                    }
                }
                else {
                    dice = `${i}${j-1}`;
                    prevElement = movesByRowDistrib.get(dice);
                    let sourceLength = prevElement.length;
                    element = [];
                    for (let k=0; k<sourceLength; k++) {
                        element[k]=prevElement[k].concat();
                        element[k][i-1] += 1;
                    }
                    if (i!==j) {
                        dice = `${i-1}${j}`;
                        prevElement = movesByRowDistrib.get(dice);
                        let shiftNum = sourceLength;
                        sourceLength = prevElement.length;
                        for (let k = 0; k < sourceLength; k++) {
                            element[k + shiftNum] = prevElement[k].concat();
                            element[k + shiftNum][j - 1] += 1;
                        }
                    }
                }
                movesByRowDistrib.set(`${i}${j}`,element);
            }
        }
        return movesByRowDistrib;
    }

    get checkersTotalMovesInRowVariants () {
//создаем шаблоны распределения группы элементов по заданному (размерность игры) числу мест
        let gameDimen = this.gameDimen;
        let numSplitToPlaces = new Map();
        let newGroup = [];
        let prevGroup;
        let isArrayEq = lL.isArrayEq;

        for (let i=1;i<=gameDimen;i++){
            let newElement = [];
            for (let j=0; j<gameDimen;j++) newElement.push(0);
            newElement[i-1] = 1;
            newGroup.push(newElement);
        }
        numSplitToPlaces.set(1, newGroup);

        for (let i=2;i<=gameDimen;i++){
            prevGroup = numSplitToPlaces.get(i-1);
            let maxNum = prevGroup.length;
            let newGroup = [];
            for(let j=0;j<maxNum;j++) {
                for(let k=0;k<gameDimen;k++){
                    let newElement = [];
                    if (prevGroup[j][k]!==0) continue;
                    newElement = prevGroup[j].concat();
                    newElement[k]=i;
                    newGroup.push(newElement);
                }
            }
            numSplitToPlaces.set(i, newGroup);
        }

//Создаем набор распределения возможного числа ходов на ряд по шашкам ряда
        let numSplitToAugend = new Map();
        numSplitToAugend.set(1,[[1]]);
        for(let i=2;i<=gameDimen;i++) {
            prevGroup = numSplitToAugend.get(i-1);
            let maxNum = prevGroup.length;
            let newGroup = [];
            for(let j=0; j<maxNum;j++){
                let elementMaxNum = prevGroup[j].length;
                for(let k=0; k<elementMaxNum; k++) {
                    if ((k>0)&&(prevGroup[j][k-1]==prevGroup[j][k])) continue;
                    let newElement = prevGroup[j].concat();
                    newElement[k] +=1;
                    let isNotDuble = true;
                    let curMaxNum = newGroup.length;
                    let newElemLength = newElement.length;
                    for(let l=0;l<curMaxNum;l++){
                        isNotDuble = !isArrayEq(newElement,newGroup[l]);
                        if (!isNotDuble) break;
                    }
                    if (isNotDuble) newGroup.push(newElement);
                }
            }
            let newElement = prevGroup[maxNum-1].concat();
            newElement.push(1);
            newGroup.push(newElement);
            numSplitToAugend.set(i, newGroup);
        }

//console.log(numSplitToAugend);
// Хорошо сделать именно в два приема, чтобы в этом месте можно было оценить сложность задачи и принять какое-нибудь решение

        let checkersTotalMoves = new Map();
        for(let i=1;i<=gameDimen;i++){// "по каждому числу ходов, которое может выпасть на ряд"
            let sumVariants = numSplitToAugend.get(i);
            let newGroup = []; //итоговое множество ходов шашек ряда, которое будет в checkersTotalMoves с ключем i
            let qntSumVariant = sumVariants.length;
            for (let j=0;j<qntSumVariant;j++){// "по каждому разложению на слагаемые, которые могут быть у этого числа ходов"
                let curSumVariant = sumVariants[j];
                let curSumVrntLng = curSumVariant.length;
                let doubles = new Map();
                for (let k=0;k<curSumVrntLng;k++) {//формируем набор цифр, который повторяется в текущем разложении на сагаемые
                    let checkNum = curSumVariant[k];
                    for (let l=0;l<k;l++){
                        if (curSumVariant[l]==checkNum){
                            doubles.set(k+1, l+1);
                            break;
                        }
                    }
                }
//        console.log(curSumVariant, '==', doubles);
//формируем набор распределений ходов между шашками для конкретного (curSplitToCheckers) распределения конкретного (curSumVrntLng) числа по слагаемым
                let curSplitToCheckers = numSplitToPlaces.get(curSumVrntLng);
                let curSplitToCheckersQnt = curSplitToCheckers.length;
                let splitNumToCheckers = []; // промежуточное множество, соответствующее текущему варианту распределения конкретноых слагаемых
                for(let k=0;k<curSplitToCheckersQnt;k++){//"по каждому варианту распределения слагаемых по шашкам ряда'
                    let newElement = curSplitToCheckers[k].slice();
                    let isNotDouble = true;
                    if (doubles.size > 0){
                        for (let numToFind of doubles.keys()){//меняем номера повторящихся слагаемых на номер первого вхождения
                            for (let l=0; l<gameDimen;l++){
                                if (newElement[l] == numToFind) newElement[l] = doubles.get(numToFind);
                            }
                        }
                        let curSplitNumToCheckersQnt =splitNumToCheckers.length;
                        for(let l=0; l<curSplitNumToCheckersQnt; l++){//проверка, не получился ли новый массив повтором уже существующего
                            isNotDouble = !isArrayEq(splitNumToCheckers[l], newElement);
                            if (!isNotDouble) break;
                        }
                    }
                    if (isNotDouble) splitNumToCheckers.push(newElement);
                }
                let curIndex;
                for (let k=0;k<splitNumToCheckers.length;k++){
                    for (let l=0; l<gameDimen; l++){
                        curIndex = splitNumToCheckers[k][l];
                        if (curIndex!==0) splitNumToCheckers[k][l] = curSumVariant[curIndex-1];
                    }
                    newGroup.push(splitNumToCheckers[k]);
                }
            }
            checkersTotalMoves.set(i,newGroup);
        }
        return checkersTotalMoves;
    }


    minWhite (position) {
        let whites = position.get('white');
        let gameDimen = this.gameDimen;
        let result = this.deskLength;
        for (let row=0;row<gameDimen;row++) {
            let len = whites[row].length;
            if (len===0) continue;
            result = (whites[row][len-1] < result) ? whites[row][len-1] : result;
        }
        return result;
    }

    maxBlack (position) {
        let blacks = position.get('black');
        let gameDimen = this.gameDimen;
        let result = 0;
        for (let row=0;row<gameDimen;row++) {
            let len = blacks[row].length;
            if (len===0) continue;
            result = (blacks[row][0] > result) ? blacks[row][0] : result;
        }
        return result;
    }

    getSurvivedNum (position, color, competitorBackLine) {
//        let soldiers = position.get(color).join(',').split(',').map((a)=>{return 1*a});
        let soldiers = position.get(color).join(',').split(',');
        let len = soldiers.length;
        let direct = (color === "white") ? 1 : -1;
        let survivedNum = 0;
        for (let i=0;i<len;i++){
            if ((soldiers[i]!=0)&&(direct*soldiers[i]>direct*competitorBackLine)) survivedNum++;
        }
//        console.log(color, ' survived = ', survivedNum, ' backline = ', competitorBackLine, ' ', soldiers);
        return survivedNum;
    }

    isNoBattle (position) {
        let wBack = this.minWhite(position);
        let wTotal = this.getCheckersTotalNum(position, 'white');
        let bBack = this.maxBlack(position);
        let bTotal = this.getCheckersTotalNum(position, 'black');
        let wSurvived = this.getSurvivedNum(position,'white',bBack);
        let bSurvived = this.getSurvivedNum(position,'black',wBack);
        if ((wTotal < bSurvived)||(bTotal<wSurvived)) return true;
        return wBack > bBack;
    }

    getNotEmptyRowsNum (position, color) {
        let f = (allCheckers, currentRow)=>{return allCheckers+(currentRow.length>1)};
        return position.get(color).reduce(f,0);
    }

    getCheckersTotalNum (position, color) {
        let f = (allCheckers, currentRow)=>{return allCheckers+currentRow.length};
        return position.get(color).reduce(f,0);
    }

    isGameOver (state) {
        let wTotal = this.getCheckersTotalNum(state.position, 'white');
        if (!wTotal) return true;
        let bTotal = this.getCheckersTotalNum(state.position, 'black');
        if (!bTotal) return true;
        return this.isNoBattle(state.position);
    }

}

module.exports = GameTreasurer;