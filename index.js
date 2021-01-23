const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const socketio = require("socket.io");
const path = require("path");
const publicDir = path.join(__dirname,'public');

app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use('/',(req,res,next)=>{
    res.locals.error = "";
    res.locals.username = "";
    res.locals.color = "";
    next();
})

app.get('/',(req,res)=>{
    res.render('register',{});
});

app.post('/',(req,res)=>{
    const {username,color} = req.body;
    if(username && color){
        res.render('game.ejs',{
            username,
            color
        });
    } else{
        res.render('register',{
            error: "Username and color is required"
        });
    }
})

const server = app.listen(port,()=>{
    console.log("Listening on port " + port);
});

const io = socketio(server);

const Game = require('./classes/game');
const game = new Game();

const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

io.on('connection',(socket)=>{
    console.log('new connection!');

    socket.on('join',({username,color})=>{
        game.addUser(socket.id,username,color);
        console.log('Players: ' + game.players.length);

        socket.emit('joined');
    });

    socket.on('up',()=>{
        game.changeDir(socket.id,UP);
    })
    socket.on('down',()=>{
        game.changeDir(socket.id,DOWN);
    })
    socket.on('left',()=>{
        game.changeDir(socket.id,LEFT);
    })
    socket.on('right',()=>{
        game.changeDir(socket.id,RIGHT);
    })

    socket.on('change-angle',({angle})=>{
        game.changeAngle(socket.id,angle);
    })
    socket.on('disconnect',()=>{
        game.removePlayer(socket.id);
        console.log('Players: ' + game.players.length);
    })
    socket.on('play-again',()=>{
        game.playAgain(socket.id);
    })
})

setInterval(()=>{
    game.update();
    const players = game.getPlayers();
    const {rows,cols,fruits} = game;
    game.players.forEach(player=>{
        const pos = game.getPos(player.id);
        const gameLogic = {
            players,
            pos,
            rows,
            cols,
            fruits,
        }
        io.to(player.id).emit('update',gameLogic);
        if(player.dead && !player.deathMessageSent){
            io.to(player.id).emit('death');
            player.deathMessageSent = true;
        }
    })
}, 125);