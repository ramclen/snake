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

const yMax = canvas.height / 20;
const xMax = canvas.width / 20;
const matrix = new Matrix();
const snake = new Snake(xMax/2, yMax/2);
snake.vel.y = 1;

function update(deltaTime) {
    matrix.fill(xMax, yMax, "#fff3d3");
    matrix.set(snake.pos.x, snake.pos.y, "#000");

    snake.update(deltaTime);

    matrix.forEach((element, x, y) => {
        context.fillStyle = element;
        context.fillRect(x * 20, y * 20, 20, 20);
    })
};



new Timer(1, update);