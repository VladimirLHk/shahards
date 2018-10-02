'use strict'

function isArrayEq(ar1, ar2) {
    if (ar1.length!==ar2.length)return false;
    for (let i=0;i<ar1.length;i++) if(ar1[i]!==ar2[i]) return false;
    return true;
}

function isVectorInMatrix(matrix, vector) {
    if (!matrix.length) return false;
    for (let i=0;i<matrix.length;i++){
        if (isArrsTheSameShuffled(matrix[i],vector)) return true;
    }
    return false;
}

function isArrsTheSameShuffled(arr1, arr2) {
    let arr1Sorted = arr1.sort((a,b)=>a-b);
    let arr2Sorted = arr2.sort((a,b)=>a-b);
    return isArrayEq(arr1Sorted,arr2Sorted);
}

/*
раскладывает номер варианта сочетаний на номера вариантов в подмножествах,
из которых составлено это сочетание.
предполагается, что возрастание номера вариантов сочетаний идет слева на право,
т.е. сначала проходят варианты из множества,
соответствующего первому ненулевому элементу передаваемого массива, потом второго и т.д.
 */
function decodeVariantSet(varNum, maxNums) {
    let result = [];
    let arrLen = maxNums.length;
    if ((varNum<=0) || (arrLen==0)) return false;
    else {
        // выбрать из исходного массива все значения, отличные от 0 и 1,
        // в том же порядке, как они следуют в исходном массиве
        let realMaxNums = [];
        for (let i=0; i<arrLen;i++){
            if (maxNums[i] > 1) realMaxNums.push(maxNums[i]);
        }
        let baseNum = realMaxNums.length;
        let res = [(varNum-1)%realMaxNums[0]+1];
        let rest = (varNum-res[0])/realMaxNums[0];
        let posBegin = 1; //с какого номера начинает работать эта позиция варьирования
        for (let i=1; i<baseNum; i++){
            posBegin *= realMaxNums[i-1];
            if (varNum<=posBegin) res[i]=1 //эта позиция ещё не прошла ни одного полного цикла
            else {
                res[i]= rest%realMaxNums[i]+1;
                rest = (rest-res[i]+1)/realMaxNums[i];
            }
        }
        for (let i=0;i<arrLen;i++) {
            let num = (maxNums[i]===undefined) ? 0 : maxNums[i];
            if (maxNums[i]>1) num = res.shift();
            result.push(num);
        }
        return result;
    }
}



function removeNumFromArr (arr, num) {
    let result = [];
    let arrLen = arr.length;
    for (let i=0;i<arrLen;i++){
        let newRow = arr[i].slice();
        let index = arr[i].indexOf(num);
        if (index+1) newRow.splice(index,1);
        result.push(newRow);
    }
    return result;
}

module.exports.isArrayEq = isArrayEq;
module.exports.isArrsTheSameShuffled = isArrsTheSameShuffled;
module.exports.decodeVariantSet = decodeVariantSet;
module.exports.isVectorInMatrix = isVectorInMatrix;
module.exports.removeNumFromArr = removeNumFromArr;