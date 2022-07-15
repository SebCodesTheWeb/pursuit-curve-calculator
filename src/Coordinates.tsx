import { useRef, useState, useEffect } from 'react'
import ImprovedSetInterval from "./AccurateTimer"

import {
    Input,
    Button,
    Checkbox,
    Text,
    Stack,
    HStack,
    Heading,
    Link,
  } from '@chakra-ui/react'

function Coordinates() {
  const SQUARE_WIDTH: number = 1; //Distance between dogs
  const [N, setN] = useState(1000);
  const [VELOCITY, setVELOCITY] = useState(1);
  const [showArrows, setShowArrows] = useState(false);
  const [tracePath, setTracePath] = useState(false);
  const [timeOfPursuit, setTimeOfPursuit] = useState(0);
  const [lengthOfPursuit, setLengthOfPursuit] = useState(0);
  const [CANVAS_WIDTH, setCANVAS_WIDTH] = useState(500);

function onChangeN(event: any) {
    setN(event.target.value);
  }
function onChangeVelocity(event: any) {
    setVELOCITY(event.target.value);
  }
function onChangeArrows(event: any) {
    setShowArrows(event.target.checked);
  }
function onChangeTracePath(event: any) {
    setTracePath(event.target.checked);
  }
function onViewportResize() {
    let width = 750;
    if(window.innerWidth < 1300) width=500
    if(window.innerWidth < 992) width=400
    if(window.innerWidth < 450) width=300
    setCANVAS_WIDTH(width)
  }

  useEffect(() => {
    window.addEventListener("resize", onViewportResize);
    return () => window.removeEventListener("resize", onViewportResize);
  });

  const STEP_SIZE = SQUARE_WIDTH / N;
  const TIME_PER_STEP = (SQUARE_WIDTH/N) / VELOCITY;
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
  
  function updatePosition () {
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

  const dogAnimation = new ImprovedSetInterval(drawFigure, 1000/FPS);
  function startPursuit() {
    time = 0;

    //Clearing old animation
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d')  
    if(canvas !== null && ctx !== null && ctx !== undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    dogAnimation.start();
    for(let i = 0; i < 100*N; i ++) {
      updatePosition();
      if(dp1[0] === 0 && dp1[1] === 0) {
        setLengthOfPursuit(length);
        break;
      }
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
    setTimeOfPursuit(time);
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
      <Stack 
        h={{ base: 'full', lg: '100vh' }} 
        w="full" 
        align="center" 
        direction={{ base: 'column', lg: 'row' }} 
        spacing={ 8 } 
        p={ 8 }
        justify="center" 
        bgColor=""
      >
        <Stack spacing={ 4 }>
          <Stack spacing={ 4 } border="1px solid black" p={ 4 } borderRadius="10px">
            <Heading>Setup Computation: </Heading>
            <Text>Choose To render N steps: (atleast 1000) </Text>
            <Input defaultValue="1000" onChange={ onChangeN }/>
            <Text>Choose Velocity (m/s): (try numbers below 1)</Text>
            <Input defaultValue="1" onChange={ onChangeVelocity}/>
            <HStack>
              <Text>Show Arrow: </Text>
              <Checkbox defaultValue="false" onChange={ onChangeArrows }/>
            </HStack>
            <HStack>
              <Text>Show Path:  </Text>
              <Checkbox defaultValue="false" onChange={ onChangeTracePath }/>
            </HStack>
            <Button onClick={ startPursuit }>Start</Button>
          </Stack>
          <Stack border="1px solid black" p={ 4 } spacing={ 4 } borderRadius="10px" display={{ base: "none", lg: "initial"}}>
            <Heading size="md">Distance dog ran: { lengthOfPursuit.toFixed(5) }m</Heading>
            <Heading size="md">Time it took: { timeOfPursuit.toFixed(5) }ms</Heading>
          </Stack>
          <Stack border="1px solid black" p={ 4 } borderRadius="10px" spacing={ 4 } display={{ base: "none", lg: "initial"}}>
            <Link href="https://github.com/SebCodesTheWeb/pursuit-curve-calculator">Github</Link>
          </Stack>
        </Stack>
        <Stack>
          <canvas ref={canvasRef} style={{border: '1px solid black'}} width={ CANVAS_WIDTH } height={ CANVAS_WIDTH } />
          <Text>The side length of the square is 1 meter</Text>
        </Stack>
          <Stack border="1px solid black" p={ 4 } spacing={ 4 } borderRadius="10px" display={{ base: "initial", lg: "none"}} >
            <Heading size="md">Distance dog ran: { lengthOfPursuit.toFixed(5) }m</Heading>
            <Heading size="md">Time it took: { timeOfPursuit.toFixed(5) }ms</Heading>
          </Stack>
          <Stack border="1px solid black" p={ 4 } borderRadius="10px" spacing={ 4 } display={{ base: "initial", lg: "none"}} >
            <Link href="https://github.com/SebCodesTheWeb/pursuit-curve-calculator">Github</Link>
          </Stack>
      </Stack>
  )
}

export default Coordinates
