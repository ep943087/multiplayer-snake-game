
const socket = io();

const gameOverMenu = document.querySelector('.game__death');
const playAgainButton = document.querySelector('#play-again');
const quit = document.querySelector('#quit');
const scores = document.querySelector('.scores');


socket.on('connect',()=>{
    socket.emit('join',{
        username,
        color
    })
    socket.on('joined',()=>{
        draw();
    })
    socket.on('update',(gameLogic)=>{
        players = gameLogic.players;
        pos = gameLogic.pos;
        rows = gameLogic.rows;
        cols = gameLogic.cols;
        fruits = gameLogic.fruits;

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
    socket.on('death',()=>{
        gameOverMenu.classList.add('show');
    });
})

playAgainButton.addEventListener('click',e=>{
    socket.emit('play-again');
    gameOverMenu.classList.remove('show');
})

quit.addEventListener('click',e=>{
    window.location.href = "/";
})

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