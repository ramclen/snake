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

class Snake {
    constructor(x, y){
        this.pos = new Vec(x, y);
        this.vel = new Vec;
    }

    update(deltaTime){
        this.pos.add(this.vel);
    }
}

class Food{
    constructor(){
        this.pos = new Vec();
        this.isEaten = false;
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
        this.food = new Food();
        this._setFoodLocation(this.food);
    }

    _setFoodLocation(food){
        do{
            food.pos = getRandomPosition(this.xMax, this.yMax);
        }while(this.snake.pos.x == food.pos.x || this.snake.pos.y == food.pos.y);
    }

    update(deltaTime){
        this.matrix.fill(this.xMax, this.yMax, "#fff3d3");
        this.matrix.set(this.snake.pos.x, this.snake.pos.y, "#000");

        if(this.food.isEaten){
            this._setFoodLocation(this.food);
        }

        this.matrix.set(this.food.pos.x, this.food.pos.y, "#000")
        this.snake.update(deltaTime);
    }

    draw(){
        this.matrix.forEach((element, x, y) => {
            context.fillStyle = element;
            context.fillRect(x * 20, y * 20, 20, 20);
        })
    }
}

function keyboardSetup(entity) {

    const actions = new Map();
    actions.set("ArrowDown", ()  => {
        entity.vel.y = entity.vel.y || 1;
        entity.vel.x = 0;
    });
    actions.set("ArrowUp", () => {
        entity.vel.y = entity.vel.y||-1
        entity.vel.x = 0;
    });
    actions.set("ArrowRight", () => {
        entity.vel.x = entity.vel.x || 1;
        entity.vel.y = 0;
    });
    actions.set("ArrowLeft", () => {
        entity.vel.x = entity.vel.x || -1;
        entity.vel.y = 0;
    });

    return event=> {
        if(actions.has(event.key))
            actions.get(event.key)();
    }
}


const yMax = canvas.height / 20;
const xMax = canvas.width / 20;
const world = new World(xMax, yMax);
document.addEventListener('keydown', keyboardSetup(world.snake))



new Timer(0.1, (deltaTime) => {
    world.update(deltaTime);
    world.draw();
});
