const SIZE = 8 // Number of rows/columns on the checkers board
const boardEl = document.getElementById('board') // Reference to the HTML element containing the board
const logEl = document.getElementById('log') // Reference to the log/status message display
const turnLabel = document.getElementById('turnPlayer') // Reference to the element showing whose turn it is
const newBtn = document.getElementById('newGameBtn') // Reference to the "New Game" button
const blueTray = document.getElementById('blueTray') // Reference to the container holding captured red pieces
const redTray = document.getElementById('redTray') // Reference to the container holding captured blue pieces
const winOverlay = document.getElementById('winOverlay') // Reference to the overlay shown when someone wins
const winText = document.getElementById('winText') // Reference to the text in the win overlay
const playAgain = document.getElementById('playAgain') // Reference to the "Play Again" button

let board = [] // 2D array representing the state of the game board
let turn = 'blue' // Whose turn it currently is ('blue' or 'red')
let selected = null // Currently selected piece position {r, c}
let capturedByBlue = 0 // How many red pieces have been captured by blue
let capturedByRed = 0 // How many blue pieces have been captured by red
let nextId = 1 // Unique ID counter for pieces

// Helper: Check if a given row/column is inside the board boundaries
const inside = (r,c)=> r>=0 && r<SIZE && c>=0 && c<SIZE

// Build the HTML grid for the board squares
function buildGrid(){
  boardEl.innerHTML = '' // Clear existing board
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const sq = document.createElement('button') // Create a button for each square
      sq.className = 'square ' + ((r+c)%2 ? 'dark' : 'light') // Alternate dark/light squares
      sq.dataset.row = r // Store row index
      sq.dataset.col = c // Store column index
      sq.setAttribute('role','gridcell') // Accessibility role
      sq.addEventListener('click', onSquareClick) // Click handler
      boardEl.appendChild(sq) // Add to board container
    }
  }
}

// Place initial pieces on the board
function populatePieces(){
  board = Array.from({length:SIZE}, ()=> Array(SIZE).fill(null)) // Fill with null (empty)
  // Add red pieces to top 3 rows
  for(let r=0;r<3;r++){
    for(let c=0;c<SIZE;c++){
      if((r+c)%2===1) board[r][c] = {id:nextId++, color:'red', king:false}
    }
  }
  // Add blue pieces to bottom 3 rows
  for(let r=SIZE-3;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      if((r+c)%2===1) board[r][c] = {id:nextId++, color:'blue', king:false}
    }
  }
  capturedByBlue = 0 // Reset capture counts
  capturedByRed = 0
  renderStacks() // Render capture trays
}

// Get bounding boxes for each piece before move (for animation)
function snapshotRects(){
  const map = new Map()
  document.querySelectorAll('.piece').forEach(el=>{ 
    map.set(el.dataset.pid, el.getBoundingClientRect()) 
  })
  return map
}

// FLIP animation for moving a piece
function applyFLIPFor(id, prev){
  return new Promise(resolve=>{
    const before = prev.get(String(id)) // Get previous position
    const el = document.querySelector(`.piece[data-pid="${id}"]`) // Find piece element
    if(!before || !el){ resolve(); return } // If missing, skip
    const after = el.getBoundingClientRect() // Get new position
    const dx = before.left + before.width/2 - (after.left + after.width/2) // X movement
    const dy = before.top + before.height/2 - (after.top + after.height/2) // Y movement
    if(!dx && !dy){ resolve(); return } // No movement
    el.style.transition = 'none' // Disable transitions for setup
    el.style.transform = `translate(${dx}px, ${dy}px)` // Start from old position
    void el.getBoundingClientRect() // Force reflow
    const onEnd = ()=>{ el.removeEventListener('transitionend', onEnd); resolve() } // End listener
    el.addEventListener('transitionend', onEnd)
    requestAnimationFrame(()=>{ 
      el.style.transition = 'transform 220ms ease' // Animate to new position
      el.style.transform = 'translate(0px,0px)'
    })
    setTimeout(()=> resolve(), 300) // Fallback resolve
  })
}

// Render board state to HTML
function render(){
  // Clear all squares
  [...document.querySelectorAll('.square')].forEach(s=>{
    s.classList.remove('selected')
    const dot = s.querySelector('.move')
    if(dot) dot.remove()
    s.innerHTML = ''
  })
  // Add pieces to their positions
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const sq = getSquare(r,c)
      const piece = board[r][c]
      if(piece){
        const el = document.createElement('div')
        el.className = 'piece ' + piece.color + (piece.king ? ' king' : '') + 
                       (selected && selected.r===r && selected.c===c ? ' selected' : '')
        el.dataset.pid = String(piece.id)
        sq.appendChild(el)
      }
    }
  }
  // Highlight moves for selected piece
  if(selected){
    getSquare(selected.r,selected.c).classList.add('selected')
    const caps = captureMoves(selected.r, selected.c)
    const moves = caps.length ? caps.map(m=>({r:m.r,c:m.c})) : simpleMoves(selected.r, selected.c)
    moves.forEach(m=>{
      const targetSq = getSquare(m.r, m.c)
      const dot = document.createElement('div')
      dot.className = 'move'
      targetSq.appendChild(dot)
    })
  }
  turnLabel.textContent = cap(turn) // Update turn label
}

// Render captured pieces in trays
function renderStacks(){
  blueTray.innerHTML = ''
  redTray.innerHTML = ''
  for(let i=0;i<capturedByBlue;i++){
    const t = document.createElement('div')
    t.className = 'cap-token red'
    t.style.top = `${calcStackTop(i)}%`
    blueTray.appendChild(t)
  }
  for(let i=0;i<capturedByRed;i++){
    const t = document.createElement('div')
    t.className = 'cap-token blue'
    t.style.top = `${calcStackTop(i)}%`
    redTray.appendChild(t)
  }
}

// Helper: Calculate vertical offset for captured piece stacks
function calcStackTop(i){ return 2 + i * 6 }

// Helper: Get HTML square at given row/col
function getSquare(r,c){ return boardEl.children[r*SIZE + c] }

// Get possible movement directions for a piece
function dirsFor(piece){
  const out = []
  if(piece.color==='blue' || piece.king) out.push([-1,-1],[-1,1]) // Up-left, up-right
  if(piece.color==='red'  || piece.king) out.push([ 1,-1],[ 1, 1]) // Down-left, down-right
  return out
}

// Get non-capturing moves for a piece
function simpleMoves(r,c){
  const piece = board[r][c]
  if(!piece) return []
  const out = []
  for(const [dr,dc] of dirsFor(piece)){
    const nr = r + dr, nc = c + dc
    if(inside(nr,nc) && !board[nr][nc]) out.push({r:nr,c:nc})
  }
  return out
}

// Get capturing moves for a piece
function captureMoves(r,c){
  const piece = board[r][c]
  if(!piece) return []
  const out = []
  for(const [dr,dc] of dirsFor(piece)){
    const mr = r + dr, mc = c + dc
    const lr = r + 2*dr, lc = c + 2*dc
    if(inside(lr,lc) && inside(mr,mc)){
      const mid = board[mr][mc]
      if(mid && mid.color !== piece.color && !board[lr][lc]){
        out.push({r:lr,c:lc, capR:mr, capC:mc})
      }
    }
  }
  return out
}

// Check if a capture is available for given color
function anyCaptureAvailable(color){
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const p = board[r][c]
      if(p && p.color===color && captureMoves(r,c).length) return true
    }
  }
  return false
}

// Check if a player has any legal move
function hasAnyMove(color){
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const p = board[r][c]
      if(p && p.color===color){
        if(simpleMoves(r,c).length || captureMoves(r,c).length) return true
      }
    }
  }
  return false
}

// Handle square click
async function onSquareClick(e){
  if(!winOverlay.classList.contains('hidden')) return // Ignore if game over
  const r = Number(e.currentTarget.dataset.row)
  const c = Number(e.currentTarget.dataset.col)
  const piece = board[r][c]
  // Selecting own piece
  if(piece && piece.color === turn){
    selected = {r,c}
    const mustCap = anyCaptureAvailable(turn)
    render()
    say(mustCap ? 'Capture available' : cap(turn) + ' to move')
    return
  }
  // Moving to empty square
  if(selected && !piece){
    const caps = captureMoves(selected.r, selected.c)
    const mustCap = anyCaptureAvailable(turn)
    const capMove = caps.find(m=> m.r===r && m.c===c)
    if(mustCap){
      if(capMove){
        await doMoveAnimated(selected.r, selected.c, r, c)
        collectCaptured(capMove.capR, capMove.capC)
        await crownIfNeededAnimated(r,c)
        if(!winOverlay.classList.contains('hidden')) return
        const moreCaps = captureMoves(r,c)
        if(moreCaps.length){
          selected = {r,c}
          render()
          say('Continue capture')
          return
        }else{
          endTurn()
          return
        }
      }else{
        say('You must capture')
        return
      }
    }else{
      const moves = simpleMoves(selected.r, selected.c)
      const isLegal = moves.some(m=> m.r===r && m.c===c)
      if(isLegal){
        await doMoveAnimated(selected.r, selected.c, r, c)
        await crownIfNeededAnimated(r,c)
        endTurn()
        return
      }
    }
  }
  selected = null
  render()
}

// Move a piece with animation
async function doMoveAnimated(sr,sc,tr,tc){
  const moving = board[sr][sc]
  const prev = snapshotRects()
  board[tr][tc] = moving
  board[sr][sc] = null
  render()
  await applyFLIPFor(moving.id, prev)
}

// Crown piece if it reaches far row (animated)
async function crownIfNeededAnimated(r,c){
  const p = board[r][c]
  if((p.color==='blue' && r===0) || (p.color==='red' && r===SIZE-1)){
    p.king = true
    render()
    const el = document.querySelector(`.piece[data-pid="${p.id}"]`)
    if(el){
      el.classList.add('king-pop')
      await new Promise(res=>{
        el.addEventListener('animationend', res, {once:true})
        setTimeout(res, 400)
      })
      el.classList.remove('king-pop')
    }
  }
}

// Remove captured piece from board and update score
function collectCaptured(r,c){
  const victim = board[r][c]
  if(!victim) return
  if(victim.color === 'red'){ capturedByBlue++ } else { capturedByRed++ }
  board[r][c] = null
  renderStacks()
  const victimStillOnBoard = board.flat().some(p=> p && p.color===victim.color)
  if(!victimStillOnBoard){ showWin(cap(turn) + ' wins') }
}

// Switch turn to other player
function endTurn(){
  selected = null
  turn = turn==='blue' ? 'red' : 'blue'
  render()
  say(cap(turn) + ' to move')
  checkWin()
}

// Check if current player has lost
function checkWin(){
  const current = turn
  const currentHasPiece = board.flat().some(p=> p && p.color===current)
  const currentHasMove = hasAnyMove(current)
  if(!currentHasPiece || !currentHasMove){
    const winner = current==='blue' ? 'Red' : 'Blue'
    showWin(winner + ' wins')
  }
}

// Show win overlay
function showWin(text){
  winText.textContent = text
  winOverlay.classList.remove('hidden')
}

// Hide win overlay
function hideWin(){ winOverlay.classList.add('hidden') }

// Show message in log
function say(text){ logEl.textContent = text }

// Start a new game
function newGame(){
  hideWin()
  turn = 'blue'
  selected = null
  populatePieces()
  render()
  say('New game set')
}

// Event listeners for buttons
newBtn.addEventListener('click', newGame)
playAgain.addEventListener('click', newGame)

// Capitalize first letter helper
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

// Initialize game
buildGrid()
newGame()