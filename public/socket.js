
// socket connection to server
const socket = io();

// element pointers
const gameOverMenu = document.querySelector('.game__death');
const playAgainButton = document.querySelector('#play-again');
const quit = document.querySelector('#quit');
const scores = document.querySelector('.scores');

// when connected to socket server, then initialize event listeners
socket.on('connect',()=>{
    // join game
    socket.emit('join',{
        username,
        color
    })

    // once server allows user to join, then start drawing
    socket.on('joined',()=>{
        draw();
    })

    // when server updates game logic, then update variables on client side
    socket.on('update',(gameLogic)=>{
        players = gameLogic.players;
        pos = gameLogic.pos;
        rows = gameLogic.rows;
        cols = gameLogic.cols;
        fruits = gameLogic.fruits;
        messages = gameLogic.messages;
        const highscore = gameLogic.highscore;
        const highscore_name = gameLogic.highscore_name;
        document.querySelector('.highscore').innerHTML = `${highscore_name}: ${highscore}`;
        scores.innerHTML = "";
        players.forEach(player=>{
            let style="";
            if(player.i === pos.i && player.j === pos.j){
                style = "font-weight: bold;font-size: 1.5rem";
            }
            scores.innerHTML += `
                <li style='${style}'>${player.username} ---- ${player.body.length}</li>
            `;
        })
    })

    // when server says you are dead, then show game over screen
    socket.on('death',({score,msg})=>{
        document.querySelector('.final-score').innerHTML = score;
        document.querySelector('.death-message').innerHTML = msg;
        gameOverMenu.classList.add('show');
    });
})

// play again button
playAgainButton.addEventListener('click',e=>{
    socket.emit('play-again');
    gameOverMenu.classList.remove('show');
})

// quit button
quit.addEventListener('click',e=>{
    window.location.href = "/";
})

// when arrays are pushed, then tell server to change direction
document.addEventListener('keydown',(e)=>{
    e.preventDefault();
    switch(e.key){
        case "a":
        case "ArrowLeft":
            socket.emit('left');
            break;
        case "d":
        case "ArrowRight":
            socket.emit('right');
            break;
        case "w":
        case "ArrowUp":
            socket.emit('up');
            break;
        case "s":
        case "ArrowDown":
            socket.emit('down');
            break;
    }
})

let oM;
let m;

// return x,y of touch position
function getTouchPos(e,i){
	let rect = c.getBoundingClientRect();
	return{
		x: e.touches[i].clientX - rect.left,
		y: e.touches[i].clientY - rect.top
	}
}

// check if user touches screen
document.addEventListener('touchstart',e=>{
	if(e.target==c)
		e.preventDefault();
},{passive: false});

document.addEventListener('touchmove',e=>{
	if(e.target==c)
		e.preventDefault();
},{passive: false});

// when puts finger on screen
c.addEventListener('touchstart',e=>{
	oM = getTouchPos(e,e.touches.length-1);	
}, false);

// calculate angle from original position to new position
c.addEventListener('touchmove',e=>{
        m = getTouchPos(e,e.touches.length-1);
        angle = Math.atan2(m.y-oM.y,m.x-oM.x);
        socket.emit('change-angle',{angle});
},false);

// when user removes finger from screen
document.addEventListener('touchend',e=>{
	if(e.touches.length==0){
		pm = "none";
		m = oM = undefined;
	}
},false);