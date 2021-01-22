
const socket = io();

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
    })
})

document.addEventListener('keydown',(e)=>{
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