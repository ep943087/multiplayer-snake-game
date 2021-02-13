// including modules
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const socketio = require("socket.io");
const path = require("path");
const publicDir = path.join(__dirname,'public');

// set middleware
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// set middleware to initialize local variables
app.use('/',(req,res,next)=>{
    res.locals.error = "";
    res.locals.username = "";
    res.locals.color = "";
    next();
})

// if player enters url, then send to register page
app.get('/',(req,res)=>{
    res.render('register',{});
});

// if user submits form, then check if did proper credentials
// if proper credentials, then send to game, else back to register page.
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

// start server
const server = app.listen(port,()=>{
    console.log("Listening on port " + port);
});

// create game object and socket server
const io = socketio(server);

const Game = require('./classes/game');
const game = new Game();

const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

// when a player connects, add listeners
io.on('connection',(socket)=>{
    console.log('new connection!');

    // when a player joins add to players array
    socket.on('join',({username,color})=>{
        game.setHighScore();
        game.addUser(socket.id,username,color);
        console.log('Players: ' + game.players.length);
        game.addMessage(`${username} has joined`);
        socket.emit('joined');
    });

    // change direction of player when they hit want to go up,down,left, or right
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

    // change direction based on angle
    socket.on('change-angle',({angle})=>{
        game.changeAngle(socket.id,angle);
    })

    // remove player from player array then send message
    socket.on('disconnect',()=>{
        const name = game.removePlayer(socket.id);
        console.log('Players: ' + game.players.length);
        game.addMessage(`${name} left the game`);
    })
    socket.on('play-again',()=>{
        game.playAgain(socket.id);
    })
})

// game logic interval, perform logic, then send updates
// to players through web sockets
setInterval(()=>{
    game.update();
    const players = game.getPlayers();
    const {rows,cols,fruits,messages,highscore,highscore_name,poison} = game;
    game.players.forEach(player=>{
        const pos = game.getPos(player.id);
        const gameLogic = {
            players,
            pos,
            rows,
            cols,
            fruits,
            messages,
            highscore,
            highscore_name,
            poison,
        }
        io.to(player.id).emit('update',gameLogic);
        if(player.dead && !player.deathMessageSent){
            io.to(player.id).emit('death',{
                score: player.score_before_death,
                msg: player.deathMessage,
            });
            player.deathMessageSent = true;
        }
    })
}, 175);