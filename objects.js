function Ball(x, y, radius, speed) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.speed = speed;
  
  this.move = function() {
    this.x -= this.speed;
  }
  
  this.intersectLine = function(ax, ay, bx, by, len) {
    var x1 = ax - this.x;
    var x2 = bx - this.x;
    var y1 = ay - this.y;
    var y2 = by - this.y;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dr = sqrt(dx * dx + dy * dy);
    var D  = x1 * y2 - x2 * y1;
    var delta = this.radius * this.radius * dr * dr - D * D;
    var px1   = this.x + (D * dy + signe(dy) * dx * sqrt(delta)) / (dr * dr);
    var py1   = this.y + (-D * dx + abs(dy) * sqrt(delta)) / (dr * dr);
    var px2   = this.x + (D * dy - signe(dy) * dx * sqrt(delta)) / (dr * dr);
    var py2   = this.y + (-D * dx - abs(dy) * sqrt(delta)) / (dr * dr);
    
    var x, y;
    
    if (dist(ax, ay, px1, py1) < dist(ax, ay, px2, py2)) {
      x = px1;
      y = py1;
    } else {
      x = px2;
      y = py2;
    }
    
    if (delta >= 0 && dist(x, y, ax, ay) < len) {
      var v1 = createVector(bx - ax, by - ay);
      var v2 = createVector(x - ax, y - ay);
      if (int(atan2(v2.y, v2.x) - atan2(v1.y, v1.x)) == 0) {
        return createVector(x, y);
      }
    }
    return false;
  }
  
  this.show = function() {
    ellipse(this.x, this.y, 2 * this.radius);
  }
}

function Rocket(x, y, speed, orientation) {
  this.x = x;
  this.y = y;
  this.w = 50;
  this.h = 25;
  this.speed = speed;
  this.orientation = orientation;
  
  this.move = function() {
    this.x += this.speed * cos(this.orientation);
    this.y += this.speed * sin(this.orientation);
  }
  
  this.getView = function(show) {
    // -90; -75; -60; -45; -30; -15; 0; 15; 30; 45; 60; 75; 90;
    var start = -90;
    var end   =  90;
    var step  =  15;
    var len   =  1000;
    var outputs = [];
    
    // Position of the point on the middle of the segment of the front of the rocket.
    var x = this.x + this.w * cos(this.orientation) - (this.h / 2) * sin(this.orientation);
    var y = this.y + this.w * sin(this.orientation) + (this.h / 2) * cos(this.orientation);
    
    for (var angle = start; angle <= end; angle += step) {
      var px = x + len * cos(this.orientation + angle);
      var py = y + len * sin(this.orientation + angle);
      if (show) {
        stroke(0);
        line(x, y, px, py);
      }
      
      var put;
      for (var i = 0; i < balls.length; i++) {
        put = false;
        var answer = balls[i].intersectLine(x, y, px, py, len);
        if (answer instanceof p5.Vector) {
          if (show) {
            fill(0, 0, 255);
            ellipse(answer.x, answer.y, 5);
          }
          outputs.push(map(dist(x, y, answer.x, answer.y), 0, dist(x, y, px, py), -1, 1));
          put = true;
          break;
        } else {
          if (show) {
            fill(0, 0, 255);
            ellipse(px, py, 5);
          }
        }
      }
      if (!put) {
       outputs.push(5);
      }
    }
    
    return outputs;
  }
  
  this.collides = function(ball) {
    var xa = this.x;
    var ya = this.y;
    var xb = this.x + this.w * cos(this.orientation);
    var yb = this.y + this.w * sin(this.orientation);
    var xc = xb     - this.h * sin(this.orientation);
    var yc = yb     + this.h * cos(this.orientation);
    var xd = xa     - this.h * sin(this.orientation);
    var yd = ya     + this.h * cos(this.orientation);
    
    var sx = ball.x;
    var sy = ball.y;
    var r  = ball.radius;
    
    if (pointIsInCircle(sx, sy, r, xa, ya) || pointIsInCircle(sx, sy, r, xb, yb) || pointIsInCircle(sx, sy, r, xc, yc) || pointIsInCircle(sx, sy, r, xd, yd)) {
      return true;
    }
    return false;
  }
  
  this.show = function() {
    push();
    translate(this.x, this.y);
    rotate(this.orientation);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

function pointIsInCircle(cx, cy, r, px, py) {
  if (px > cx - r && px < cx + r && py > cy - r && py < cy + r) {
    return true;
  }
  return false;
}

function signe(x) {
  if (x < 0) return - 1;
  return 1;
}














//