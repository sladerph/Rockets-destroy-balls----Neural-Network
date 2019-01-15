var population = [];
var pop_size   = 100;
var mutation_rate = 0.1;
var max_mutation = 0.5;

var gen = 0;

var nb_inputs  = 13 + 3;
var nb_hidden  = [10, 10];
var nb_outputs = 2;

var best_player;
var best_gen    = 0;
var best_scores = [];

var current_seed = "aaaaaaaaa";

function evolution() {
  var mating_pool = [];
  var maxi = -10000;
  var mini =  10000;
  
  console.log("Processing the natural evolution...");
  
  for (var i = 0; i < pop_size; i++) {
    if (population[i].fitness > maxi) {
      maxi = population[i].fitness;
    }
    if (population[i].fitness < mini) {
      mini = population[i].fitness;
    }
  }
  
  // Creating the mating pool proportionnaly to the fitness of each player.
  for (i = 0; i < pop_size; i++) {
    var nb = map(population[i].fitness, mini, maxi, 0, 100)
    for (var j = 0; j < nb; j++) {
      mating_pool.push(population[i]);
    }
  }
  
  // Doing the crossover.
  console.log("Creating the children...");
  
  var new_pop = [];
  
  while (new_pop.length < pop_size) {
    var parent_a = population[floor(random(0, pop_size))];
    var parent_b = population[floor(random(0, pop_size))];
    
    var child    = crossover(parent_a, parent_b);
    new_pop.push(child);
  }
  
  for (i = 0; i < new_pop.length; i++) {
    new_pop[i].brain.weights.map(mutate);
  }
  var mat = matrixFromArray(best_player.brain.weights);
  var cpy = mat.copy();
  new_pop[0].brain.weights = matrixToArray(cpy);
  
  new_pop[1] = new AI();
  
  // The population has been reset.
  population = new_pop;
  
  console.log("The new population is ready !");
}

function crossover(a, b) {
  var len = a.brain.weights.length;
  for (var p = 0; p < len; p++) {
    var arr_a = matrixToArray(a.brain.weights[p]);
    var w_a = a.brain.weights[p].copy();
    var w_b = b.brain.weights[p].copy();

    var k = 0;

    var rand = floor(random(1, arr_a.length));
    for (var i = 0; i < w_a.rows; i++) {
      for (var j = 0; j < w_a.cols; j++) {
        if (k < rand) {
          var temp = w_a.data[i][j];
          w_a.data[i][j] = w_b.data[i][j];
          w_b.data[i][j] = temp;
          k++;
        }
      }
    }
  }

  var child = new AI();
  
  len = a.brain.weights.length;
  if (floor(random(0, 2)) === 0) {
    for (p = 0; p < len; p++) {
       child.brain.weights[p] = a.brain.weights[p].copy();
    }
  } else {
    for (p = 0; p < len; p++) {
       child.brain.weights[p] = b.brain.weights[p].copy();
    }
  }

  return child;
}

function simulatePopulation() {
  console.log("Generation", gen);
  console.log("Simulating...");
  
  for (var i = 0; i < pop_size; i++) {
    console.log(i + 1, "/", pop_size);
    Math.seedrandom(current_seed);
    population[i].makeSimulation();
  }
  
  console.log("Simulation done !");
}

function initializePopulation() {
  for (var i = 0; i < pop_size; i++) {
    population.push(new AI());
  }
}

function mutate(x) {
  var rand = Math.random();
  var nx = x;
  if (rand <= mutation_rate) {
    nx += random(-max_mutation, max_mutation);
    console.log("# MUTATION #");
  }
  return nx;
}

function AI() {
  this.brain = new NeuralNetwork(nb_inputs, nb_hidden, nb_outputs);
  
  for (var i = 0; i < this.brain.weights.length; i++) {
    this.brain.weights[i].randomize(-1, 1);
  }
  
  this.fitness = 0;
  this.score = 0;
  
  this.destroyed = 0;
  this.hit       = 0;
  this.rocket_t  = 0;
  
  this.nb_balls = 50;
  
  this.makeSimulation = function() {
    balls   = [];
    rockets = [];
    
    while(this.nb_balls > 0 || balls.length > 0) { // While there are balls to be spawned.
      if (balls.length > 0) {
        if (balls[balls.length - 1].x < screen_w - 200 && this.nb_balls > 0) {
          createBall();
          this.nb_balls--;
        }
      } else if (this.nb_balls > 0) {
        createBall();
        this.nb_balls--;
      }
      
      if (this.rocket_t > 100) {
        // createRocket();
        this.rocket_t = 0;
      } else {
        this.rocket_t++;
      }
    
      this.updateBalls();
      sortBalls();
      this.updateRockets();
    }
    
    // Simulation is done. Cheching if the player is now the best player.
    this.fitness = this.score;
    
    if (best_player) { // There is a best player.
      if (this.fitness > best_player.fitness) {
        best_player = this;
        best_gen    = gen;
        console.log("There is a new BEST player !");
        best_scores = [];
      }
    } else { // There is no best player for now.
      best_player = this;
      best_gen    = gen;
      console.log("There is now a BEST player !");
    }
  }
  
  this.updateBalls = function() {
    for (var i = 0; i < balls.length; i++) {
      
      balls[i].move();
      
      if (balls[i].x < 200 + balls[i].radius) {
        balls.splice(i, 1);
        this.hit++;
        this.score -= 10;
        i--;
      }
    }
  }
  
  this.updateRockets = function() {
    for (var i = 0; i < rockets.length; i++) {
      
      // Setting the inputs.
      var inputs = [];
      inputs = rockets[i].getView(false);
      inputs.push(map(rockets[i].x, 0, screen_w, -1, 1));
      inputs.push(map(rockets[i].y, 0, screen_h, -1, 1));
      inputs.push(map(rockets[i].orientation, -180, 180, -1, 1));
      
      // Getting the outputs.
      var outputs = this.brain.feedForward(inputs);
      
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
      
      var touched = false;
      for (j = 0; j < balls.length; j++) {
        if (rockets[i].collides(balls[j])) {
          this.destroyed++;
          this.score += 5;
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
}

function sortBalls() {
  var a = balls[0];
  var ok = false;
  while (!ok) {
    ok = true;
    for (var i = 0; i < balls.length - 1; i++) {
      if (balls[i].x > balls[i + 1].x) {
        var tmp = balls[i];
        balls[i] = balls[i + 1];
        balls[i + 1] = tmp;
        ok = false;
      }
    }
  }
}









//

