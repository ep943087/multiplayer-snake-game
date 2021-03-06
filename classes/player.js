
// constants
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

// explosion class for when a player explodes, stores positions
// of each piece
class Explosion{
    // each explosion starts at a position
    constructor(i,j){
        this.vel = .3;
        this.i = i;
        this.j = j;
        this.dist = 0;
        // angle is random between 0 and 2*pi
        const angle = 2*Math.PI*Math.random();
        this.xVel = this.vel*Math.cos(angle);
        this.yVel = this.vel*Math.sin(angle);
    }
    // move based on the x and y velocity
    move(){
        this.i += this.yVel;
        this.j += this.xVel;
        this.dist++;
    }
}

// stores player information, such as socket id, username, position and color
class Player{
    constructor(id,i,j,username,color){
        this.id = id;
        this.username = username;
        this.color = color;
        this.score_before_death = 0;

        // initialize position
        this.reset(i,j);
    }
    
    // when player dies, then initalize explosion array
    // each part of the body will have pieces fly from that position
    startExplosion(){
        this.score_before_death = this.body.length;
        this.explosion = [];
        this.newHighScore = false;
        const count = 2;
        for(let i=0;i<count;i++){
            this.explosion.push(new Explosion(this.i,this.j));
        }
        this.body.forEach(body=>{
            for(let i=0;i<count;i++){
                this.explosion.push(new Explosion(body.i,body.j));
            }
        });

        // empty body
        this.body = [];
    }

    // move explosions for 5 intervals
    moveExplosions(){
        this.explosion.forEach(exp=>exp.move());
        if(this.explosion.length > 0 && this.explosion[0].dist > 5){
            this.explosion = [];
        }
    }

    // set all values to default
    reset(i,j){
        this.deathMessage = "";
        this.i = i;
        this.j = j;
        this.dir = UP;
        this.lastDir = this.dir;
        this.deathMessageSent = false;
        this.dead = false;
        this.playing = false;
        this.body = [];
        this.explosion = [];
    }

    // change direction, but can't go in opposite direction to crash into self
    canChangeDir(dir){
        if(!this.playing || this.body.length === 0)
            return true;
        return this.lastDir === RIGHT && dir !== LEFT ||
                this.lastDir === LEFT && dir !== RIGHT || 
                this.lastDir === UP && dir !== DOWN ||
                this.lastDir === DOWN && dir !== UP;
    }

    // move all of the body parts
    move(){
        if(this.dead) return;
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

        // move head based on direction player is going
        switch(this.dir){
            case UP: this.i--; break;
            case DOWN: this.i++; break;
            case RIGHT: this.j++; break;
            case LEFT: this.j--; break;
        }
        this.lastDir = this.dir;
    }

    // add block to array of blocks
    // if no blocks yet, add based on head
    // else add based on tail of the body
    addBlock(){
        if(this.body.length === 0){
            this.addBlockDir(this.i,this.j,this.dir);
        } else{
            const tail = this.body[this.body.length-1];
            const next = this.body.length > 1? this.body[this.body.length-2] : this;
            let i = next.i - tail.i;
            let j = next.j - tail.j;
            let dir;
            if(j < 0) dir = LEFT;
            else if(j > 0) dir = RIGHT;
            else if(i < 0) dir = UP;
            else if(i > 0) dir = DOWN;
            this.addBlockDir(tail.i,tail.j,dir);
        }
    }

    // add block based on the direction of the tail
    addBlockDir(i,j,dir){
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