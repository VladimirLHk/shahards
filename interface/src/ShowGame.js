import React, { Component } from 'react';
import './App.css';

class ShowGame extends Component {
/*   constructor (props) {
        super (props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange (e) {
        this.props.onSyllableFilterChange(adjustFilterString(e.target.value));
    }
*/
    render() {
        const gameDimen = this.props.gameDimen;
        const deskLength = this.props.deskLength;
        const deskPos = this.props.deskPos;
        const moveNum = this.props.moveNum;
        const maxMoveNum = this.props.maxMoveNum;
        const moverName = this.props.moverName;
        const varNum = this.props.varNum;
        const hiddenNotes = false;
        const notesHeight = ""+(deskLength+2)+"em";
        const wDiceTable = this.props.wDiceTable;
        const wDice = wDiceTable ? [<td>{wDiceTable[0]}</td>,<td>{wDiceTable[1]}</td>] : [<td className="row"></td>,<td></td>];
        const bDiceTable = this.props.bDiceTable;
        const bDice = bDiceTable ? [<td>{bDiceTable[0]}</td>,<td>{bDiceTable[1]}</td>] : [<td className="row"></td>,<td></td>];

        function getDiceBlock (diceTable) {
            let diceBlock;

            if (diceTable) {
                let firstLine = [<p> Результат броска кубиков: </p>];
                let secondLine = [<table className="desk" border="3"><tbody><tr><td>{diceTable[0]}</td><td>{diceTable[1]}</td></tr></tbody></table>];

                let units = varNum % 10;
                let tens = (varNum - units) % 100 / 10;
                let endOfThirdLine;

                if (tens === 1) endOfThirdLine = "вариантов хода";
                else switch (units) {
                    case 1:
                        endOfThirdLine = "вариант хода";
                        break;
                    case 2:
                    case 3:
                    case 4:
                        endOfThirdLine = "варианта хода";
                        break;
                    default: endOfThirdLine = "вариантов хода";
                }
                /*
                1, 21 вариант хода
                2-4,22-24,  варианта хода
                5-20 вариантов хода
                */
                let thirdLine;
                switch (varNum) {
                    case undefined:
                        thirdLine = [<p> В этой позиции при таком броске <br/> нет возможных ходов </p>];
                        break;
                    case 1:
                        thirdLine = [<p> В этой позиции при таком броске <br/> есть единственный ход </p>];
                        break;
                    default: thirdLine = [<p> В этой позиции при таком броске <br/> есть {varNum} {endOfThirdLine}</p>];
                }
                diceBlock = [firstLine,secondLine,thirdLine];
            } else diceBlock = [<br/>,<br/>,<br/>,<br/>,<br/>,<br/>,<br/>];

            return diceBlock
        }

        let desk = [];
        let firstRow = [<td></td>];
        for (let i=1; i<=gameDimen;i++) firstRow.push(<td colSpan={2}>{String.fromCharCode("0x"+(40+i))}</td>);
        firstRow.push(<td></td>);
        desk.push(<tr>{firstRow}</tr>);
        for (let i=0;i<deskLength;i++) {
            let tabRow = [<td>{deskLength-i}</td>];
            for (let j=0;j<gameDimen*2;j++) tabRow.push(<td>{deskPos[i][j]}</td>);
            tabRow.push(<td>{deskLength-i}</td>);
            desk.push(<tr>{tabRow}</tr>);
        }
        desk.push(<tr>{firstRow}</tr>);

        return (
            <div className="App" >

                <div className="rightSide">
                    <p> Ход № {moveNum} из {maxMoveNum}</p>
                    {getDiceBlock(this.props.wDiceTable)}
                    <table className="desk" border="3"><col/><col span={gameDimen*2} className="coln"/><tbody>{desk}</tbody></table>
                    {getDiceBlock(this.props.bDiceTable)}
                </div>
                <p className="Notes" hidden={hiddenNotes} height={notesHeight}>
                    Здесь будут комментарии к кадрам!!!
                </p>
            </div>
        );

    }
}

export default ShowGame;
/*
                <div className="rightSide">
                    <p> Ход № {moveNum} из {maxMoveNum} делают {moverName}</p>
                    <p> Результат броска кубиков </p>
                    <table className="desk" border="3"><col span={2} className="coln"/><tbody><tr>{wDice}</tr></tbody></table>
                    <p> Нет возможных ходов </p>
                    <table className="desk" border="3"><col/><col span={gameDimen*2} className="coln"/><tbody>{desk}</tbody></table>
                    <p> Результат броска кубиков </p>
                    <table className="desk" border="3"><col span={2} className="coln"/><tbody><tr>{bDice}</tr></tbody></table>
                    <p> Нет возможных ходов </p>
                </div>

 */