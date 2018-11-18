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
        const players = this.props.players;
        const playersNum = this.props.playersNum;
        const varNum = this.props.varNum;
        const hiddenNotes = false;
        const notesHeight = ""+(deskLength+2)+"em";

        function getDiceBlock (diceTable) {
            let diceBlock = [];

            if (diceTable) {
                let firstLine = [<p key={'1'}> Результат броска кубиков: </p>];
                let secondLine = [<table className="desk" border="3" key={'2'}><tbody><tr><td>{diceTable[0]}</td><td>{diceTable[1]}</td></tr></tbody></table>];
                diceBlock = [firstLine,secondLine,<br key={'3'}/>];
            } else for (let i=0;i<5;i++) diceBlock.push(<br key={''+i}/>);

            return diceBlock
        }

        let desk = [];
        let firstRow = [<td key={'r0c0'}></td>];
        for (let i=1; i<=gameDimen;i++) firstRow.push(<td colSpan={2} key={'r0c'+i}><b>{i}</b></td>);
        firstRow.push(<td key={'r0c'+(gameDimen+1)}></td>);
        desk.push(<tr key={'r0'}>{firstRow}</tr>);
        for (let i=0;i<deskLength;i++) {
            let tabRow = [<td key={'r'+(i+1)+'c0'}>{deskLength-i}</td>];
            for (let j=0;j<gameDimen*2;j++) tabRow.push(<td key={'r'+(i+1)+'c'+(j+1)}>{deskPos[i][j]}</td>);
            tabRow.push(<td key={'r'+(i+1)+'c'+(gameDimen*2+1)}>{deskLength-i}</td>);
            desk.push(<tr key={'r'+(i+1)}>{tabRow}</tr>);
        }
        desk.push(<tr key={'r'+(deskLength+1)}>{firstRow}</tr>);

        return (
            <div>

                <div className="rightSide">
                    <p>Ход № {moveNum} из {maxMoveNum}</p>
                    <p>На доске:</p>
                    <p className="App">Шашек игрока "{players['white']}" : {playersNum[0]}</p>
                    <p className="App">Шашек игрока "{players['black']}" : {playersNum[1]}</p>
                    {getDiceBlock(this.props.wDiceTable)}
                    <table className="desk" border="3"><col/><col span={gameDimen*2} className="coln"/><tbody>{desk}</tbody></table>
                    {getDiceBlock(this.props.bDiceTable)}
                </div>
                <div className="Notes" hidden={hiddenNotes} height={notesHeight}>
                    {this.props.comment}
                </div>
            </div>
        );

    }
}

export default ShowGame;
