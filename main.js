'use strict'


var gBoard = []
const MINE = '💣'
const FLAG = '🚩'
const LIFE = '🖤'
const REGULAR = '😃'
const LOST = '🤯'
const VICTORY = '😎'
const HINT = '🕯️'
var check = true
var isManually = false
var gSafeCells = []
var Interval
var seconds = 0
var tens = 0
var isFlaged = true
var gCountLife
var gCountHint
var isUsed = false
var countSafeClick
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var isFirstCall = true


function onInit() {
    stopTimer()
    var elTable = document.querySelector('tbody')
    elTable.innerHTML = ''
    gBoard = []
    createBoard()
    renderBoard()
    gGame.isOn = true
    isFirstCall = true
    gCountLife = 3
    gCountHint = 3
    var elLife = document.querySelector('.life')
    elLife.innerHTML = LIFE + LIFE + LIFE
    var elState = document.querySelector('.state').innerHTML = REGULAR
    var elHint = document.querySelector('.hint').innerHTML = HINT + HINT + HINT
    var eltens = document.querySelector('.tens')
    var elsec = document.querySelector('.seconds')
    eltens.innerHTML = "0"
    elsec.innerHTML = "0"
    seconds = 0
    tens = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
    countSafeClick = 3
    var elBtn = document.querySelector(".spanSafe")
    elBtn.innerHTML = countSafeClick
    var isManually = false
    var elManu = document.querySelector(".manu")
     elManu.style.background = '#b17aae'
     elManu.style.hover ='#5b6d8c'
    check = true

}

function renderBoard() {
    var strHTML = ''
    var elTable = document.querySelector('tbody')
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr >\n`
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            var className = (cell.isMine) ? 'mine' : ''


            var title = `Cell: ${i + 1}, ${j + 1}`

            strHTML += `<td title="${title}" class="cell ${className} unmark" oncontextmenu="onCellMarked(this,event)" onclick="onCellClicked(${i}, ${j})"
                         data-i="${i}" data-j="${j}" ><span class="x">${cell.isMine ? MINE : ''}</span><span class="flag"></span>
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    elTable.innerHTML += strHTML
}
function renderNumbers() {
    var elCell
    updateMine()
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) continue
            elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"] .x`)
            elCell.innerHTML = gBoard[i][j].minesAroundCount
            if (gBoard[i][j].minesAroundCount === 0)
                elCell.innerHTML = ''



        }
    }
}
function onCellClicked(i, j) {
    if (gBoard[i][j].isShown)
        return
    if (!gGame.isOn)
        return
    if (isFirstCall&&!isManually&&check) {
        Interval = setInterval(startTimer, 10)
        isFirstCall = false
        createMines(i, j)
        renderNumbers()
    }
    if (isManually) {
        if(!isFirstCall){

        }
        else
            {
        createMines(i, j)
        var element = document.querySelector(`[data-i="${i}"][data-j="${j}"].x`)
        var parEl = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
        parEl.style.background = '#4b0082'
        changeColor(i, j)
        renderNumbers()
        check = false
        return}
    }
    if(!check&&isFirstCall){
        Interval = setInterval(startTimer, 10)
        isFirstCall = false
    }
    if (isUsed) {
        gCountHint--
        for (var indexI = i - 1; indexI <= i + 1; indexI++) {
            if (indexI < 0 || indexI >= gBoard.length) continue
            for (var indexJ = j - 1; indexJ <= j + 1; indexJ++) {
                if (indexJ < 0 || indexJ >= gBoard[0].length) continue
                if (gBoard[indexI][indexJ].isShown)
                    continue
                var elCurrCell = document.querySelector(`[data-i="${indexI}"][data-j="${indexJ}"]`)
                console.log('elCurrCell', elCurrCell)
                elCurrCell.classList.remove("unmark")
                elCurrCell.style.background = "white"
                addUnmark(elCurrCell)
                isUsed = false
            }

        }
        renderHint()
        return
    }

    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

    if (!elCell.classList.contains('unmark'))
        gBoard[i][j].isShown = true
    console.log(gBoard[i][j])
    if (gBoard[i][j].isMine) {
        var elState = document.querySelector('.state').innerHTML = LOST
        gCountLife--
        var elLife = document.querySelector('.life')
        switch (gCountLife) {
            case 2:
                elLife.innerHTML = LIFE + LIFE
                break
            case 1:
                elLife.innerHTML = LIFE
                break
            case 0:
                elLife.innerHTML = ''
                break
        }
        console.log('gCountLife', gCountLife)
        if (gCountLife === 0) {
            console.log('hi')
            gGame.isOn = false
            stopTimer()
        }

    }


    if (gBoard[i][j].isMarked)
        return
    elCell.classList.remove("unmark")
    elCell.style.background = "white"
    gBoard[i][j].isShown = true
    gGame.isShown++
    expandShown(elCell, i, j)
    checkGameOver()
}
function changeColor(i, j) {
    var element = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    setTimeout(() => { element.style.background = '#b1afaf' }, 1000)
}
function renderHint() {
    var elHint = document.querySelector('.hint')
    switch (gCountHint) {
        case 2:
            elHint.innerHTML = HINT + HINT
            break
        case 1:
            elHint.innerHTML = HINT
            break
        case 0:
            elHint.innerHTML = ''
            break
    }

}
function stopTimer() {
    clearInterval(Interval)

}
function addUnmark(cell, i, j) {
    setTimeout(() => {
        cell.classList.add("unmark")
        cell.style.background = '#b1afaf'
    }, 1000)


}
function createMines(row, col) {
    var countMine = gLevel.MINES

    if (!isManually) {
        for (var i = 0; i < countMine; i++) {

            var dataI = getRandomInt(0, gBoard.length - 1)
            var dateJ = getRandomInt(0, gBoard[0].length - 1)
            if (dataI < row + 1 && dataI > row - 1 || dateJ < col + 1 && dataI > col - 1 || dataI === row && dateJ === col) {
                countMine++
                continue
            }
            if (gBoard[dataI][dateJ].isMine === true) {
                countMine++
                continue

            }

            gBoard[dataI][dateJ].isMine = true
            var eltd = document.querySelector(`[data-i="${dataI}"][data-j="${dateJ}"] .x`)
            eltd.innerHTML = MINE
        }
    }
    else {
        gBoard[row][col].isMine = true
        var eltd = document.querySelector(`[data-i="${row}"][data-j="${col}"] .x`)
        eltd.innerHTML = MINE
    }

}
function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            console.log(currCell)
            if(currCell.isMine&&!currCell.isMarked)
            return
            if (!currCell.isMarked && !currCell.isShown) {
                return
            }
            if (currCell.isMarked && !currCell.isMine)
                return
        }
    }
    var elState = document.querySelector('.state').innerHTML = VICTORY
    gGame.isOn = false
    stopTimer()
}
function createBoard() {
    var countMine
    for (var i = 0; i < gLevel.SIZE; i++) {
        var arr = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            arr.push(createCell())
        }
        gBoard.push(arr)
    }


}


function updateMine() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var countMine = setMinesNegsCount(i, j)
            gBoard[i][j].minesAroundCount = countMine

        }

    }
}
function createCell() {
    var cell = {
        minesAroundCount: 4,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return cell
}
function setMinesNegsCount(rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (currCell.isMine)
                count++
        }
    }
    return count
}
function expandShown(elCell, rowIdx, colIdx) {
    if (elCell.innerText === '')
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (i === rowIdx && j === colIdx) continue
                if (j < 0 || j >= gBoard[0].length) continue
                var elSpanCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"] span`)
                var elCurrCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

                if (elSpanCurrCell.innerText === MINE)
                    continue
                elCurrCell.classList.remove("unmark")
                elCurrCell.style.background = "white"
                gBoard[i][j].isShown = true

            }

        }
}
function onCellMarked(elCell, event) {
    event.preventDefault()
    if (!gGame.isOn)
        return
    console.log((elCell.dataset.i))
    var elSpanFlag = document.querySelector(`[data-i="${elCell.dataset.i}"][data-j="${elCell.dataset.j}"] .flag`)

    if (gBoard[elCell.dataset.i][elCell.dataset.j].isMarked) {
        elSpanFlag.innerHTML = ''
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = false
        return

    }
    if (elCell.classList.contains('unmark') && !gBoard[elCell.dataset.i][elCell.dataset.j].isMarked) {
        elSpanFlag.innerHTML = FLAG
        gBoard[elCell.dataset.i][elCell.dataset.j].isMarked = true
        gGame.markedCount++
    }
    if (isFirstCall)
        Interval = setInterval(startTimer, 10)
    checkGameOver()
}
function chooseLevel(elBtn) {
    gLevel.SIZE = parseInt(elBtn.value)
    switch (gLevel.SIZE) {
        case 4:
            gLevel.MINES = 2
            break
        case 8:
            gLevel.MINES = 14
            break
        case 12:
            gLevel.MINES = 32
            break
    }
    stopTimer()
    onInit()
}
function hintCells() {
    isUsed = true
}

function startTimer() {
    tens++
    var eltens = document.querySelector('.tens')
    var elsec = document.querySelector('.seconds')


    if (tens <= 9) {
        eltens.innerHTML = "0" + tens
    }

    if (tens > 9) {
        eltens.innerHTML = tens

    }

    if (tens > 99) {
        console.log("seconds")
        seconds++
        elsec.innerHTML = "0" + seconds
        tens = 0
        eltens.innerHTML = "0" + 0
    }

    if (seconds > 9) {
        elsec.innerHTML = seconds
    }

}
function onSafeClick() {
    if (countSafeClick === 0)
        return
    countSafeClick--
    var elBtn = document.querySelector(".spanSafe")
    elBtn.innerHTML = countSafeClick
    gSafeCells = []
    creatSafeCells()
    var cell = drawNum()
    console.log('cell', cell)
    var elCell = document.querySelector(`[data-i="${cell.i}"][data-j="${cell.j}"]`)
    elCell.style.background = 'black'
    setTimeout(() => {
        elCell.style.background = '#b1afaf'
    }, 1000)
}
function creatSafeCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown)
                continue
            if (gBoard[i][j].isMine)
                continue
            if (gBoard[i][j].isMarked)
                continue
            gSafeCells.push(gBoard[i][j])
            gSafeCells[gSafeCells.length - 1].i = i
            gSafeCells[gSafeCells.length - 1].j = j
        }
    }
    shuffle()

}
function drawNum() {
    return gSafeCells.pop()
}
function shuffle() {
    for (let i = gSafeCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gSafeCells[i], gSafeCells[j]] = [gSafeCells[j], gSafeCells[i]]
    }
}
function manuallyCreate() {
    if(!isFirstCall)
    return
    isManually = !isManually
    var elManu = document.querySelector(".manu")
    if(isManually&&isFirstCall)
    elManu.style.background ='#5b6d8c'
    else 
    elManu.style.background = '#b17aae'



}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

