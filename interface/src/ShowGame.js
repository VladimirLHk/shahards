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
        const moveNum = this.props.moveNum ? this.props.moveNum : 1;
        const maxMoveNum = this.props.maxMoveNum ? this.props.maxMoveNum : 1;
        const color = (this.props.color === "white") ? '"нолики"' : '"крестики"';
        const hiddenNotes = false;
        const notesHeight = ""+(deskLength+2)+"em";


        let desk = [];
        let firstRow = [<td></td>];
        for (let i=1; i<=gameDimen;i++) firstRow.push(<td colSpan={2}>{String.fromCharCode("0x"+(40+i))}</td>);
        firstRow.push(<td></td>);
        desk.push(firstRow);
        for (let i=0;i<deskLength;i++) {
            let tabRow = [<td>{deskLength-i}</td>];
            for (let j=0;j<gameDimen*2;j++) tabRow.push(<td>{deskPos[i][j]}</td>);
            tabRow.push(<td>{deskLength-i}</td>);
            desk.push(<tr> {tabRow} </tr>);
        }
        desk.push(firstRow);

        return (
            <div className="App" >

                <div className="rightSide">
                    <p> Ход № {moveNum} из {maxMoveNum} делают {color}</p>
                    <p> Результат броска кубиков </p>
                    <table className="desk" border="3"><td>1</td><td>2</td></table>
                    <p> Нет возможных ходов </p>
                    <table className="desk" border="3">{desk}</table>
                    <p> Результат броска кубиков </p>
                    <table className="desk" border="3"><td>1</td><td>2</td></table>
                    <p> Нет возможных ходов </p>
                </div>
                <p className="Notes" hidden={hiddenNotes} height={notesHeight}>
                    Duis autem dolor in hendrerit in vulputate velit esse molestie consequat, vel
                    illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
                    dignissim qui blandit praesent luptatum zzril delenit au gue duis dolore te
                    feugat nulla facilisi.
                    Duis autem dolor in hendrerit in vulputate velit esse molestie consequat, vel
                    illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
                    dignissim qui blandit praesent luptatum zzril delenit au gue duis dolore te
                    feugat nulla facilisi.
                    Duis autem dolor in hendrerit in vulputate velit esse molestie consequat, vel
                    illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
                    dignissim qui blandit praesent luptatum zzril delenit au gue duis dolore te
                    feugat nulla facilisi.
                    Duis autem dolor in hendrerit in vulputate velit esse molestie consequat, vel
                    illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
                    dignissim qui blandit praesent luptatum zzril delenit au gue duis dolore te
                    feugat nulla facilisi.
                    Duis autem dolor in hendrerit in vulputate velit esse molestie consequat, vel
                    illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
                    dignissim qui blandit praesent luptatum zzril delenit au gue duis dolore te
                    feugat nulla facilisi.
                </p>
            </div>
        );
  }
}

export default ShowGame;
