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
        this.setFruits();
    }

    setFruits(){
        this.fruits = [];
        for(let i=0;i<50;i++){
            this.addFruit();
        }
    }

    moveFruit(fruit){
        fruit.i = Math.floor(this.rows*Math.random());
        fruit.j = Math.floor(this.cols*Math.random());
    }

    addFruit(){
        const i = Math.floor(this.rows*Math.random());
        const j = Math.floor(this.cols*Math.random());
        this.fruits.push({
            i,j
        });
    }
    addUser(id,username,color){
        const i = Math.floor(this.rows*Math.random());
        const j = Math.floor(this.cols*Math.random());
        const player = new Player(id,i,j,username,color);
        this.players.push(player);
    }
    getPos(id){
        for(let i=0;i<this.players.length;i++){
            if(this.players[i].id === id){
                const player = this.players[i];
                return {
                    i: player.i,
                    j: player.j,
                }
            }
        }
        return null;
    }

    getPlayers(){
        return this.players.map(player=>{
            const {i,j,color,username,dir,body} = player;
            return {
                i,
                j,
                color,
                username,
                dir,
                body,
            }
        });
    }
    changeDir(id,dir){
        const player = this.players.find(player=>{
            return id === player.id;
        });
        if(!player.dead)
            player.dir = dir;
    }

    update(){
        this.players.forEach(player=>{
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
            if(player !== other){
                if(player.i === other.i && player.j === other.j)
                    return true;
            }
            const body = other.body;
            return body.some(block=>{
                return player.i === block.i && player.j === block.j;
            });
        })
        if(death){
            console.log('death');
        } else{
            if(player.i < 0 || player.i === this.rows || player.j < 0 || player.j === this.cols){
                console.log('death');
            }
        }
    }

    removePlayer(id){
        this.players = this.players.filter(player=>{
            return player.id !== id;
        });
    }
}

module.exports = Game;