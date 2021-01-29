const Player = require("./player");

const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

class Game{
    constructor(){
        this.rows = 100;
        this.cols = 100;
        this.players = [];
        this.fruitCount = 250;
        this.messages = [];
        this.allTimeHighest = {
            score: 0,
            username: "No one",
        }
        this.setFruits();
    }
    addMessage(msg){
        this.messages.push(msg);
        if(this.messages.length > 5){
            this.messages.shift();
        }
    }

    setFruits(){
        this.fruits = [];
        for(let i=0;i<this.fruitCount;i++){
            this.addFruit();
        }
    }

    moveFruit(fruit){
        const {i,j} = this.getIJ();
        fruit.i = i;
        fruit.j = j;
    }

    addFruit(){
        const {i,j} = this.getIJ();
        this.fruits.push({
            i,j
        });
    }

    getIJ(){
        const i = Math.floor(this.rows*Math.random());
        const j = Math.floor(this.cols*Math.random());
        return {i,j};
    }

    addUser(id,username,color){
        const {i,j} = this.getIJ();
        const player = new Player(id,i,j,username,color);
        this.players.push(player);
    }
    playAgain(id){
        const player = this.players.find(player=>player.id === id);
        if(player === null) return;

        const i = Math.floor(this.rows*Math.random());
        const j = Math.floor(this.cols*Math.random());
        player.reset(i,j);
    }
    getPos(id){
        for(let i=0;i<this.players.length;i++){
            if(this.players[i].id === id){
                const player = this.players[i];
                return {
                    i: player.i,
                    j: player.j,
                    playing: player.playing,
                }
            }
        }
        return null;
    }

    getPlayers(){
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

        return players.sort((a,b)=>{
            return b.body.length - a.body.length;
        });
        
    }
    findPlayer(id){
        return this.players.find(player=>{
            return id === player.id;
        });
    }
    changeDir(id,dir){
        const player = this.findPlayer(id);
        if(!player.dead)
            player.dir = dir;
        if(!player.playing){
            player.playing = true;
        }
    }

    changeAngle(id,angle){
        const player = this.findPlayer(id);
        player.playing = true;
        if(angle>=-3*Math.PI/4&&angle<=-Math.PI/4){
            player.dir = UP;
        //pm = "up";
        } else if(angle>=Math.PI/4&&angle<=3*Math.PI/4){
            player.dir = DOWN;
        //pm = "down";
        } else if(angle>=-Math.PI/4&&angle<=Math.PI/4){
            player.dir = RIGHT;
        //pm = "right";
        } else if((angle>=3*Math.PI/4&&angle<=Math.PI)||(angle<=-3*Math.PI/4&&angle>=-Math.PI)){
            player.dir = LEFT;
        //pm = "left";
        }
    }

    update(){
        this.players.forEach(player=>{
            if(player.dead) player.moveExplosions();
            if(!player.playing || player.dead) return;
            player.move();
            this.collision(player);
        })
    }

    collision(player){
        const collide = this.fruits.find(fruit=>{
            return fruit.i === player.i && fruit.j === player.j;
        });
        if(collide){
            this.moveFruit(collide);
            player.addBlock();
        }
        const death = this.players.some(other=>{
            if(other.dead || !other.playing) return;
            if(player !== other){
                if(player.i === other.i && player.j === other.j){
                    player.deathMessage = `${player.username} killed by ${other.username}`;
                    return true;
                }
            }
            const body = other.body;
            return body.some(block=>{
                const death = player.i === block.i && player.j === block.j;
                if(death){
                    if(player === other){
                        player.deathMessage = `${player.username} killed themself, LOL`;
                    } else{
                        player.deathMessage = `${player.username} killed by ${other.username}`;
                    }
                }
                return death;
            });
        })
        if(death){
            player.dead = true;
        } else{
            if(player.i < 0 || player.i === this.rows || player.j < 0 || player.j === this.cols){
                player.dead = true;
                player.deathMessage = `${player.username} went out of bounds, LOL`;
            }
        }
        if(player.dead){
            this.addMessage(player.deathMessage);
            player.startExplosion();
        }
    }

    removePlayer(id){
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