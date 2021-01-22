
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

class Player{
    constructor(id,i,j,username,color){
        this.id = id;
        this.i = i;
        this.j = j;
        this.username = username;
        this.color = color;
        this.dir = UP;
        this.dead = false;
        this.playing = false;
        this.body = [];
    }
    reset(i,j){
        this.i = i;
        this.j = j;
        this.dir = UP;
    }
    move(){
        for(let i=this.body.length-1;i>=0;i--){
            const body = this.body[i];
            if(i === 0){
                body.i = this.i;
                body.j = this.j;
            } else{
                const next = this.body[i-1];
                body.i = next.i;
                body.j = next.j;
            }
        }
        switch(this.dir){
            case UP: this.i--; break;
            case DOWN: this.i++; break;
            case RIGHT: this.j++; break;
            case LEFT: this.j--; break;
        }
    }

    addBlock(){
        if(this.body.length === 0){
            this.addBlockDir(this.dir);
        } else{
            const tail = this.body[this.body.length-1];
            this.addBlockDir(tail.dir);
        }
    }
    addBlockDir(dir){
        let {i,j} = this;
        switch(dir){
            case UP:
                i++;
                break;
            case DOWN:
                i--;
                break;
            case LEFT:
                j++
                break;
            case RIGHT:
                j--;
                break;
        }
        this.body.push({i,j});
    }
}

module.exports = Player;