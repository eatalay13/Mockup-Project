(function() {
  
  "use strict";
  
  function getContour(bezier, tolerance) {
    
    if (tolerance == null) {
      tolerance = 1;
    }
    
    var size  = bezier.length;
    var first = bezier[0];
    var last  = bezier[size - 1];    
    var prev  = first;
    
    var x0 = first.x;
    var y0 = first.y;

    var points = [first];
    var coords = [first.x, first.y];  
    
    for (var i = 1; i < size; i += 3) {
    
      var p1 = prev;
      var p2 = bezier[i];
      var p3 = bezier[i+1];
      var p4 = bezier[i+2];
      
      addPoint(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
      prev = p4;
    } 

    points.push(last);
    coords.push(last.x, last.y);
    
    return points;
    
    function addPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
    
      // Calculate all the mid-points of the line segments
      var x12 = (x1 + x2) / 2;
      var y12 = (y1 + y2) / 2;
      var x23 = (x2 + x3) / 2;
      var y23 = (y2 + y3) / 2;
      var x34 = (x3 + x4) / 2;
      var y34 = (y3 + y4) / 2;

      var x123  = (x12 + x23) / 2;
      var y123  = (y12 + y23) / 2;
      var x234  = (x23 + x34) / 2;
      var y234  = (y23 + y34) / 2;
      var x1234 = (x123 + x234) / 2;
      var y1234 = (y123 + y234) / 2;

      // Try to approximate the full cubic curve by a single straight line
      var dx = x4 - x1;
      var dy = y4 - y1;

      var d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx));
      var d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx));

      if ((d2 + d3) * (d2 + d3) < tolerance * (dx * dx + dy * dy)) {
        points.push({ x: x1234, y: y1234 });    
        coords.push(x1234, y1234); 
        return;
      }

      // Continue subdivision
      addPoint(x1, y1, x12, y12, x123, y123, x1234, y1234);
      addPoint(x1234, y1234, x234, y234, x34, y34, x4, y4);    
    }
  }  
  
  window.getContour = getContour;
})();

