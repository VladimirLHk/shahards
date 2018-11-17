import React, { Component } from 'react';
import './App.css';

class Control extends Component {
    /*   constructor (props) {
            super (props);
            this.handleChange = this.handleChange.bind(this);
        }

        handleChange (e) {
            this.props.onSyllableFilterChange(adjustFilterString(e.target.value));
        }
    */


    render() {
        return (
            <div className="App">
                <button id="Back" onClick={this.props.nextPicture}>Back</button>
                <span>   </span>
                <button id="Next" onClick={this.props.nextPicture}>Next</button>
            </div>
        );
    }
}

export default Control;
