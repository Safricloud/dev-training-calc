'use strict';

function init() {
    // *** Global variables *** //

    let resultText = '';
    const operators = [
        { utf: '×', js: '*' }, // multiply
        { utf: '÷', js: '/' }, // divide
        { utf: '%', js: '%' }, // modulo
        { utf: '+', js: '+' }, // add
        { utf: '−', js: '-' }, // subtract
    ];
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const resultBox = document.getElementById('result-text');
    const buttons = document.querySelectorAll('.button');
    const equalsButton = document.getElementById('equals');

    // *** Functions *** //

    // Input logic. Expects the dom element that was clicked
    function clickHandler(el) {
        //console.log('clickHandler()');
        const valid = validateInput(el.innerText);
        if (valid) {
            if (el.classList.contains('clear')) {
                //console.log('Clear');
                clear();
                return;
            } else if (el.classList.contains('backspace')) {
                //console.log('Backspace');
                backspace();
                return;
            }
            let newResultText = resultText;
            newResultText += el.innerText;
            //console.log(el.innerText);
            if (el.classList.contains('equals')) {
                //console.log('Equals');
                equals(newResultText);
                return;
            }

            updateResultBox(newResultText);
        }
    }

    // Validates the input against a set of rules. Expects a string. Returns a boolean.
    function validateInput(str) {
        //console.log('validateInput()');

        // resultText has preceeding zero
        // handle - lastChar: empty, str: zero
        // handle - lastChar: empty, str: operator
        // handle - lastChar: empty, str: decimal point
        // handle - lastChar: empty, str: equals
        // handle - lastChar: operator, str: operator
        // handle - lastChar: operator, str: decimal point
        // handle - lastChar: operator, str: equals
        // handle - lastChar: decimal point, str: operator
        // handle - lastChar: decimal point, str: decimal point
        // handle - lastChar: decimal point, str: equals
        // allow - lastChar: empty, str: number
        // allow - lastChar: number, str: number
        // allow - lastChar: number, str: operator
        // allow - lastChar: number, str: decimal point
        // allow - lastChar: number, str: equals
        // allow - lastChar: operator, str: number
        // allow - lastChar: decimal point, str: number

        const lastChar = resultText[resultText.length - 1];

        // If the resultText starts with a zero, remove it
        if (resultText.length > 0 && resultText[0] === '0') {
            stripPreceedingZeros();
        }

        // If the input is a zero and no other characters have been entered, don't add it
        if (str === '0' && resultText.length < 1) {
            return false;
        }
        // If the input is an operator and no other characters have been entered, don't add it
        if (inputType(str) === 'operator' && resultText.length < 1) {
            return false;
        }
        // If the input is a decimal point and no other characters have been entered, add a zero before it
        if (str === '.' && resultText.length < 1) {
            resultText += '0';
            return true;
        }
        // If the input is an equals sign and no other characters have been entered, don't add it
        if (str === '=' && resultText.length < 1) {
            return false;
        }
        // If the input is an operator and the last character is an operator, replace it
        if (inputType(str) === 'operator' && inputType(lastChar) === 'operator') {
            resultText = resultText.slice(0, -1);
            return true;
        }
        // If the input is a decimal point and the last character is an operator, add a zero before it
        if (str === '.' && inputType(lastChar) === 'operator') {
            resultText += '0';
            return true;
        }
        // If the input is an equals sign and the last character is an operator, replace it
        if (str === '=' && inputType(lastChar) === 'operator') {
            resultText = resultText.slice(0, -1);
            return true;
        }
        // If the input is an operator and the last character is a decimal point, replace it
        if (inputType(str) === 'operator' && lastChar === '.') {
            resultText = resultText.slice(0, -1);
            return true;
        }
        // If the input is a decimal point and the last character is a decimal point, don't add it
        if (str === '.' && lastChar === '.') {
            return false;
        }
        // If the input is an equals sign and the last character is a decimal point, replace it
        if (str === '=' && lastChar === '.') {
            resultText = resultText.slice(0, -1);
            return true;
        }

        return true;
    }

    // Returns a string representing the type of input. Expects a string.
    function inputType(str) {
        //console.log('inputType()');
        if (operators.some((operator) => operator.utf === str) || operators.some((operator) => operator.js === str)) {
            return 'operator';
        }
        if (numbers.some((number) => number === parseInt(str))) {
            return 'number';
        }
        if (str === '.') {
            return 'decimal';
        }
        if (str === '=') {
            return 'equals';
        }
        return 'unknown';
    }

    // Changes the text displayed in the result box. Expects a string.
    function updateResultBox(str) {
        resultText = str;
        resultBox.innerText = resultText;
    }

    function parseCalculation(str) {
        let newStr = str.replaceAll('=', '');
        operators.forEach((operator) => {
            newStr = newStr.replaceAll(operator.utf, operator.js);
        });

        return newStr;
    }

    // Clears the result box. No input.
    function clear() {
        //console.log('Clear');
        updateResultBox('');
    }

    function backspace() {
        if (resultText.length > 0) {
            updateResultBox(resultText.slice(0, -1));
        }
    }

    function stripPreceedingZeros() {
        if (resultText.length > 0 && resultText[0] === '0') {
            if (resultText.length > 1 && resultText[1] === '.') {
                return;
            } else {
                updateResultBox(resultText.slice(1));
                stripPreceedingZeros();
            }
        } else {
            return;
        }
    }

    function equals(str) {
        let calcStr = parseCalculation(str);
        let answer = eval(calcStr);
        answer = answer.toString();
        if (answer.includes('.')) {
            const i = answer.indexOf('.');
            const numDecimals = answer.substring(i + 1).length;
            if (numDecimals > 14) {
                answer = parseFloat(answer);
                answer = answer.toFixed(14);
                answer = parseFloat(answer);
                answer = answer.toString();
            }
        }
        clear();
        updateResultBox(answer);
    }

    // *** Event Listeners *** //

    buttons.forEach((button) => {
        button.addEventListener('click', (e) => {
            clickHandler(e.target);
        });
    });

    document.addEventListener('keyup', (e) => {
        //console.log(e.key);
        if (e.key === 'Backspace') {
            backspace();
        } else if (e.key === 'Escape' || e.key === 'Delete') {
            clear();
        } else if (e.key === 'Enter') {
            clickHandler(equalsButton);
        } else if (inputType(e.key) === 'number' || e.key === '.' || inputType(e.key) === 'operator') {
            const valid = validateInput(e.key);
            if (valid) {
                updateResultBox(`${resultText}${e.key}`);
            }
        }
    });

    //
    //console.log('Script started');
    resultBox.innerText = resultText;
}

window.onload = init;
