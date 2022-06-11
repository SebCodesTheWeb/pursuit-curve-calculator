/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef} from 'react'
import ImprovedSetInterval from "./AccurateTimer"

function Coordinates() {
  const SQUARE_WIDTH: number = 1; //Distance between dogs
  const N: number = 100000;
  const VELOCITY: number = 1;

  const STEP_SIZE = SQUARE_WIDTH / N;
  const TIME_PER_STEP = (SQUARE_WIDTH/N) / VELOCITY;
  
  const showArrows: boolean = true;
  const tracePath: boolean = false;
  
  const CANVAS_WIDTH = 1000;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const RESCALE_FACTOR = CANVAS_WIDTH / SQUARE_WIDTH; //Scaling up to canvas coordinates
  const FPS = 60;
  
  let x1: number = 0;
  let x2: number = 0;
  let x3: number = SQUARE_WIDTH;
  let x4: number = SQUARE_WIDTH;
    
  let y1: number = SQUARE_WIDTH;
  let y4: number = SQUARE_WIDTH;
  let y2:number = 0;
  let y3: number = 0;

  //Note -- pn stands for point n, containing coordinates for point n, (ex p1 => point 1) this shorthand is used throughout the code
  let p1 = [x1, y1];
  let p2 = [x2, y2];
  let p3 = [x3, y3];
  let p4 = [x4, y4];


  let [dx1, dx2, dx3, dx4, dy1, dy2, dy3,, dy4,]:  number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  let dp1: number[] = [dx1, dy1];
  let dp2: number[] = [dx2, dy2];
  let dp3: number[] = [dx3, dy3];
  let dp4: number[] = [dx4, dy4];

  //Keeps track of the complete path of all points to then replay how many times one wants
  let trackPositions: any = [];
  let length: number = 0;
  
  const updatePosition = () => {
    trackPositions.push([[...p1], [...p2], [...p3], [...p4]]);

    //Getting in which direction to move
    dp1 = getVelocity(p1, p2);  
    dp2 = getVelocity(p2, p3);  
    dp3 = getVelocity(p3, p4); 
    dp4 = getVelocity(p4, p1);   

    //Moving by that velocity(split by x and y direction)
    p1[0] += dp1[0];
    p1[1] += dp1[1];

    p2[0] += dp2[0];
    p2[1] += dp2[1];

    p3[0] += dp3[0];
    p3[1] += dp3[1]; 

    p4[0] += dp4[0];
    p4[1] += dp4[1];

    length += Math.sqrt(Math.pow(dp1[0], 2) + Math.pow(dp1[1], 2));
  }

  //Complete path until point is standing still
  for(let i = 0; i < 100*N; i ++) {
    updatePosition();
    if(dp1[0] === 0 && dp1[1] === 0) {
      console.log("Traveled" + length + "m")
      break;
    }
  }

  //Draws arrow from point 1 to point 2
  function canvasArrow(ctx: CanvasRenderingContext2D, p1: number[], p2: number[]) { 
    const HEAD_LENGTH = 10; // length of head in pixels

    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const angle = Math.atan2(dy, dx);

    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p2[0] - HEAD_LENGTH * Math.cos(angle - Math.PI / 6), p2[1] - HEAD_LENGTH * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(p2[0], p2[1]);
    ctx.lineTo(p2[0] - HEAD_LENGTH * Math.cos(angle + Math.PI / 6), p2[1] - HEAD_LENGTH * Math.sin(angle + Math.PI / 6));
  }

  function getVelocity(point1: number[], point2: number[]): number[] {

    //Canceling out if at somewhat same point
    if(Math.abs(point2[0] - point1[0]) < 0.001 && Math.abs(point2[1] - point1[1]) < 0.001) return [0, 0];

    //Angle is computed using arctangent delta x over delta y
    let angle: number = Math.atan((point2[0]-point1[0])/(point2[1]-point1[1]));

    //Computing components of hyptonuse
    let dx: number = Math.sin(angle) * STEP_SIZE;
    let dy: number = Math.cos(angle) * STEP_SIZE;

    //Straight Down
    if(point2[1] < point1[1] && point2[0] - point1[0] === 0) {
      dy = -dy;
    }

    //Third Quadrant
    if(point2[0] < point1[0] && point2[1] < point1[1]) { 
      dx = -dx;
      dy = -dy;
    }

    //Fourth Quadrant
    if(point2[0] > point1[0] && point2[1] < point1[1]) { 
      dx = -dx;
      dy = -dy;
    }

    return [dx, dy];
  }


  let time = 0;
  function drawFigure() {
    time += 1000/FPS; 
    let currentIndex = Math.floor((time/1000)/TIME_PER_STEP); //Getting what the position should be after time milliseconds
    if(currentIndex > trackPositions.length) {
      dogAnimation.stop();
      console.log("The dogs reached the center after", time + "ms")
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d')  

    if(canvas !== null && ctx !== null && ctx !== undefined) {
      if(!tracePath) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      drawGrid(ctx, canvas);
      if(typeof trackPositions[currentIndex] !== 'undefined'){
        drawDogBall(ctx, canvas, trackPositions[currentIndex][0], trackPositions[currentIndex][1]); //Dog 1
        drawDogBall(ctx, canvas, trackPositions[currentIndex][1], trackPositions[currentIndex][2]); //Dog 2
        drawDogBall(ctx, canvas, trackPositions[currentIndex][2], trackPositions[currentIndex][3]); //Dog 3
        drawDogBall(ctx, canvas, trackPositions[currentIndex][3], trackPositions[currentIndex][0]); //Dog 4
      }
    }
  }
  const dogAnimation = new ImprovedSetInterval(drawFigure, 1000/FPS);
  dogAnimation.start();


  function drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.width)
    ctx.lineTo(canvas.width, canvas.width)
    ctx.lineTo(canvas.width, 0)
    ctx.lineTo(0, 0)
    ctx.stroke();
  }

  const dogImage = new Image();
  dogImage.src = `./dog.png`;
  function drawDogBall(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, p1: number[], p2: number[]) {
    if(!tracePath) {
      ctx.drawImage(dogImage, p1[0]*RESCALE_FACTOR, p1[1]*RESCALE_FACTOR, 50, 50);
    }

    ctx.beginPath();
    ctx.arc(p1[0]*RESCALE_FACTOR, p1[1]*RESCALE_FACTOR, SQUARE_WIDTH, 0, 2 * Math.PI);
    ctx.stroke();

    if(showArrows) {
      ctx.beginPath();
      canvasArrow(ctx, mathToCanvas(p1), mathToCanvas(p2));
      ctx.stroke();
    }
  }

  //Takes in point, and gives coordiantes ready for canvas to render
  function mathToCanvas(point: number[]): number[] {
    let rescaledPoint = [...point];
    rescaledPoint[0] *= RESCALE_FACTOR
    rescaledPoint[1] *= RESCALE_FACTOR

    return rescaledPoint;
  }
    
  return (
      <>
      <label htmlFor="n">Choose To render N steps: </label>
      <input type="number" defaultValue="100"/>
      <label htmlFor="velocity">Choose Velocity (m/s): </label>
      <input type="number" defaultValue="2"/>
      <label htmlFor="size">Choose Square Size (m): </label>
      <input type="number" defaultValue="1000"/>
      <label htmlFor="showArrow">Show Arrow: </label>
      <input type="checkBox" defaultValue="1000"/>
      <label htmlFor="showPath">Show Path:  </label>
      <input type="checkBox" defaultValue="1000"/>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_WIDTH}/>
      </>
  )
}

export default Coordinates



//CODE I'M NOT CURRENTLY USING BUT MIGHT COME BACK TO LATER ON =================================================================
  // const canvas = canvasRef.current;
  // const ctx = canvas?.getContext('2d');  
  // contextRef.current = ctx as null;

  // console.log("Test 1 - Straight Down", [0, 9.8], [0.2, 0], getVelocity([0, 9.8], [0.2, 0]));
  // console.log("Test 2 - Straight Right", [0, 0], [10, 0], getVelocity([0, 0], [10, 0]));
  // console.log("Test 3 - Straight Left", [10, 0], [0, 0], getVelocity([10, 0], [0, 0]));
  // console.log("Test 4 - Straight Up", [0, 0], [0, 10], getVelocity([0, 0], [0, 10]));

  // console.log("Test 5 - Quadrant 1", [0, 0], [1, 1], getVelocity([0, 0], [1, 1]));
  // console.log("Test 6 - Quadrant 2", [0, 0], [-1, 1], getVelocity([0, 0], [-1, 1]));
  // console.log("Test 7 - Quadrant 3", [10, 10], [0, 8], getVelocity([10, 10], [0, 8]));
  // console.log("Test 8 - Quadrant 4", [2, 2], [5, 1], getVelocity([2, 2], [5, 1]));
