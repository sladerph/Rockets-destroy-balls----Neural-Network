var screen_w = 1800;
var screen_h = 800;

var balls   = [];
var rockets = [];

var col_green;
var col_red;

var rocket_t  = 0;
var destroyed = 0;
var hit       = 0;
var max_balls = 50;
var score     = 0;

var display = false;
var show_inputs = true;

function setup() {
  createCanvas(screen_w, screen_h);
  
  col_green = color(0, 255, 0);
  col_red   = color(255, 0, 0);
  
  angleMode(DEGREES);
  frameRate(200);
  
  initializePopulation();
}

function draw() {
  background(200);
  
  if (!display) {
    gen++;
    simulatePopulation();
    
    evolution();
    
    display   = true;
    max_balls = 50;
    score     = 0;
    balls     = [];
    rockets   = [];
    rocket_t  = 0;
    createBall();
    max_balls--;
    console.log("Showing best player (generation", best_gen, "/", gen, ").");
    Math.seedrandom(current_seed);
  } else {
    
    if (max_balls > 0 || balls.length > 0) {
      if (balls.length === 0 && max_balls > 0) {
        createBall();
        max_balls--;
      }
      if (balls[balls.length - 1].x < screen_w - 200 && max_balls > 0) {
        createBall();
        max_balls--;
      }
      
      if (rocket_t > 100) {
        // createRocket();
        rocket_t = 0;
      } else {
        rocket_t++;
      }
      
      stroke(0);
      line(200, 0, 200, screen_h);
      
      updateBalls();
      sortBalls();
      
      updateRockets();
      
      showRocketLauncher();
      
      fill(255, 255, 0);
      stroke(255, 255, 0);
      textSize(32);
      text("Score : " + score, screen_w / 2, 100);
      
    } else {
      display = false;
      updateSeed();
      testBestPlayer();
    }
	}
}

function createBall() {
  var r = random(25, 50);
  var y = random(r, screen_h - r);
  var s = random(2, 4);
  
  balls.push(new Ball(screen_w, y, r, s));
  
  createRocket();
}

function showRocketLauncher() {
  fill(0);
  rect(0 , screen_h / 2 - 50, 50, 100);
  rect(50, screen_h / 2 - 25, 40, 50);
}

function updateRockets() {
  for (var i = 0; i < rockets.length; i++) {
    // Setting the inputs.
    var inputs = [];
    inputs = rockets[i].getView(show_inputs);
    inputs.push(map(rockets[i].x, 0, screen_w, -1, 1));
    inputs.push(map(rockets[i].y, 0, screen_h, -1, 1));
    inputs.push(map(rockets[i].orientation, -180, 180, -1, 1));
    
    // Getting the outputs.
    var outputs = best_player.brain.feedForward(inputs);
    
    if (outputs[0] > 0.5) { // Go up.
      rockets[i].orientation -= 5;
      if (rockets[i].orientation < -180) {
        rockets[i].orientation = 180;
      }
    }
    if (outputs[1] > 0.5) { // Go down.
      rockets[i].orientation += 5;
      if (rockets[i].orientation > 180) {
        rockets[i].orientation = -180;
      }
    }
    
    rockets[i].move();
    fill(col_red);
    rockets[i].show();
    
    var touched = false;
    for (var j = 0; j < balls.length; j++) {
      if (rockets[i].collides(balls[j])) {
        destroyed++;
        score += 5;
        balls.splice(j, 1);
        rockets.splice(i, 1);
        i--;
        touched = true;
        break;
      }
    }
    
    if (touched) break;
    
    if (rockets[i].x > screen_w || rockets[i].y < 0 || rockets[i].y > screen_h) {
      rockets.splice(i, 1);
      i--;
    }
  }
}

function updateBalls() {
    for (var i = 0; i < balls.length; i++) {
    var val = (balls[i].x) / (screen_w - balls[i].radius);
    var col = lerpColor(col_red, col_green, val);
    fill(col);
    stroke(0);
    
    balls[i].move();
    balls[i].show();
    
    if (balls[i].x < 200 + balls[i].radius) {
      balls.splice(i, 1);
      hit++;
      score -= 10;
      i--;
    }
  }
}

function createRocket() {
  var x = 50;
  var y = screen_h / 2 - 25;
  rockets.push(new Rocket(x, y, 5, 0));
}

function updateSeed() {
  current_seed = ((parseInt(current_seed, 36)+1).toString(36)).replace(/0/g,'a');
}

function testBestPlayer() {
  best_scores.push(score);
  if (best_scores.length > 20) {
    best_scores.splice(0, 1);
  }
  
  var tot = 0;
  for (var i = 0; i < best_scores.length; i++) {
    tot += best_scores[i];
  }
  tot /= best_scores.length;
  
  console.log("Best player fitness :", best_player.fitness);
  console.log("Average fitness of best player after", best_scores.length, "simulations :", tot);
  
  if (tot < best_player.fitness) {
    console.log("Punishing best player !");
    best_player.fitness -= abs((tot - best_player.fitness) / 2);
  } else if (tot > best_player.fitness) {
    console.log("Rewarding best player !");
    best_player.fitness += abs((tot - best_player.fitness) / 2);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    rockets[0].orientation -= 10;
  } else if (keyCode === DOWN_ARROW) {
    rockets[0].orientation += 10;
  }
}




















//