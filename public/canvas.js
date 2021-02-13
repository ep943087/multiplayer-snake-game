// drawing logic

// initialize global variables
let players = null;
let pos = null;
let rows = null;
let cols = null;
let fruits = null;
let poison = null;
let messages = null;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

const container = document.querySelector('.game__container');
const c = document.querySelector('.game__canvas');
const ctx = c.getContext('2d');

const style = getComputedStyle(document.body);

const backgroundColor = style.getPropertyValue('--darkest');

let pw = 5;

/******************************
 * REMINDER!!!!
 * Draw Everything a square!
 *****************************/


// draw player, if not dead, draw each body part, else draw exploding
// pieces
const drawPlayer = (player) => {

    if(!player.playing && pos.playing) return;

    ctx.fillStyle = player.color;

    if(player.dead){
        player.explosion.forEach(exp=>{
            ctx.globalAlpha = (5-exp.dist) / 5;
            // ctx.beginPath();
            // ctx.arc(exp.j*pw+pw/2,exp.i*pw+pw/2,3,0,2*Math.PI);
            // ctx.fill();
            const dif = pw*.40;
            ctx.fillRect(exp.j*pw+dif/2,exp.i*pw+dif/2,pw-dif,pw-dif);
        });
        ctx.globalAlpha = 1;
        return;
    }

    player.body.forEach(body=>drawBody(body,player.color));
    ctx.fillStyle = player.color;
    const dif = 0;
    ctx.fillRect(player.j*pw+dif/2,player.i*pw+dif/2,pw-dif,pw-dif);
    drawEyes(player);

    // draw username
    ctx.font = "15px Monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    const y = player.dir === DOWN? 1.5*pw : -pw;
    ctx.fillText(player.username,player.j*pw+pw/2,player.i*pw+pw/2+y);
}

// draw each square of user
const drawBody = (body,color) => {
    ctx.fillStyle = color;
    const dif = 0;
    ctx.fillRect(body.j*pw+dif/2,body.i*pw+dif/2,pw-dif,pw-dif);
}

// draw each fruit 
const drawFruit = (fruit) => {
    ctx.fillStyle = "rgb(0,255,0)";
    const dif = 10;
    ctx.fillRect(fruit.j*pw+dif/2,fruit.i*pw+dif/2,pw-dif,pw-dif);
}

// draw each poison
const drawPoison = (poison) => {
    //ctx.fillStyle = style.getPropertyValue('--darkest');
    ctx.fillStyle = "red";
    const dif = 10;
    const pw3 = pw*poison.size;
    ctx.fillRect(poison.j*pw+dif/2,poison.i*pw+dif/2,pw3-dif,pw3-dif);
}

// draw eyes of player on their head
const drawEyes = player => {
    ctx.fillStyle = "white";
    let ex1,ex2,ey1,ey2;
    switch(player.dir){
        case UP:
            ex1 = pw*.25;
            ey1 = pw*.25;
            ex2 = pw*.75;
            ey2 = pw*.25;
            break;
        case RIGHT:
            ex1 = pw*.75;
            ey1 = pw*.25;
            ex2 = pw*.75;
            ey2 = pw*.75;
            break;
        case LEFT:
            ex1 = pw*.25;
            ey1 = pw*.25;
            ex2 = pw*.25;
            ey2 = pw*.75;
            break;
        case DOWN:
            ex1 = pw*.25;
            ey1 = pw*.75;
            ex2 = pw*.75;
            ey2 = pw*.75;
            break;
    }
    ctx.fillStyle = "white";
    ctx.beginPath();
    const [x,y] = [player.j*pw,player.i*pw];
    ctx.arc(x+ex1,y+ey1,pw*.1,0,2*Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x+ex2,y+ey2,pw*.1,0,2*Math.PI);
    ctx.fill();
}

// draw line grid of game
const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.globalAlpha = .25;
    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            const x = pw*j;
            const y = pw*i;
            ctx.strokeStyle = style.getPropertyValue('--lighest');
            ctx.strokeRect(x,y,pw,pw);
        }
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = style.getPropertyValue('--darker');
    ctx.strokeRect(0,0,pw*rows,pw*cols);
}

// draw messages by server on the lower left of the screen
const drawMessages = ()=>{
    if(messages === null) return;
    msg = messages.slice().reverse();
    ctx.fillStyle = style.getPropertyValue('--dark');
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "17px Monospace";
    const [x,y] =[15, c.height - 25*5];
    for(let i=0;i<msg.length;i++){
        ctx.globalAlpha = (5-i)/5;
        ctx.fillText(msg[i],x,y+25*i);
    }
    ctx.globalAlpha = 1;
}

// call draw functions in an interval
const draw = () => {

    requestAnimationFrame(draw);

    if(players === null) return;
    c.width = container.offsetWidth;
    c.height = container.offsetHeight;

    ctx.fillStyle = backgroundColor;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillRect(0,0,c.width,c.height);
    
    // calculate width/height of the cells on grid
    if(c.width < c.height)
        pw = c.width * 3 / cols;
    else   
        pw = c.height * 3 / rows;


    //pos.i = Math.floor(pos.i/rows*5)*(rows/5) + 10;
    //pos.j = Math.floor(pos.j/cols*5)*(cols/5) + 10;

    const {i,j} = pos;

    const x = j*pw;
    const y = i*pw;

    pos.x = c.width/2 - x - pw/2;
    pos.y = c.height/2 - y - pw/2;

    ctx.save();
    ctx.translate(pos.x,pos.y);

    drawGrid();

    fruits.forEach((fruit)=>drawFruit(fruit));
    poison.forEach((p)=>drawPoison(p));
    players.forEach((player)=>drawPlayer(player));

    ctx.restore();

    // if not playing, then show this message
    if(!pos.playing){
        ctx.fillStyle = style.getPropertyValue('--dark');
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "20px Monospace";
        ctx.fillText('Press arrow keys or A,W,D,S to start',c.width/2,c.height*.2);
    }

    drawMessages();

    // logic for someone playing on their phone, draws line between
    // finger and original position
    if(oM !== undefined && m !== undefined){
        const angle = Math.atan2(m.y-oM.y,m.x-oM.x);
        const len = 75;
        const dx = .75*len*Math.cos(angle);
        const dy = .75*len*Math.sin(angle);
        
        ctx.beginPath();
        ctx.strokeStyle = style.getPropertyValue('--dark');
        ctx.lineWidth = 5;
        ctx.moveTo(oM.x,oM.y);
        ctx.lineTo(oM.x + dx,oM.y + dy);
        ctx.stroke();

        for(let a=Math.PI/4;a < 9*Math.PI/4;a += Math.PI/2){
            const dx = .5*len*Math.cos(a);
            const dy = .5*len*Math.sin(a);
            
            ctx.beginPath();
            ctx.globalAlpha = .3;
            ctx.lineWidth = 5;
            ctx.moveTo(oM.x,oM.y);
            ctx.lineTo(oM.x + dx,oM.y + dy);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.lineWidth = 1;
    }

    // draw score

    ctx.fillStyle = "white";
    ctx.font = "17px Monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Your Score: " + pos.score,10,10);
}