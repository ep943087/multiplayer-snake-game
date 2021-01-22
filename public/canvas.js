let players = null;
let pos = null;
let rows = null;
let cols = null;
let fruits = null;

const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

const container = document.querySelector('.game__container');
const c = document.querySelector('.game__canvas');
const ctx = c.getContext('2d');

const backgroundColor = "#f1f1f1";

let pw = 5;

const drawPlayer = (player) => {
    ctx.fillStyle = player.color;
    const dif = 4;
    ctx.fillRect(player.j*pw+dif/2,player.i*pw+dif/2,pw-dif,pw-dif);
    drawEyes(player);
    player.body.forEach(body=>drawBody(body,player.color));
}

const drawBody = (body,color) => {
    ctx.fillStyle = color;
    const dif = 4;
    ctx.fillRect(body.j*pw+dif/2,body.i*pw+dif/2,pw-dif,pw-dif);
}

const drawFruit = (fruit) => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(fruit.j*pw+pw/2,fruit.i*pw+pw/2,pw/2,0,2*Math.PI);
    ctx.fill();
}

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

const drawGrid = () => {
    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            const x = pw*j;
            const y = pw*i;
            ctx.strokeStyle = "rgba(0,0,0,.1)";
            ctx.strokeRect(x,y,pw,pw);
        }
    }
}

const draw = () => {
    requestAnimationFrame(draw);
    c.width = container.offsetWidth;
    c.height = container.offsetHeight;

    ctx.fillStyle = backgroundColor;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillRect(0,0,c.width,c.height);

    pw = c.width * 5 / cols;

    if(players === null) return;


    pos.i = Math.floor(pos.i/rows*5)*(rows/5) + 10-2;
    pos.j = Math.floor(pos.j/cols*5)*(cols/5) + 10-2;

    const {i,j} = pos;

    const x = j*pw;
    const y = i*pw;

    pos.x = c.width/2 - x - pw/2;
    pos.y = c.height/2 - y - pw/2;

    ctx.save();
    ctx.translate(pos.x,pos.y);

    drawGrid();

    fruits.forEach((fruit)=>drawFruit(fruit));

    players.forEach((player)=>drawPlayer(player));

    ctx.restore();
}