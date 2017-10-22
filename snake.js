const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

class Timer{
    constructor(time, callback){
        this.callback = callback;

        let accumulatedTime = 0;
        let lastTime = 0;

        function start(passTime){
            let deltaTime = (passTime - lastTime) / 1000;
            accumulatedTime-=deltaTime;
            if(accumulatedTime<0){
                this.callback(deltaTime);
                accumulatedTime = time - deltaTime;
            }
            lastTime = passTime;
            requestAnimationFrame(start.bind(this));
        }

        requestAnimationFrame(start.bind(this));
    }
}

class Vec{
    constructor(x=0, y=0){
        this.x = x;
        this.y = y;
    }

    add(vec){
        this.x += vec.x;
        this.y += vec.y;
    }
}

class Square{
    constructor(size){
        this.pos = new Vec;
        this.size = size;
    }
}

class Matrix{
    constructor(){
        this.grid = [];
    }

    set(x, y, element){
        if(!this.grid[x])
            this.grid[x] = []
        this.grid[x][y] = element;
    }

    forEach(callback){
        this.grid.forEach((column, x)=>{
            column.forEach((element, y)=>{
                callback(this.grid[x][y], x, y)
            })
        })
    }

    fill(xMax, yMax, value){
        for (let x = 0; x < xMax; x++)
            for (let y = 0; y < yMax; y++)
                this.set(x, y, value);
    }
}

class SnakeCollider{
    constructor(snake, maxPos){
        this.snake = snake;
        this.maxPos = maxPos;
    }

    foodCaptured(food){
        if(food.pos.x == this.snake.pos.x){
            if(food.pos.y == this.snake.pos.y){
                this.snake.swallow(food);
                return true;
            }
        }
        return false;
    }

    crash(){
        return this.snake.body.reduce((previous, body, index)=>{
            return (index != 0) && (previous || this._positionUnderSnake(this.snake.pos, body))
        }, false)
    }

    crashIntoBorder(){
        return this.snake.pos.x >= this.maxPos.x
                || this.snake.pos.y >= this.maxPos.y
                || this.snake.pos.y < 0
                || this.snake.pos.x < 0
    }

    underBody(pos){
        return this.snake.body.reduce((previous, body) =>
            previous || this._positionUnderSnake(pos, body)
            , false)
    }

    _positionUnderSnake(pos, body) {
        return (pos.x == body.pos.x
            && pos.y == body.pos.y);
    }
}

class Snake {
    constructor(x=0, y=0){
        this.body = [new Body(new Vec(x,y), new Vec)];
        this._stomach = [];
    }

    set vel(vel){
        this.body[0].vel = vel;
    }

    get vel(){
        return this.body[0].vel;
    }

    get pos(){
        return this.body[0].pos;
    }

    update(deltaTime){
        this.body.forEach(bodyPart => {
            bodyPart.update(deltaTime);
        })

        this._digest();

        for(let i = this.body.length-1; i>0; i--) {
            this.body[i].vel  = new Vec(this.body[i-1].vel.x,this.body[i-1].vel.y);
        }
    }

    swallow(food) {
        this._stomach.push(food);
    }


    _digest(){
        if(this._stomach.length != 0)
            if(!this._underPartBody(this._stomach[0].pos))
                this.body.push(this._stomach.shift());

    }

    _underPartBody(pos) {
        return this.body.reduce((previous, body) =>
            previous || (pos.x == body.pos.x
                        && pos.y == body.pos.y)
        , false);
    }

    stop() {
        this.body.forEach(body => {
            body.vel = new Vec();
        })
    }
}

class Body{
    constructor(pos=new Vec, vel=new Vec){
        this.pos = pos;
        this.vel = vel;
    }

    update(deltaTime){
        this.pos.add(this.vel);
    }

}


function getRandomPosition(xMax, yMax) {
    return new Vec(Math.floor(Math.random() * xMax),Math.floor(Math.random() * yMax))
}

class World{
    constructor(xMax, yMax){
        this.xMax = xMax;
        this.yMax = yMax;
        this.snake = new Snake(this.xMax/2, this.yMax/2);
        this.matrix = new Matrix();
        this.collider = new SnakeCollider(this.snake, new Vec(xMax, yMax));
        this.food = this._createFood();
    }

    _createFood(){
        let food = new Body();
        do{
            food.pos = getRandomPosition(this.xMax, this.yMax);
        }while(this.snake.pos.x == food.pos.x || this.snake.pos.y == food.pos.y);
        return food;
    }

    start(){
        this.food = this._createFood();
        this.snake = new Snake(this.xMax/2, this.yMax/2);
        this.collider = new SnakeCollider(this.snake, new Vec(xMax, yMax));
    }

    get gameOver(){
        return this.collider.crash() || this.collider.crashIntoBorder();
    }

    update(deltaTime){
        if(!this.gameOver){
            this.matrix.fill(this.xMax, this.yMax, "#fff3d3");

            this.snake.body.forEach(body=>{
                this.matrix.set(body.pos.x, body.pos.y, "#000");
            })

            this.matrix.set(this.food.pos.x, this.food.pos.y, "#000")

            this.snake.update(deltaTime);

            if(this.collider.foodCaptured(this.food)){
                this.food = this._createFood(this.food);
            }
        }
    }

    draw(){
        this.matrix.forEach((element, x, y) => {
            context.fillStyle = element;
            context.fillRect(x * 20, y * 20, 20, 20);
        })
    }
}

function keyboardSetup(game) {

    const actions = new Map();
    actions.set("ArrowDown", ()  => {
        if(!game.gameOver)
            game.snake.vel =new Vec(0, game.snake.vel.y || 1);
    });
    actions.set("ArrowUp", () => {
        if(!game.gameOver)
            game.snake.vel = new Vec(0, game.snake.vel.y||-1);
    });
    actions.set("ArrowRight", () => {
        if(!game.gameOver)
            game.snake.vel = new Vec(game.snake.vel.x || 1, 0);
    });
    actions.set("ArrowLeft", () => {
        if(!game.gameOver)
            game.snake.vel = new Vec(game.snake.vel.x || -1, 0);
    });

    actions.set("Space", ()=>{
        if(game.gameOver)
            game.start();
    })

    return event=> {
        if(actions.has(event.code))
            actions.get(event.code)();
    }
}


const yMax = canvas.height / 20;
const xMax = canvas.width / 20;
const world = new World(xMax, yMax);
document.addEventListener('keydown', keyboardSetup(world))
let score = document.getElementById("score");
let gameoverScreen = document.getElementById("gameover-screen");


new Timer(0.1, (deltaTime) => {
    if(world.gameOver) gameoverScreen.style['visibility'] = 'visible'
    else gameoverScreen.style['visibility'] = 'hidden'

    score.textContent = ((world.snake.body.length-1) * 5);

    world.update(deltaTime);
    world.draw();
});