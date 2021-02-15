const Player = require("./player");
const fs = require('fs');

// constants
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

class Game{
    constructor(){
        // how many rows and columns in grid
        this.rows = 65;
        this.cols = 65;
        this.players = [];

        // number of fruits in game
        this.fruitCount = 80;
        this.poisonCount = 11;
        this.poisonSize = 3;

        this.messages = [];
        
        this.allTimeHighest = {
            score: 0,
            username: "No one",
        }
        this.setFruits();
        this.setPoison();
        this.setHighScore();
    }
    setHighScore(){
        // open file and set high score
        try{
            const data = fs.readFileSync('./score/highscore.json','utf8');
            const {highscore,highscore_name} = JSON.parse(data);
            this.highscore = highscore;
            this.highscore_name = highscore_name;
        } catch(e){

        }

    }
    updateHighScore(score,name){
        // this file updates file with new high score.
        try{
            this.highscore = score;
            this.highscore_name = name;
            const data = fs.readFileSync('./score/highscore.json','utf8');
            const obj = JSON.parse(data);
            obj.highscore = score;
            obj.highscore_name = name;
            const strObj = JSON.stringify(obj);
            fs.writeFileSync('./score/highscore.json',strObj);
        } catch(e){

        }
    }
    addMessage(msg){
        // pushes a new message in array of messages
        this.messages.push(msg);
        if(this.messages.length > 5){
            this.messages.shift();
        }
    }

    setFruits(){
        // add fruits to fruit array based on fruit count
        this.fruits = [];
        for(let i=0;i<this.fruitCount;i++){
            this.addFruit();
        }
    }

    setPoison(){
        // add poison to poison array based on poison count
        this.poison = [];
        let row = 5;
        for(let i=0;i<this.poisonCount;i++){
            row += 5;
            this.addPoison(row,row);
        }
    }

    moveFruit(fruit){
        // move fruit to new position on grid
        const {i,j} = this.getIJ();
        fruit.i = i;
        fruit.j = j;
    }

    addFruit(){
        // add fruit to array of fruits
        const {i,j} = this.getIJ();
        this.fruits.push({i,j});
    }

    addPoison(i,j){
        // add poison to array of poison
        const direction = 1+Math.floor(Math.random()*4);
        this.poison.push({i,j,size:this.poisonSize,direction});
    }

    getIJ(){
        // initialize row and column to random values in grid
        const i = Math.floor(this.rows*Math.random());
        const j = Math.floor(this.cols*Math.random());
        return {i,j};
    }

    addUser(id,username,color){
        // add user to array of players
        const {i,j} = this.getIJ();
        const player = new Player(id,i,j,username,color);
        this.players.push(player);
    }
    playAgain(id){
        // reset player information so they can play again
        const player = this.players.find(player=>player.id === id);
        if(player === null) return;

        const i = Math.floor(this.rows*Math.random());
        const j = Math.floor(this.cols*Math.random());
        player.reset(i,j);
    }
    getPos(id){
        // get position of user with same socket id
        for(let i=0;i<this.players.length;i++){
            if(this.players[i].id === id){
                const player = this.players[i];
                return {
                    i: player.i,
                    j: player.j,
                    playing: player.playing,
                    dir: player.dir,
                    score: player.body.length
                }
            }
        }
        return null;
    }

    getPlayers(){
        // returns array of players without socket ids for protection
        const players = this.players.map(player=>{
            const {i,j,color,username,dir,body,dead,playing,explosion} = player;
            return {
                i,
                j,
                color,
                username,
                dir,
                body,
                dead,
                explosion,
                playing,
            }
        });
        // sort by who has highest score
        return players.sort((a,b)=>{
            return b.body.length - a.body.length;
        });
        
    }
    findPlayer(id){
        // find player with same socket id
        return this.players.find(player=>{
            return id === player.id;
        });
    }
    changeDir(id,dir){
        // find player, then change directions
        const player = this.findPlayer(id);
        if(!player.dead){
            if(player.canChangeDir(dir))
                player.dir = dir;
        }
        if(!player.playing){
            player.playing = true;
        }
    }

    changeAngle(id,angle){
        // find player, then change direction based on angle
        const player = this.findPlayer(id);
        player.playing = true;
        if(angle>=-3*Math.PI/4&&angle<=-Math.PI/4 && player.canChangeDir(UP)){
            player.dir = UP;
        } else if(angle>=Math.PI/4&&angle<=3*Math.PI/4 && player.canChangeDir(DOWN)){
            player.dir = DOWN;
        } else if(angle>=-Math.PI/4&&angle<=Math.PI/4 && player.canChangeDir(RIGHT)){
            player.dir = RIGHT;
        } else if(((angle>=3*Math.PI/4&&angle<=Math.PI)||(angle<=-3*Math.PI/4&&angle>=-Math.PI))&&player.canChangeDir(LEFT)){
            player.dir = LEFT;
        }
    }

    update(){


        // this function updates game logic, move players and explosions, also collision logic
        this.players.forEach(player=>{
            if(player.dead) player.moveExplosions();
            if(!player.playing || player.dead) return;
            player.move();
        })
        this.poison.forEach(poison=>{
            switch(poison.direction){
                case UP:
                    poison.i--;
                    if(poison.i <= 0){
                        poison.i = 0;
                        poison.direction = DOWN;
                    }
                    break;
                case DOWN:
                    poison.i++;
                    if(poison.i >= this.rows-1){
                        poison.i = this.rows-1;
                        poison.direction = UP;
                    }
                    break;
                case LEFT:
                    poison.j--;
                    if(poison.j <= 0){
                        poison.j = 0;
                        poison.direction = RIGHT;
                    }
                    break;
                case RIGHT:
                    poison.j++;
                    if(poison.j >= this.cols-1){
                        poison.j = this.cols-1;
                        poison.direction = LEFT;
                    }
                    break;
            }
        })

        this.players.forEach(player=>{
            this.collision(player);
        })
    }

    isNewHighScore(player){
        if(player.body.length > this.highscore){
            this.updateHighScore(player.body.length, player.username);
            if(!player.newHighScore){
                const message = `NEW HIGHSCORE by ${player.username}!`;
                this.messages.push(message);
            }
            player.newHighScore = true;
        }
    }

    collision(player){
        if(player.dead) return;
        // check collision logic

        // check if poisoned
        const poisoned = this.poison.find(p=>{
            return player.i >= p.i && player.i < p.i+p.size && player.j >= p.j && player.j < p.j+p.size;
        });

        // if dead, then send check if they beat high score, then send message
        if(poisoned){
            player.dead = true;
            this.addMessage(`${player.username} ate poison and died`);
            if(player.newHighScore){
                player.deathMessage = "NEW HIGH SCORE!";
            } else{
                player.deathMessage = "";
            }

            // start explosion process and reset body
            return player.startExplosion();
        }
        // if ate a fruit, then move fruit and add to body
        const collide = this.fruits.find(fruit=>{
            return fruit.i === player.i && fruit.j === player.j;
        });
        if(collide){
            this.moveFruit(collide);
            player.addBlock();
            // check if new high score
            this.isNewHighScore(player);
        }

        // check if player died by crashing out of bounds, into another player, or themself 
        const death = this.players.some(other=>{
            if(other.dead || !other.playing) return;
            if(player !== other){
                if(player.i === other.i && player.j === other.j){
                    player.deathMessage = `${player.username} killed by ${other.username}`;
                    for(let i=0;i<player.body.length;i++){
                        other.addBlock();
                    }
                    this.isNewHighScore(other);
                    return true;
                }
            }

            // check if player crashed into itself or another player
            const body = other.body;
            return body.some(block=>{
                const death = player.i === block.i && player.j === block.j;
                if(death){
                    if(player === other){
                        player.deathMessage = `${player.username} killed thyself`;
                    } else{
                        for(let i=0;i<player.body.length;i++){
                            other.addBlock();
                        }
                        player.deathMessage = `${player.username} killed by ${other.username}`;
                    }
                }
                return death;
            });
        })
        // if dead update, else check if out of bounds
        if(death){
            player.dead = true;
        } else{
            if(player.i < 0 || player.i === this.rows || player.j < 0 || player.j === this.cols){
                player.dead = true;
                player.deathMessage = `${player.username} went out of bounds`;
            }
        }
        // if dead, then send check if they beat high score, then send message
        if(player.dead){
            this.addMessage(player.deathMessage);
            if(player.newHighScore){
                player.deathMessage = "NEW HIGH SCORE!";
            } else{
                player.deathMessage = "";
            }

            // start explosion process and reset body
            player.startExplosion();
        }
    }

    removePlayer(id){
        // remove player with socket id from player array
        let name = "";
        this.players = this.players.filter(player=>{
            const notPlayer = player.id !== id;
            if(!notPlayer) name = player.username;
            return notPlayer;
        });
        return name;
    }
}

module.exports = Game;